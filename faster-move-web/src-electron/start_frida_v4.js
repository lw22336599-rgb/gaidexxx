/**
 * Frida Auto Starter - JavaScript/Electron 版本
 * 使用 ssh2 库实现 SSH 连接
 */

const { Client } = require('ssh2');
const { exec } = require('child_process');
const net = require('net');
const util = require('util');

const execPromise = util.promisify(exec);

// 配置
const CONFIG = {
  IP: '',//如 10.0.0.188
  USER: 'mobile',
  PASS: '11',
  PORT: 12345,
  MAX_RETRY: 3,
  FRIDA_PATH: '/var/jb/usr/sbin/frida-server'
};

/**
 * 打印步骤信息
 */
function printStep(msg) {
  console.log('\n' + '='.repeat(50));
  console.log(`  ${msg}`);
  console.log('='.repeat(50));
}

/**
 * 检查设备是否在线
 */
async function checkDeviceOnline() {
  console.log('[1/5] Checking device connection...');
  try {
    const isWindows = process.platform === 'win32';
    const pingCmd = isWindows
      ? `ping -n 1 -w 1000 ${CONFIG.IP}`
      : `ping -c 1 -W 1 ${CONFIG.IP}`;

    const { stdout, stderr } = await execPromise(pingCmd, { timeout: 5000 });
    console.log(`[OK] Device ${CONFIG.IP} is online`);
    return true;
  } catch (error) {
    console.log(`[ERROR] Device ${CONFIG.IP} is offline`);
    return false;
  }
}

/**
 * 执行 SSH 命令（以 root 身份）
 * 完全模拟 Python paramiko 的实现方式
 */
function runSshCommandAsRoot(command, showOutput = false) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';
    let commandCompleted = false;

    conn.on('ready', () => {
      // 使用 sudo -i 切换到 root 并执行命令（与 Python 版本完全一致）
      const fullCommand = `sudo -i bash -c '${command}'`;

      // 使用 PTY 模式（对应 Python 的 get_pty=True）
      conn.exec(fullCommand, { pty: true }, (err, stream) => {
        if (err) {
          conn.end();
          commandCompleted = true;
          console.log(`[ERROR] Exec failed: ${err.message}`);
          return resolve({ success: false, output: '', error: err.message });
        }

        // 模拟 Python 版本：固定延迟 500ms 后发送密码
        // 不等待密码提示，直接发送
        setTimeout(() => {
          stream.write(CONFIG.PASS + '\n');
        }, 500);

        // 再等待 1000ms 让命令执行
        setTimeout(() => {
          // 命令应该已经执行完毕，等待 stream 关闭
        }, 1500);

        stream.on('close', (code, signal) => {
          if (!commandCompleted) {
            conn.end();
            commandCompleted = true;

            if (showOutput && output) {
              // 过滤掉 sudo 密码提示
              const lines = output.split('\n');
              lines.forEach(line => {
                if (!line.toLowerCase().includes('password') && line.trim()) {
                  console.log(line);
                }
              });
            }

            resolve({ success: true, output, error: errorOutput });
          }
        });

        stream.on('data', (data) => {
          output += data.toString('utf8');
        });

        stream.stderr.on('data', (data) => {
          errorOutput += data.toString('utf8');
        });
      });
    });

    conn.on('error', (err) => {
      if (!commandCompleted) {
        commandCompleted = true;
        console.log(`[ERROR] SSH connection failed: ${err.message}`);
        resolve({ success: false, output: '', error: err.message });
      }
    });

    conn.connect({
      host: CONFIG.IP,
      port: 22,
      username: CONFIG.USER,
      password: CONFIG.PASS,
      readyTimeout: 10000,
      timeout: 15000,
      // 与 Python 版本一致的配置
      tryKeyboard: false,
      agent: false
    });
  });
}

/**
 * 执行普通 SSH 命令
 */
function runSshCommand(command, showOutput = false) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';
    let commandCompleted = false;

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          commandCompleted = true;
          console.log(`[ERROR] Exec failed: ${err.message}`);
          return resolve({ success: false, output: '', error: err.message });
        }

        stream.on('close', (code, signal) => {
          if (!commandCompleted) {
            conn.end();
            commandCompleted = true;

            if (showOutput && output) {
              console.log(output);
            }

            resolve({ success: true, output, error: errorOutput });
          }
        });

        stream.on('data', (data) => {
          output += data.toString('utf8');
        });

        stream.stderr.on('data', (data) => {
          errorOutput += data.toString('utf8');
        });
      });
    });

    conn.on('error', (err) => {
      if (!commandCompleted) {
        commandCompleted = true;
        console.log(`[ERROR] SSH connection failed: ${err.message}`);
        resolve({ success: false, output: '', error: err.message });
      }
    });

    conn.connect({
      host: CONFIG.IP,
      port: 22,
      username: CONFIG.USER,
      password: CONFIG.PASS,
      readyTimeout: 15000,
      keepaliveInterval: 5000,
      keepaliveCountMax: 3
    });
  });
}

/**
 * 停止旧的 frida-server 进程
 */
async function killOldProcess() {
  console.log('[2/5] Cleaning up old processes...');
  await runSshCommandAsRoot('killall frida-server 2>/dev/null');
  await sleep(2000);
  console.log('[OK] Cleanup complete');
  return true;
}

/**
 * 启动 frida-server
 */
async function startFridaServer() {
  console.log('[3/5] Starting frida-server...');
  const cmd = `${CONFIG.FRIDA_PATH} -l 0.0.0.0:${CONFIG.PORT} > /tmp/frida.log 2>&1 &`;
  await runSshCommandAsRoot(cmd);
  await sleep(3000);
  console.log('[OK] Start command sent');
  return true;
}

/**
 * 验证进程是否运行
 */
async function verifyProcess() {
  console.log('[4/5] Verifying process...');
  const result = await runSshCommand("ps aux | grep '[f]rida'", false);

  if (result.success && result.output.includes('frida') &&
    (result.output.includes('frida-server') || result.output.includes('(frida-server)'))) {
    // 显示进程信息
    const lines = result.output.trim().split('\n');
    lines.forEach(line => {
      if (line.includes('frida') && !line.includes('grep')) {
        console.log(`[OK] Found: ${line.trim()}`);
      }
    });
    return true;
  } else {
    console.log('[ERROR] frida-server not found');
    // 显示日志
    console.log('[INFO] Checking logs...');
    await runSshCommandAsRoot('cat /tmp/frida.log 2>/dev/null | tail -20', true);
    return false;
  }
}

/**
 * 测试端口是否可访问
 */
function testPort() {
  return new Promise((resolve) => {
    console.log('[5/5] Testing port connectivity...');

    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
      console.log(`[OK] Port ${CONFIG.PORT} is accessible`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`[WARN] Port ${CONFIG.PORT} not accessible yet`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      console.log(`[WARN] Port test error: ${err.message}`);
      resolve(false);
    });

    socket.connect(CONFIG.PORT, CONFIG.IP);
  });
}

/**
 * 测试 Frida 连接
 */
async function testFridaConnection() {
  console.log('\n[BONUS] Testing frida-tools connection...');
  try {
    const { stdout, stderr } = await execPromise(
      `python -m frida_tools.ps -H ${CONFIG.IP}:${CONFIG.PORT} -ai`,
      { timeout: 10000 }
    );

    if (stdout) {
      console.log('[OK] Frida connection successful!\n');
      console.log('='.repeat(60));
      console.log('Running Apps:');
      console.log('='.repeat(60));
      const lines = stdout.trim().split('\n');
      lines.slice(0, 15).forEach(line => console.log(line));
      if (lines.length > 15) {
        console.log(`... and ${lines.length - 15} more apps`);
      }
      console.log('='.repeat(60));
      return true;
    }
    return false;
  } catch (error) {
    if (error.message.includes('ENOENT') || error.message.includes('not found')) {
      console.log('[INFO] frida-tools not installed');
      console.log('      Install: pip install frida-tools');
    } else {
      console.log(`[WARN] Test error: ${error.message}`);
    }
    return false;
  }
}

/**
 * 检查依赖
 */
function checkDependencies() {
  try {
    require('ssh2');
    return true;
  } catch (error) {
    console.log('\n[ERROR] Missing dependency: ssh2');
    console.log('\nPlease install it:');
    console.log('  npm install ssh2');
    console.log('\nOr install in your Electron project:');
    console.log('  cd your-electron-project');
    console.log('  npm install ssh2');
    return false;
  }
}

/**
 * Sleep 函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数
 */
async function main() {
  printStep('Frida Auto Starter v4.0 (JavaScript)');
  console.log(`\nDevice: ${CONFIG.USER}@${CONFIG.IP}:${CONFIG.PORT}`);
  console.log(`Max retries: ${CONFIG.MAX_RETRY}\n`);

  // 检查依赖
  if (!checkDependencies()) {
    return 1;
  }

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRY; attempt++) {
    console.log('\n' + '#'.repeat(50));
    console.log(`  ATTEMPT ${attempt}/${CONFIG.MAX_RETRY}`);
    console.log('#'.repeat(50));

    // 检查设备
    if (!await checkDeviceOnline()) {
      console.log('\n[ERROR] Device is offline');
      if (attempt < CONFIG.MAX_RETRY) {
        console.log('Retrying in 3 seconds...');
        await sleep(3000);
        continue;
      }
      break;
    }

    // 执行启动流程
    await killOldProcess();
    await startFridaServer();

    // 验证
    if (await verifyProcess()) {
      await testPort();
      await testFridaConnection();

      printStep('SUCCESS!');
      console.log(`\nFrida server is running on ${CONFIG.IP}:${CONFIG.PORT}`);
      console.log('\nUsage:');
      console.log(`  python -m frida_tools.ps -H ${CONFIG.IP}:${CONFIG.PORT} -a`);
      console.log(`  python -m frida_tools.repl -H ${CONFIG.IP}:${CONFIG.PORT} -f com.app.name`);
      console.log('\nOr add Python Scripts folder to PATH to use frida-ps directly');
      return 0;
    }

    // 失败，重试
    if (attempt < CONFIG.MAX_RETRY) {
      console.log(`\n[WARN] Attempt ${attempt} failed, retrying in 3 seconds...`);
      await sleep(3000);
    }
  }

  // 所有尝试都失败
  printStep('FAILED');
  console.log('\nAll attempts failed. Manual check:');
  console.log(`  ssh ${CONFIG.USER}@${CONFIG.IP}`);
  console.log('  sudo ps aux | grep frida');
  console.log('  sudo cat /tmp/frida.log');
  return 1;
}

// 如果是直接运行（非 require 引入）
if (require.main === module) {
  main()
    .then(code => process.exit(code))
    .catch(error => {
      console.error('\n\n[ERROR] Unexpected error:', error);
      console.error(error.stack);
      process.exit(1);
    });
}

// 导出供其他模块使用
module.exports = {
  CONFIG,
  main,
  checkDeviceOnline,
  killOldProcess,
  startFridaServer,
  verifyProcess,
  testPort,
  testFridaConnection,
  runSshCommand,
  runSshCommandAsRoot
};
