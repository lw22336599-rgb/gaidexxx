/**
 * Frida 服务器管理模块
 * 用于管理 iOS 设备上的 Frida 注入和流量拦截
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const { Client } = require('ssh2');
const { existsSync } = require('fs');

// 导入 start_frida_v4.js（CommonJS 模块）
const { CONFIG: FridaConfig, main: startFridaMain } = require('./start_frida_v4');

/**
 * 获取 Frida 脚本路径（兼容开发和打包后环境）
 * @param {string} scriptName - 脚本文件名
 * @returns {string} 脚本完整路径
 */
function getFridaScriptPath(scriptName) {
  // 开发环境：frida-scripts 在项目根目录
  let scriptPath = path.join(__dirname, '../frida-scripts', scriptName);

  // 打包后：检查是否在 asar 中，如果是则使用 .asar.unpacked 路径
  if (scriptPath.includes('.asar')) {
    scriptPath = scriptPath.replace('app.asar', 'app.asar.unpacked');
  }

  // 验证文件是否存在
  if (!existsSync(scriptPath)) {
    console.error(`[Frida] 脚本文件不存在: ${scriptPath}`);
    // 尝试备用路径（使用 process.resourcesPath）
    if (process.resourcesPath) {
      const altPath = path.join(process.resourcesPath, 'app.asar.unpacked/frida-scripts', scriptName);
      if (existsSync(altPath)) {
        console.log(`[Frida] 使用备用路径: ${altPath}`);
        return altPath;
      }
    }
  }

  console.log(`[Frida] 脚本路径: ${scriptPath}`);
  return scriptPath;
}

let fridaProcess = null;
let mainWindow = null;
const multipartLogCache = {};

// Windows 下 frida 工具的完整路径
function getFridaCommand(cmd) {
  if (process.platform === 'win32') {
    try {
      const pythonPath = execSync('python -c "import sys; import os; print(os.path.join(os.path.dirname(sys.executable), \'Scripts\'))"', { encoding: 'utf8' }).trim();
      const fullPath = path.join(pythonPath, `${cmd}.exe`);
      if (existsSync(fullPath)) {
        return fullPath;
      }
      console.log(`[Frida] 未在 ${pythonPath} 找到 ${cmd}.exe`);
    } catch (e) {
      console.log(`[Frida] 获取 Python Scripts 路径失败: ${e.message}`);
    }
  }
  return cmd;
}

// 检查 Frida 工具是否可用
function checkFridaInstallation() {
  const command = getFridaCommand('frida-ps');
  try {
    if (process.platform === 'win32' && !command.includes('\\')) {
      // 如果返回的只是命令名，说明没有找到完整路径，需要进一步检查
      try {
        execSync('python --version', { encoding: 'utf8', stdio: 'pipe' });
      } catch (e) {
        return {
          installed: false,
          error: 'Python 未安装或未添加到系统 PATH。\n\n请先安装 Python：\n1. 访问 https://www.python.org/downloads/\n2. 下载并安装 Python（安装时勾选 "Add Python to PATH"）'
        };
      }

      // 检查 frida-tools 是否安装
      try {
        execSync('pip show frida-tools', { encoding: 'utf8', stdio: 'pipe' });
      } catch (e) {
        return {
          installed: false,
          error: 'Frida 工具未安装。\n\n请在命令行执行：\npip install frida-tools\n\n如果安装失败，可以尝试：\npip install frida-tools -i https://pypi.tuna.tsinghua.edu.cn/simple'
        };
      }

      // 检查 frida-ps 命令是否可用
      try {
        execSync(`${command} --version`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (e) {
        return {
          installed: false,
          error: 'Frida 工具已安装但无法执行。\n\n可能的原因：\n1. Python Scripts 目录未添加到系统 PATH\n2. 需要重启应用或重新登录系统\n\n解决方法：\n1. 将 Python Scripts 目录添加到系统环境变量 PATH\n2. 重启极狐助手'
        };
      }
    }

    return { installed: true };
  } catch (e) {
    return {
      installed: false,
      error: `Frida 工具检查失败：${e.message}`
    };
  }
}

// Windows 下 Frida 子进程 stdout 常为 GBK，需按 GBK 解码避免中文乱码
function decodeFrida(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (process.platform === 'win32') {
    try {
      const iconv = require('iconv-lite');
      return iconv.decode(b, 'gbk');
    } catch (e) {
      return b.toString('utf8');
    }
  }
  return b.toString('utf8');
}

/**
 * 检查 frida-server 是否运行，如果未运行则自动启动
 * @param {string} host - 设备 IP
 * @param {string|number} port - Frida 端口
 * @returns {Promise<{running: boolean, autoStarted: boolean, error?: string}>}
 */
async function checkAndStartFridaServer(host, port) {
  return new Promise(async (resolve) => {
    // 首先检查 Frida 工具是否安装
    const installCheck = checkFridaInstallation();
    if (!installCheck.installed) {
      console.log('[检查服务] Frida 工具未正确安装');
      sendFridaLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      sendFridaLog('❌ Frida 工具未正确安装');
      sendFridaLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      sendFridaLog(installCheck.error);
      resolve({ running: false, autoStarted: false, error: installCheck.error });
      return;
    }

    console.log('[检查服务] 检测 frida-server 是否运行...');
    sendFridaLog('正在检测 frida-server 是否运行...');

    const command = getFridaCommand('frida-ps');
    const args = ['-H', `${host}:${port}`, '-ai'];
    const child = spawn(command, args);

    let output = '';
    let error = '';

    child.stdout.on('data', (d) => { output += decodeFrida(d); });
    child.stderr.on('data', (d) => { error += decodeFrida(d); });

    child.on('close', async (code) => {
      if (code !== 0) {
        // 打印详细的错误信息
        console.log('[frida-ps] 执行失败');
        console.log('[frida-ps] 退出码:', code);
        console.log('[frida-ps] 错误输出:', error);
        console.log('[frida-ps] 标准输出:', output);

        // 检查错误输出或标准输出中是否包含连接失败信息
        const allOutput = (error + output).toLowerCase();
        if (allOutput.includes('unable to connect') || allOutput.includes('failed to connect') ||
          allOutput.includes('connection refused') || allOutput.includes('timed out')) {
          console.log('[自动启动] 检测到 frida-server 未运行，尝试自动启动...');
          sendFridaLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          sendFridaLog('⚠️  检测到 frida-server 未运行');
          sendFridaLog('正在自动启动 frida-server...');
          sendFridaLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          try {
            // 直接调用 start_frida_v4.js 的 main() 函数（完整的测试可用代码）
            // 更新配置为用户输入的 IP 和端口
            FridaConfig.IP = host;
            FridaConfig.PORT = parseInt(port);

            // 直接调用 main() - 包含完整的启动、验证、重试逻辑
            console.log('[自动启动] 调用 start_frida_v4.js 的 main() 函数...');
            const exitCode = await startFridaMain();

            if (exitCode === 0) {
              sendFridaLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              sendFridaLog('✅ frida-server 启动成功！');
              sendFridaLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('[自动启动] 启动成功');
              resolve({ running: true, autoStarted: true });
            } else {
              sendFridaLog('❌ frida-server 启动失败');
              console.log('[自动启动] 启动失败，退出码:', exitCode);
              return resolve({
                running: false,
                autoStarted: false,
                error: `启动失败，退出码: ${exitCode}`
              });
            }

          } catch (err) {
            console.error('[自动启动] 失败:', err.message);
            sendFridaLog(`❌ 自动启动失败: ${err.message}`);
            return resolve({
              running: false,
              autoStarted: false,
              error: `自动启动失败: ${err.message}`
            });
          }
        } else {
          // 不是连接失败，可能是其他错误
          console.log('[检查服务] frida-ps 执行失败，但不是连接问题');
          sendFridaLog(`frida-ps 执行失败: ${error || '退出码 ' + code}`);
          return resolve({ running: false, autoStarted: false, error: error || `退出码 ${code}` });
        }
      } else {
        // frida-ps 执行成功，说明服务正在运行
        console.log('[检查服务] frida-server 正在运行');
        sendFridaLog('✅ frida-server 正在运行');
        resolve({ running: true, autoStarted: false });
      }
    });
  });
}

// 解析进程列表
function parseProcessList(output) {
  const lines = output.trim().split('\n');
  const processes = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 3) {
      processes.push({ pid: parts[0], name: parts[1], identifier: parts.slice(2).join(' ') });
    } else if (parts.length === 2) {
      processes.push({ pid: parts[0], name: parts[1], identifier: '' });
    }
  }
  return processes;
}

// 根据包名查找 PID
async function findPidByPackageName(host, port, packageName) {
  return new Promise((resolve, reject) => {
    const command = getFridaCommand('frida-ps');
    const args = ['-H', `${host}:${port}`, '-a'];
    const child = spawn(command, args);
    let output = '';
    let error = '';

    child.stdout.on('data', (d) => { output += decodeFrida(d); });
    child.stderr.on('data', (d) => { error += decodeFrida(d); });
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(error || `获取进程列表失败，退出码 ${code}`));
      }

      const processes = parseProcessList(output);
      const matched = processes.find(p => p.identifier === packageName);

      if (matched) {
        resolve(matched.pid);
      } else {
        reject(new Error(`未找到包名为 "${packageName}" 的进程`));
      }
    });
  });
}

// 模糊匹配查找进程（通过关键词）
async function findPidByFuzzyMatch(host, port, packageName) {
  return new Promise((resolve, reject) => {
    const command = getFridaCommand('frida-ps');
    const args = ['-H', `${host}:${port}`, '-a'];
    const child = spawn(command, args);
    let output = '';
    let error = '';

    child.stdout.on('data', (d) => { output += decodeFrida(d); });
    child.stderr.on('data', (d) => { error += decodeFrida(d); });
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(error || `获取进程列表失败，退出码 ${code}`));
      }

      const processes = parseProcessList(output);

      // 提取包名的关键词（如 com.meituan.itakeaway -> meituan, itakeaway, waimai）
      const keywords = ['meituan', 'waimai', '美团', '外卖'];

      // 查找包含关键词的进程
      const matched = processes.find(p => {
        const searchText = `${p.name} ${p.identifier}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
      });

      if (matched) {
        console.log(`[模糊匹配] 找到进程: ${matched.name} (${matched.identifier}), PID: ${matched.pid}`);
        sendFridaLog(`找到匹配进程: ${matched.name} (${matched.identifier})`);
        resolve(matched.pid);
      } else {
        reject(new Error(`未找到匹配的进程`));
      }
    });
  });
}

// 带重试机制的进程查找（支持模糊匹配）
async function findPidWithRetry(host, port, packageName, maxRetries = 15, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[进程查找] 第 ${i + 1}/${maxRetries} 次尝试...`);
      sendFridaLog(`第 ${i + 1}/${maxRetries} 次查找进程...`);

      const pid = await findPidByPackageName(host, port, packageName);
      console.log(`[进程查找] 成功找到 PID: ${pid}`);
      return pid;
    } catch (err) {
      console.log(`[进程查找] 第 ${i + 1} 次失败: ${err.message}`);

      // 尝试模糊匹配（如果是最后几次尝试）
      if (i >= maxRetries - 3) {
        try {
          console.log(`[进程查找] 尝试模糊匹配...`);
          sendFridaLog(`尝试模糊匹配进程名...`);

          const fuzzyPid = await findPidByFuzzyMatch(host, port, packageName);
          if (fuzzyPid) {
            console.log(`[进程查找] 通过模糊匹配找到 PID: ${fuzzyPid}`);
            return fuzzyPid;
          }
        } catch (fuzzyErr) {
          console.log(`[进程查找] 模糊匹配也失败: ${fuzzyErr.message}`);
        }
      }

      if (i < maxRetries - 1) {
        console.log(`[进程查找] 等待 ${delayMs / 1000} 秒后重试...`);
        sendFridaLog(`未找到进程，${delayMs / 1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // 最后一次失败，抛出错误
        throw err;
      }
    }
  }
}

// 通过 SSH 重启目标应用
async function killAndRestartApp(host, packageName, processName) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';

    conn.on('ready', () => {
      console.log(`[SSH] 正在重启应用: ${packageName} (进程名: ${processName})`);

      // 分步执行命令以便调试
      const killCommands = [
        // 方法1: 通过进程名 kill (如果提供了进程名)
        processName ? `killall -9 "${processName}" 2>/dev/null || true` : '',
        // 方法2: 通过 ps 查找包名对应的 PID 并 kill (不使用 awk，改用 cut)
        `ps aux | grep "${packageName}" | grep -v grep | while read line; do pid=$(echo "$line" | cut -d' ' -f2); kill -9 $pid 2>/dev/null; done || true`,
        // 等待 1 秒
        'sleep 1'
      ].filter(cmd => cmd).join(' && ');

      // 首先执行 kill 命令
      conn.exec(killCommands, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        let killOutput = '';
        stream.on('close', () => {
          console.log('[SSH] Kill 命令执行完成');

          // 直接提示手动启动（跳过自动启动尝试）
          const launchScript = `
echo "[提示] 已终止应用进程"
echo "[提示] 无法自动启动美团外卖，请手动启动"
exit 0
`;

          conn.exec(launchScript, (err2, stream2) => {
            if (err2) {
              conn.end();
              return reject(err2);
            }

            let launchOutput = '';
            let launchError = '';

            stream2.on('close', () => {
              conn.end();
              const fullOutput = killOutput + '\n' + launchOutput + '\n' + launchError;
              console.log(`[SSH] 完整输出:\n${fullOutput}`);
              resolve(fullOutput);
            }).on('data', (data) => {
              const text = data.toString();
              launchOutput += text;
              console.log(`[SSH输出] ${text.trim()}`);
            }).stderr.on('data', (data) => {
              const text = data.toString();
              launchError += text;
              console.log(`[SSH错误] ${text.trim()}`);
            });
          });

        }).on('data', (data) => {
          killOutput += data.toString();
        }).stderr.on('data', (data) => {
          killOutput += data.toString();
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host: host,
      port: 22,
      username: 'mobile',
      password: '11'
    });
  });
}

// 发送 Frida 日志到渲染进程
function sendFridaLog(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('frida-log', { message });
  }
}

// 处理 Frida stdout 日志并转换为 intercepted-data 格式
function handleFridaLog(logLine) {
  const t = logLine.trim();
  if (!t) return;

  // 处理简化日志格式
  if (t.startsWith('[HTTPLOG]')) {
    try {
      const logData = JSON.parse(t.slice('[HTTPLOG]'.length));

      // 解码Base64
      if (logData.encoding === 'base64') {
        try {
          const responseBody = Buffer.from(logData.responseBase64, 'base64').toString('utf8');
          const requestBody = logData.requestBodyBase64 ? Buffer.from(logData.requestBodyBase64, 'base64').toString('utf8') : '';

          // 验证是否是有效JSON
          try {
            JSON.parse(responseBody);
          } catch (jsonErr) {
            console.error('✗ 响应不是有效JSON，跳过:', logData.url.substring(0, 60));
            return;
          }

          // 转换为 intercepted-data 格式（兼容 SunnyNet）
          const interceptedData = {
            url: logData.url,
            statusCode: 200, // Frida 脚本未捕获状态码，默认 200
            body: responseBody,
            post: requestBody
          };

          // 发送到渲染进程
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('intercepted-data', interceptedData);
          }

          console.log(`✓ 转发: ${logData.method} ${logData.url.substring(0, 60)}... (${responseBody.length}字符)`);
        } catch (decodeErr) {
          console.error('✗ Base64解码失败:', decodeErr.message);
        }
      }
    } catch (e) {
      console.error('✗ 解析失败:', e.message);
    }
    return;
  }

  // 处理分块日志
  if (t.startsWith('[HTTPLOG_HEAD]')) {
    try {
      const headerData = JSON.parse(t.slice('[HTTPLOG_HEAD]'.length));
      multipartLogCache[headerData.id] = {
        header: headerData,
        chunks: new Array(headerData.totalChunks),
        receivedChunks: 0
      };
      console.log(`⬇ 开始接收: ${headerData.method} ${headerData.url.substring(0, 60)}... (${headerData.totalChunks}块)`);
    } catch (e) {
      console.error('✗ 解析HEAD失败:', e.message);
    }
    return;
  }

  if (t.startsWith('[HTTPLOG_CHUNK]')) {
    try {
      const chunkData = JSON.parse(t.slice('[HTTPLOG_CHUNK]'.length));
      const cache = multipartLogCache[chunkData.id];
      if (cache) {
        cache.chunks[chunkData.index] = chunkData.data;
        cache.receivedChunks++;

        if (cache.receivedChunks === cache.header.totalChunks) {
          // 合并所有Base64块并解码
          const fullResponseBase64 = cache.chunks.join('');
          const fullResponse = Buffer.from(fullResponseBase64, 'base64').toString('utf8');
          const requestBody = cache.header.requestBodyBase64 ? Buffer.from(cache.header.requestBodyBase64, 'base64').toString('utf8') : '';

          // 验证是否是有效JSON
          try {
            JSON.parse(fullResponse);
          } catch (jsonErr) {
            console.error('✗ 响应不是有效JSON，跳过:', cache.header.url.substring(0, 60));
            delete multipartLogCache[chunkData.id];
            return;
          }

          // 转换为 intercepted-data 格式
          const interceptedData = {
            url: cache.header.url,
            statusCode: 200,
            body: fullResponse,
            post: requestBody
          };

          // 发送到渲染进程
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('intercepted-data', interceptedData);
          }

          console.log(`✓ 合并完成并转发: ${cache.header.method} ${cache.header.url.substring(0, 60)}... (${fullResponse.length}字符)`);
          delete multipartLogCache[chunkData.id];
        }
      }
    } catch (e) {
      console.error('✗ 解析CHUNK失败:', e.message);
    }
    return;
  }

  // 其他日志直接转发
  sendFridaLog(t);
}

// 启动 Frida 注入
async function startInject(win, host, port) {
  mainWindow = win;
  const packageName = 'com.meituan.itakeaway';

  try {
    // 先停止现有的 Frida 进程
    if (fridaProcess) {
      fridaProcess.kill();
      fridaProcess = null;
      sendFridaLog('停止现有 Frida 进程');
    }

    // 检查并自动启动 frida-server
    const serverStatus = await checkAndStartFridaServer(host, port);
    if (!serverStatus.running) {
      throw new Error(serverStatus.error || 'frida-server 未运行且自动启动失败');
    }
    if (serverStatus.autoStarted) {
      console.log('[Frida注入] frida-server 已自动启动');
    }

    sendFridaLog(`正在查找应用进程: ${packageName}`);

    // 直接查找进程 PID
    let actualPid = null;
    try {
      actualPid = await findPidByPackageName(host, port, packageName);
      console.log(`[Frida注入] 找到运行中的进程 PID: ${actualPid}`);
      sendFridaLog(`找到运行中的进程 PID: ${actualPid}`);
    } catch (err) {
      console.log(`[Frida注入] 未找到运行中的进程: ${err.message}`);
      sendFridaLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      sendFridaLog(`⚠️  未找到【美团外卖】应用进程`);
      sendFridaLog(`⚠️  请在手机上打开【美团外卖】应用`);
      sendFridaLog(`系统将自动检测并注入（最多等待 30 秒）`);
      sendFridaLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // 等待 3 秒给用户时间看到提示
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 使用重试机制查找 PID（最多尝试 15 次，每次间隔 2 秒）
      actualPid = await findPidWithRetry(host, port, packageName, 15, 2000);
      console.log(`[Frida注入] 找到进程 PID: ${actualPid}`);
      sendFridaLog(`找到进程 PID: ${actualPid}`);
    }

    sendFridaLog(`开始注入...`);

    // 启动 Frida 注入
    const scriptPath = getFridaScriptPath('hook_ios_http.js');
    const fridaCmd = getFridaCommand('frida');
    console.log(`[Frida] 启动命令: ${fridaCmd} -H ${host}:${port} -p ${actualPid} -l ${scriptPath}`);

    const child = spawn(fridaCmd, ['-H', `${host}:${port}`, '-p', String(actualPid), '-l', scriptPath]);
    fridaProcess = child;
    let fridaLineBuffer = '';
    let hasError = false;

    child.stdout.on('data', (d) => {
      const text = decodeFrida(d);
      fridaLineBuffer += text;
      const parts = fridaLineBuffer.split(/\r?\n/);
      fridaLineBuffer = parts.pop() || '';

      for (const line of parts) {
        handleFridaLog(line);
      }
    });

    child.stderr.on('data', (d) => {
      const errorText = decodeFrida(d);
      console.error('[Frida stderr]:', errorText);
      hasError = true;
      sendFridaLog(`错误: ${errorText}`);
    });

    child.on('close', (code) => {
      console.log(`[Frida] 进程退出，code=${code}`);
      sendFridaLog(`Frida 已退出，code=${code}`);
      if (fridaProcess === child) fridaProcess = null;
    });

    child.on('error', (err) => {
      console.error('[Frida error]:', err.message);
      hasError = true;
      sendFridaLog(`错误: ${err.message}`);
      if (fridaProcess === child) fridaProcess = null;
    });

    // 延迟 500ms 检查是否立即失败
    await new Promise(resolve => setTimeout(resolve, 500));

    if (hasError || !fridaProcess) {
      throw new Error('Frida 启动失败');
    }

    console.log('[Frida] 注入成功');
    sendFridaLog('[Frida] 注入成功，开始监控网络请求...');

    return { success: true };
  } catch (err) {
    console.error(`[Frida] 注入失败: ${err.message}`);
    sendFridaLog(`注入失败: ${err.message}`);
    throw err;
  }
}

// 停止 Frida
function stop() {
  if (fridaProcess) {
    fridaProcess.kill();
    fridaProcess = null;
    console.log('[Frida] 已停止');
    sendFridaLog('[Frida] 已停止');
  }
  return { success: true };
}

// 重启应用并注入
async function startInjectWithRestart(win, host, port) {
  mainWindow = win;
  const packageName = 'com.meituan.itakeaway';

  try {
    // 先停止现有的 Frida 进程
    if (fridaProcess) {
      fridaProcess.kill();
      fridaProcess = null;
      sendFridaLog('停止现有 Frida 进程');
    }

    // 检查并自动启动 frida-server
    const serverStatus = await checkAndStartFridaServer(host, port);
    if (!serverStatus.running) {
      throw new Error(serverStatus.error || 'frida-server 未运行且自动启动失败');
    }
    if (serverStatus.autoStarted) {
      console.log('[Frida注入] frida-server 已自动启动');
    }

    sendFridaLog(`正在查找应用进程: ${packageName}`);

    // 先查找当前的进程名称（用于 kill）
    let processName = null;
    try {
      const command = getFridaCommand('frida-ps');
      const args = ['-H', `${host}:${port}`, '-a'];

      const processes = await new Promise((resolve, reject) => {
        const child = spawn(command, args);
        let output = '';
        let error = '';

        child.stdout.on('data', (d) => { output += decodeFrida(d); });
        child.stderr.on('data', (d) => { error += decodeFrida(d); });
        child.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(error || `获取进程列表失败，退出码 ${code}`));
          }
          resolve(parseProcessList(output));
        });
      });

      const matched = processes.find(p => p.identifier === packageName);
      if (matched) {
        processName = matched.name;
        console.log(`[重启注入] 找到进程名: ${processName}`);
        sendFridaLog(`找到进程名: ${processName}，正在重启应用...`);
      } else {
        console.log(`[重启注入] 未找到运行中的进程，将直接启动应用`);
        sendFridaLog(`应用未运行，将直接启动...`);
      }
    } catch (err) {
      console.log(`[重启注入] 查找进程失败: ${err.message}，将尝试直接重启`);
      sendFridaLog(`查找进程失败，尝试直接重启应用...`);
    }

    // 通过 SSH 重启应用
    sendFridaLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    try {
      const killResult = await killAndRestartApp(host, packageName, processName);
      console.log('[SSH] 重启结果:', killResult);
      sendFridaLog('应用已终止');
    } catch (err) {
      console.error('[SSH] 重启应用失败:', err.message);
      sendFridaLog(`重启应用失败: ${err.message}`);
      throw new Error(`无法连接到设备: ${err.message}`);
    }

    // 显示手动启动提示
    sendFridaLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    sendFridaLog(`⚠️  请在手机上手动点击打开【美团外卖】`);
    sendFridaLog(`⚠️  注意：是"美团外卖"，不是"美团"！`);
    sendFridaLog(`系统将自动检测并注入（最多等待 30 秒）`);
    sendFridaLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // 等待 3 秒给用户时间看到提示并启动应用
    sendFridaLog(`等待应用启动（请手动打开美团外卖）...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 使用重试机制查找 PID（最多尝试 15 次，每次间隔 2 秒）
    sendFridaLog(`正在查找应用进程: ${packageName}`);
    const actualPid = await findPidWithRetry(host, port, packageName, 15, 2000);
    console.log(`[Frida注入] 找到进程 PID: ${actualPid}`);
    sendFridaLog(`找到进程 PID: ${actualPid}，开始注入...`);

    sendFridaLog(`开始注入...`);

    // 启动 Frida 注入
    const scriptPath = getFridaScriptPath('hook_ios_http.js');
    const fridaCmd = getFridaCommand('frida');
    console.log(`[Frida] 启动命令: ${fridaCmd} -H ${host}:${port} -p ${actualPid} -l ${scriptPath}`);

    const child = spawn(fridaCmd, ['-H', `${host}:${port}`, '-p', String(actualPid), '-l', scriptPath]);
    fridaProcess = child;
    let fridaLineBuffer = '';
    let hasError = false;

    child.stdout.on('data', (d) => {
      const text = decodeFrida(d);
      fridaLineBuffer += text;
      const parts = fridaLineBuffer.split(/\r?\n/);
      fridaLineBuffer = parts.pop() || '';

      for (const line of parts) {
        handleFridaLog(line);
      }
    });

    child.stderr.on('data', (d) => {
      const errorText = decodeFrida(d);
      console.error('[Frida stderr]:', errorText);
      hasError = true;
      sendFridaLog(`错误: ${errorText}`);
    });

    child.on('close', (code) => {
      console.log(`[Frida] 进程退出，code=${code}`);
      sendFridaLog(`Frida 已退出，code=${code}`);
      if (fridaProcess === child) fridaProcess = null;
    });

    child.on('error', (err) => {
      console.error('[Frida error]:', err.message);
      hasError = true;
      sendFridaLog(`错误: ${err.message}`);
      if (fridaProcess === child) fridaProcess = null;
    });

    // 延迟 500ms 检查是否立即失败
    await new Promise(resolve => setTimeout(resolve, 500));

    if (hasError || !fridaProcess) {
      throw new Error('Frida 启动失败');
    }

    console.log('[Frida] 注入成功');
    sendFridaLog('[Frida] 注入成功，开始监控网络请求...');

    return { success: true };
  } catch (err) {
    console.error(`[Frida] 重启并注入失败: ${err.message}`);
    sendFridaLog(`重启并注入失败: ${err.message}`);
    throw err;
  }
}

module.exports = {
  startInject,
  startInjectWithRestart,
  stop
};
