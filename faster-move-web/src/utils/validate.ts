/**
 * @description 判读是否为外链
 * @param value
 * @returns {boolean}
 */
export const isExternal = (value: string) => {
  return /^(https?:|mailto:|tel:|\/\/)/.test(value)
}

/**
 * @description 校验密码是否小于6位
 * @param value
 * @returns {boolean}
 */
export const isPassword = (value: string) => {
  return value.length >= 6
}

/**
 * @description 判断是否为数字
 * @param value
 * @returns {boolean}
 */
export const isNumber = (value: string) => {
  const reg = /^-?\d+(\.\d+)?$/
  return reg.test(value)
}

/**
 * @description 判断是否是名称
 * @param value
 * @returns {boolean}
 */
export const isName = (value: string) => {
  const reg = /^[\dA-Za-z\u4e00-\u9fa5]+$/
  return reg.test(value)
}

/**
 * @description 判断是否为IP
 * @param value
 * @returns {boolean}
 */
export const isIP = (value: string) => {
  const reg =
    /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(value)
}

/**
 * @description 判断是否是为URL
 * @param value
 * @returns {boolean}
 */
export const isUrl = (value: string) => {
  const reg = /^https?:\/\/([^/:]+\.)+[^/:]+(:\d+)?(\/.+)$/
  return reg.test(value)
}

/**
 * @description 判断是否是小写字母
 * @param value
 * @returns {boolean}
 */
export const isLowerCase = (value: string) => {
  const reg = /^[a-z]+$/
  return reg.test(value)
}

/**
 * @description 判断是否是大写字母
 * @param value
 * @returns {boolean}
 */
export const isUpperCase = (value: string) => {
  const reg = /^[A-Z]+$/
  return reg.test(value)
}

/**
 * @description 判断是否是大写字母开头
 * @param value
 * @returns {boolean}
 */
export const isAlphabets = (value: string) => {
  const reg = /^[A-Za-z]+$/
  return reg.test(value)
}

/**
 * @description 判断是否是字符串
 * @param value
 * @returns {boolean}
 */
export const isString = (value: any) => {
  return typeof value === 'string' || value instanceof String
}

/**
 * @description 判断是否是数组
 * @param value
 */
export const isArray = (value: any) => {
  if (Array.isArray === undefined) return Object.prototype.toString.call(value) === '[object Array]'
  return Array.isArray(value)
}

/**
 * @description 判断是否是端口号
 * @param value
 * @returns {boolean}
 */
export const isPort = (value: string) => {
  const reg = /^(\d|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
  return reg.test(value)
}

/**
 * @description 判断是否是手机号
 * 验证规则：
 * 1. 长度校验：手机号码长度为11位数字
 * 2. 开头数字校验：手机号码以数字1开头
 * 3. 号段合法性：手机号码属于合法号段（移动、联通、电信三大运营商）
 * @param value
 * @returns {boolean}
 */
export const isPhone = (value: string) => {
  // 严格验证中国手机号：11位数字，以1开头，符合三大运营商合法号段
  // 号段覆盖：
  // 移动：134-139, 147, 150-152, 157-159, 172, 178, 182-184, 187-188, 195, 198
  // 联通：130-132, 145, 155-156, 166, 171, 175-176, 185-186, 196
  // 电信：133, 149, 153, 173, 177, 180-181, 189, 191, 193, 199
  const reg = /^1(3[0-9]|4[579]|5[0-35-9]|6[67]|7[0-8]|8[0-9]|9[0-9])\d{8}$/
  return reg.test(value)
}

/**
 * @description 判断是否是身份证号
 * @param value
 * @returns {boolean}
 */
export const isIdCard = (value: string) => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}([\dXx])$)/
  return reg.test(value)
}

/**
 * @description 判断是否是邮箱
 * @param value
 * @returns {boolean}
 */
export const isEmail = (value: string) => {
  const reg = /^\w+([+.-]\w+)*@\w+([.-]\w+)*\.\w+([.-]\w+)*$/
  return reg.test(value)
}

/**
 * @description 判断是否中文
 * @param value
 * @returns {boolean}
 */
export const isChina = (value: string) => {
  const reg = /^[\u4E00-\u9FA5]{2,4}$/
  return reg.test(value)
}

/**
 * @description 判断是否为空
 * @param value
 * @returns {boolean}
 */
export const isBlank = (value: string) => {
  return value === null || false || value === '' || value.trim() === '' || value.toLocaleLowerCase().trim() === 'null'
}

/**
 * @description 判断是否为固话
 * @param value
 * @returns {boolean}
 */
export const isTel = (value: string) => {
  const reg = /^(400|800)([\d\\-]{7,10})|((\d{4}|\d{3})([ -])?)?(\d{7,8})(([ 转-])*(\d{1,4}))?$/
  return reg.test(value)
}

/**
 * @description 判断是否为json
 * @param value
 * @returns {boolean}
 */
export const isJson = (value: any) => {
  if (typeof value === 'string') {
    const obj = JSON.parse(value)
    return !!(typeof obj === 'object' && obj)
  }
  return false
}

/**
 * @description 判断是否为中文
 * @param value
 * @returns {boolean}
 */
export const isChinese = (value: string) => {
  const reg = /^[\u4e00-\u9fa5]+$/
  return reg.test(value)
}

/**
 * @description 判断是否为英文
 * @param value
 * @returns {boolean}
 */
export const isEnglish = (value: string) => {
  const reg = /^[A-Za-z]+$/
  return reg.test(value)
}
