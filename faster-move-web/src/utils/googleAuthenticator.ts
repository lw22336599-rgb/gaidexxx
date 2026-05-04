/**
 * Google Authenticator TOTP 工具类
 * 用于计算基于时间的一次性密码（TOTP）
 */

/**
 * Base32 解码函数
 * @param base32 - Base32 编码的字符串
 * @returns 解码后的 Uint8Array
 */
function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleanedBase32 = base32.replace(/=+$/, '').toUpperCase()
  let bits = 0
  let value = 0
  const output: number[] = []

  for (let i = 0; i < cleanedBase32.length; i++) {
    const val = alphabet.indexOf(cleanedBase32[i])
    if (val === -1) {
      throw new Error('Invalid base32 character')
    }
    value = (value << 5) | val
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

/**
 * 使用 HMAC-SHA1 算法计算哈希
 * @param key - 密钥
 * @param message - 消息
 * @returns Promise<ArrayBuffer>
 */
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  return await crypto.subtle.sign('HMAC', cryptoKey, message)
}

/**
 * 将数字转换为 8 字节的 Uint8Array（大端序）
 * @param num - 数字
 * @returns Uint8Array
 */
function numToUint8Array(num: number): Uint8Array {
  const arr = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    arr[i] = num & 0xff
    num = Math.floor(num / 256)
  }
  return arr
}

/**
 * 生成 TOTP 验证码
 * @param secret - Base32 编码的密钥
 * @param timeStep - 时间步长（秒），默认 30 秒
 * @param digits - 验证码位数，默认 6 位
 * @returns Promise<string> - 生成的验证码
 */
export async function generateTOTP(secret: string, timeStep: number = 30, digits: number = 6): Promise<string> {
  try {
    // 1. 解码 Base32 密钥
    const keyBytes = base32Decode(secret)

    // 2. 计算时间计数器（当前 Unix 时间戳 / 时间步长）
    const currentTime = Math.floor(Date.now() / 1000)
    const counter = Math.floor(currentTime / timeStep)
    const counterBytes = numToUint8Array(counter)

    // 3. 使用 HMAC-SHA1 计算哈希
    const hmac = await hmacSha1(keyBytes, counterBytes)
    const hmacArray = new Uint8Array(hmac)

    // 4. 动态截取（Dynamic Truncation）
    const offset = hmacArray[hmacArray.length - 1] & 0x0f
    const code =
      ((hmacArray[offset] & 0x7f) << 24) |
      ((hmacArray[offset + 1] & 0xff) << 16) |
      ((hmacArray[offset + 2] & 0xff) << 8) |
      (hmacArray[offset + 3] & 0xff)

    // 5. 生成指定位数的验证码
    const otp = (code % Math.pow(10, digits)).toString()
    return otp.padStart(digits, '0')
  } catch (error) {
    console.error('生成 TOTP 验证码失败:', error)
    throw error
  }
}

/**
 * 验证 TOTP 验证码是否正确
 * @param secret - Base32 编码的密钥
 * @param token - 用户输入的验证码
 * @param window - 允许的时间窗口数量（前后各几个时间步）
 * @returns Promise<boolean> - 验证码是否正确
 */
export async function verifyTOTP(secret: string, token: string, window: number = 1): Promise<boolean> {
  try {
    const currentTime = Math.floor(Date.now() / 1000)
    const timeStep = 30

    // 检查当前时间以及前后 window 个时间窗口的验证码
    for (let i = -window; i <= window; i++) {
      const adjustedTime = currentTime + i * timeStep
      const counter = Math.floor(adjustedTime / timeStep)

      // 临时修改时间来生成不同时间窗口的验证码
      const originalNow = Date.now
      Date.now = () => adjustedTime * 1000

      const expectedToken = await generateTOTP(secret)

      // 恢复原始时间函数
      Date.now = originalNow

      if (expectedToken === token) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('验证 TOTP 失败:', error)
    return false
  }
}

/**
 * 获取当前 TOTP 验证码剩余有效时间（秒）
 * @param timeStep - 时间步长（秒），默认 30 秒
 * @returns 剩余秒数
 */
export function getTOTPRemainingTime(timeStep: number = 30): number {
  const currentTime = Math.floor(Date.now() / 1000)
  return timeStep - (currentTime % timeStep)
}
