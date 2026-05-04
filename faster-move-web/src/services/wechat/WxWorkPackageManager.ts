/**
 * 微信工作包管理器
 * 负责工作包的下载、解压和微信进程的启动管理
 * 通过 Electron IPC 与主进程通信
 */

import type { DownloadProgress, ProgressCallback, WorkPackageConfig, WxProcessState } from '@/types/wechat'

// Electron IPC 通信
const ipcRenderer = (window as any).electron?.ipcRenderer

// 简单的进程信息接口
interface ProcessInfo {
  pid: number
  port: number
}

/**
 * 微信工作包管理器
 */
export class WxWorkPackageManager {
  private config: WorkPackageConfig
  private process: ProcessInfo | null = null
  private processState: WxProcessState = 0 // WxProcessState.NotStarted
  private workDir: string = ''
  private downloadProgressHandler: ((progress: DownloadProgress) => void) | null = null

  /**
   * 构造函数
   * @param config 工作包配置
   */
  constructor(config?: Partial<WorkPackageConfig>) {
    // 默认配置
    const defaultConfig: WorkPackageConfig = {
      downloadUrl: 'https://update.wmzdb.shop/windows/WeChat.zip',
      tempDir: '', // 将在主进程中生成
      executableName: 'injector32.exe'
    }

    this.config = { ...defaultConfig, ...config }
  }

  /**
   * 准备工作包（下载并解压）
   * @param onProgress 进度回调
   */
  async prepareWorkPackage(onProgress?: ProgressCallback): Promise<string> {
    if (!ipcRenderer) {
      throw new Error('Electron IPC 不可用')
    }

    try {
      // 设置下载进度回调
      if (onProgress) {
        this.downloadProgressHandler = onProgress
        console.log('[WxWorkPackageManager] 已设置进度回调')
      }

      // 注册下载进度监听器
      const progressListener = (_event: any, progress: DownloadProgress) => {
        console.log('[WxWorkPackageManager] 收到下载进度:', _event, progress)
        if (this.downloadProgressHandler) {
          console.log('[WxWorkPackageManager] 调用进度回调, progress:', progress)
          this.downloadProgressHandler(progress)
        } else {
          console.warn('[WxWorkPackageManager] 进度回调未设置')
        }
      }

      // 使用 on 方法并保存返回的订阅引用
      const subscription = ipcRenderer.on('wx-download-progress', progressListener)
      console.log('[WxWorkPackageManager] 已注册下载进度监听器, subscription:', subscription)

      try {
        // 通过 IPC 调用主进程准备工作包
        const result = await ipcRenderer.invoke('wx-prepare-workpackage', {
          downloadUrl: this.config.downloadUrl
        })

        if (result.success) {
          this.workDir = result.workDir
          return result.workDir
        } else {
          // 检查是否是用户取消
          if (result.cancelled) {
            throw new Error('下载已取消')
          }
          throw new Error(result.error || '准备工作包失败')
        }
      } finally {
        // 无论成功还是失败，都要移除监听器和清除回调
        ipcRenderer.off('wx-download-progress', subscription)
        this.downloadProgressHandler = null
        console.log('[WxWorkPackageManager] 已移除下载进度监听器')
      }
    } catch (error) {
      console.error('准备工作包失败:', error)
      throw error
    }
  }

  /**
   * 取消下载
   */
  async cancelDownload(): Promise<void> {
    if (!ipcRenderer) {
      throw new Error('Electron IPC 不可用')
    }

    try {
      console.log('取消下载')
      await ipcRenderer.invoke('wx-cancel-download')
    } catch (error) {
      console.error('取消下载失败:', error)
      throw error
    }
  }

  /**
   * 手动导入工作包
   * @param zipPath 可选的 zip 文件路径，如果不提供则弹出文件选择对话框
   */
  async importWorkPackage(zipPath?: string): Promise<string> {
    if (!ipcRenderer) {
      throw new Error('Electron IPC 不可用')
    }

    try {
      console.log('手动导入工作包', zipPath)

      const result = await ipcRenderer.invoke('wx-import-workpackage', {
        zipPath
      })

      if (result.success) {
        this.workDir = result.workDir
        return result.workDir
      } else {
        // 检查是否是用户取消
        if (result.cancelled) {
          throw new Error('用户取消选择')
        }
        throw new Error(result.error || '手动导入工作包失败')
      }
    } catch (error) {
      console.error('手动导入工作包失败:', error)
      throw error
    }
  }

  // 下载和解压由主进程处理，这里不需要这些方法了

  /**
   * 启动微信进程
   */
  async startWechatProcess(): Promise<{ pid: number; port: number }> {
    if (!ipcRenderer) {
      throw new Error('Electron IPC 不可用')
    }

    if (this.process) {
      console.warn('微信进程已启动')
      return this.process
    }

    if (!this.workDir) {
      throw new Error('工作包未准备好')
    }

    try {
      console.log('启动微信进程:', this.workDir)
      this.processState = 1 // WxProcessState.Starting

      const result = await ipcRenderer.invoke('wx-start-process', {
        workDir: this.workDir,
        executableName: this.config.executableName
      })

      if (result.success) {
        this.process = { pid: result.pid, port: result.port }
        this.processState = 2 // WxProcessState.Running
        console.log('微信进程已启动, PID:', result.pid, 'HTTP端口:', result.port)
        return { pid: result.pid, port: result.port }
      } else {
        this.processState = 6 // WxProcessState.Error
        throw new Error(result.error || '启动进程失败')
      }
    } catch (error) {
      console.error('启动微信进程失败:', error)
      this.processState = 6 // WxProcessState.Error
      throw error
    }
  }

  /**
   * 停止微信进程
   */
  async stopWechatProcess(): Promise<void> {
    if (!ipcRenderer) {
      throw new Error('Electron IPC 不可用')
    }

    if (!this.process) {
      console.log('微信进程未运行')
      return
    }

    try {
      console.log('停止微信进程')

      const result = await ipcRenderer.invoke('wx-stop-process', {
        pid: this.process.pid
      })

      if (result.success) {
        this.process = null
        this.processState = 5 // WxProcessState.Stopped
        console.log('微信进程已停止')
      } else {
        throw new Error(result.error || '停止进程失败')
      }
    } catch (error) {
      console.error('停止微信进程失败:', error)
      throw error
    }
  }

  /**
   * 获取进程状态
   */
  getProcessState(): WxProcessState {
    return this.processState
  }

  /**
   * 设置进程状态
   */
  setProcessState(state: WxProcessState): void {
    this.processState = state
  }

  /**
   * 是否正在运行
   */
  isRunning(): boolean {
    return this.process !== null && this.processState === 2 // WxProcessState.Running
  }

  /**
   * 获取工作目录
   */
  getWorkDir(): string {
    return this.workDir
  }

  /**
   * 清理临时文件
   */
  async cleanup(): Promise<void> {
    if (!ipcRenderer) {
      return
    }

    // 停止进程
    if (this.process) {
      await this.stopWechatProcess()
    }

    // 清理临时目录
    if (this.workDir) {
      try {
        await ipcRenderer.invoke('wx-cleanup', {
          workDir: this.workDir
        })
        console.log('临时目录已清理')
      } catch (error) {
        console.error('清理临时目录失败:', error)
      }
    }
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 格式化速度
 * @param bytesPerSecond 字节/秒
 */
export function formatSpeed(bytesPerSecond: number): string {
  return `${formatSize(bytesPerSecond)}/s`
}

/**
 * 格式化剩余时间
 * @param seconds 秒数
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}秒`
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`
  return `${Math.round(seconds / 3600)}小时`
}
