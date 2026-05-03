/**
 * 账号存储管理器
 * 用于管理已登录账号的用户名和 Google Authenticator 密钥
 *
 * 在 Electron 环境中，令牌（gaSecret）存储在临时目录的文件中（一个文件一个令牌）
 * 在非 Electron 环境中，使用 localStorage 存储所有信息
 */

export interface AccountInfo {
  /** 用户名 */
  username: string
  /** Google Authenticator 密钥（Base32 编码） */
  gaSecret?: string
  /** 最后登录时间戳 */
  lastLoginTime: number
}

const STORAGE_KEY = 'login_accounts'
const MAX_ACCOUNTS = 3

/**
 * 检测是否在 Electron 环境中
 */
function isElectron(): boolean {
  return typeof (globalThis as any).electron !== 'undefined' &&
    typeof (globalThis as any).electron?.saveTokenFile === 'function'
}

/**
 * 加密存储的密钥（简单的混淆，实际项目中应使用更安全的方式）
 */
function encryptSecret(secret: string): string {
  // 简单的 Base64 编码混淆
  return btoa(unescape(encodeURIComponent(secret)))
}

/**
 * 解密存储的密钥
 */
function decryptSecret(encrypted: string): string {
  try {
    return decodeURIComponent(escape(atob(encrypted)))
  } catch {
    return ''
  }
}

/**
 * 获取所有保存的账号信息
 * @returns 账号信息数组，按最后登录时间降序排列
 */
export async function getSavedAccounts(): Promise<AccountInfo[]> {
  try {
    // 在 Electron 环境中，从文件系统读取令牌
    if (isElectron()) {
      const electron = (globalThis as any).electron

      // 从 localStorage 获取账号列表（不包含密钥）
      const stored = localStorage.getItem(STORAGE_KEY)
      const accounts: AccountInfo[] = stored ? JSON.parse(stored) : []

      // 从文件系统读取所有令牌文件
      const tokenFilesResult = await electron.listTokenFiles()
      const tokenFiles = tokenFilesResult.success ? tokenFilesResult.files : []

      // 合并账号信息和令牌
      const accountsWithTokens: AccountInfo[] = []

      // 先处理有令牌文件的账号
      for (const tokenFile of tokenFiles) {
        const readResult = await electron.readTokenFile(tokenFile.username)
        if (readResult.success && readResult.token) {
          const account = accounts.find(acc => acc.username === tokenFile.username)
          accountsWithTokens.push({
            username: tokenFile.username,
            gaSecret: readResult.token,
            lastLoginTime: account?.lastLoginTime || tokenFile.lastModified
          })
        }
      }

      // 添加没有令牌文件的账号（只有用户名）
      for (const account of accounts) {
        if (!accountsWithTokens.find(acc => acc.username === account.username)) {
          accountsWithTokens.push({
            username: account.username,
            gaSecret: undefined,
            lastLoginTime: account.lastLoginTime
          })
        }
      }

      // 按最后登录时间降序排序
      return accountsWithTokens.sort((a, b) => b.lastLoginTime - a.lastLoginTime)
    } else {
      // 非 Electron 环境，使用 localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return []
      }

      const accounts: AccountInfo[] = JSON.parse(stored)

      // 解密密钥
      accounts.forEach(account => {
        if (account.gaSecret) {
          account.gaSecret = decryptSecret(account.gaSecret)
        }
      })

      // 按最后登录时间降序排序
      return accounts.sort((a, b) => b.lastLoginTime - a.lastLoginTime)
    }
  } catch (error) {
    console.error('读取账号信息失败:', error)
    return []
  }
}

/**
 * 保存或更新账号信息
 * @param username - 用户名
 * @param gaSecret - Google Authenticator 密钥（可选）
 */
export async function saveAccount(username: string, gaSecret?: string): Promise<void> {
  try {
    // 在 Electron 环境中，令牌保存到文件系统
    if (isElectron()) {
      const electron = (globalThis as any).electron

      // 如果有密钥，保存到文件
      if (gaSecret) {
        await electron.saveTokenFile(username, gaSecret)
      }

      // 从 localStorage 获取账号列表（不包含密钥）
      const stored = localStorage.getItem(STORAGE_KEY)
      const accounts: AccountInfo[] = stored ? JSON.parse(stored) : []

      // 查找是否已存在该账号
      const existingIndex = accounts.findIndex(acc => acc.username === username)

      const accountInfo: AccountInfo = {
        username,
        gaSecret: undefined, // 不存储在 localStorage 中
        lastLoginTime: Date.now()
      }

      if (existingIndex >= 0) {
        // 更新现有账号
        accounts[existingIndex] = accountInfo
      } else {
        // 添加新账号
        accounts.unshift(accountInfo)

        // 限制保存的账号数量
        if (accounts.length > MAX_ACCOUNTS) {
          accounts.splice(MAX_ACCOUNTS)
        }
      }

      // 保存账号列表到 localStorage（不包含密钥）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
    } else {
      // 非 Electron 环境，使用 localStorage
      const accounts = await getSavedAccounts()

      // 查找是否已存在该账号
      const existingIndex = accounts.findIndex(acc => acc.username === username)

      const accountInfo: AccountInfo = {
        username,
        gaSecret: gaSecret || (existingIndex >= 0 ? accounts[existingIndex].gaSecret : undefined),
        lastLoginTime: Date.now()
      }

      if (existingIndex >= 0) {
        // 更新现有账号
        accounts[existingIndex] = accountInfo
      } else {
        // 添加新账号
        accounts.unshift(accountInfo)

        // 限制保存的账号数量
        if (accounts.length > MAX_ACCOUNTS) {
          accounts.splice(MAX_ACCOUNTS)
        }
      }

      // 加密密钥
      const accountsToStore = accounts.map(account => ({
        ...account,
        gaSecret: account.gaSecret ? encryptSecret(account.gaSecret) : undefined
      }))

      localStorage.setItem(STORAGE_KEY, JSON.stringify(accountsToStore))
    }
  } catch (error) {
    console.error('保存账号信息失败:', error)
  }
}

/**
 * 获取指定用户名的账号信息
 * @param username - 用户名
 * @returns 账号信息，如果不存在则返回 undefined
 */
export async function getAccountByUsername(username: string): Promise<AccountInfo | undefined> {
  const accounts = await getSavedAccounts()
  return accounts.find(acc => acc.username === username)
}

/**
 * 删除指定用户名的账号信息
 * @param username - 用户名
 */
export async function deleteAccount(username: string): Promise<void> {
  try {
    // 在 Electron 环境中，删除令牌文件
    if (isElectron()) {
      const electron = (globalThis as any).electron
      await electron.deleteTokenFile(username)
    }

    const accounts = await getSavedAccounts()
    const filteredAccounts = accounts.filter(acc => acc.username !== username)

    if (isElectron()) {
      // Electron 环境：只保存账号列表（不包含密钥）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAccounts.map(acc => ({
        username: acc.username,
        gaSecret: undefined,
        lastLoginTime: acc.lastLoginTime
      }))))
    } else {
      // 非 Electron 环境：加密密钥后保存
      const accountsToStore = filteredAccounts.map(account => ({
        ...account,
        gaSecret: account.gaSecret ? encryptSecret(account.gaSecret) : undefined
      }))

      localStorage.setItem(STORAGE_KEY, JSON.stringify(accountsToStore))
    }
  } catch (error) {
    console.error('删除账号信息失败:', error)
  }
}

/**
 * 清空所有账号信息
 */
export function clearAllAccounts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('清空账号信息失败:', error)
  }
}

/**
 * 更新账号的 Google Authenticator 密钥
 * @param username - 用户名
 * @param gaSecret - 新的密钥
 */
export async function updateAccountSecret(username: string, gaSecret: string): Promise<void> {
  await saveAccount(username, gaSecret)
}
