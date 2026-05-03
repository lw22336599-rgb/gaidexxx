const { free } = require('koffi');
const { SunnyDll } = require('./SunnyDLL.js');
const axios = require('axios');
//const { PtrToByte } = require('./SunnyDLL.js');
// const tools = require('./tools.js');

function PointerToText(ptr) {
  // console.log(ptr);
  return ptr
}
function PtrToInt(ptr) {
  // console.log("PtrToInt",ptr);
  return ptr
}
/**
 * Base64编解码工具类
 */
class Base64Util {
  /**
   * 将字符串编码为base64
   * @param {string} str - 要编码的字符串
   * @returns {string} base64编码后的字符串
   */
  static encode(str) {
    try {
      if (typeof window !== 'undefined' && window.btoa) {
        // 浏览器环境
        return window.btoa(unescape(encodeURIComponent(str)));
      } else {
        // Node.js环境
        return Buffer.from(str).toString('base64');
      }
    } catch (error) {
      console.error('Base64编码失败:', error);
      return '';
    }
  }

  /**
   * 将base64字符串解码成普通字符串
   * @param {string} base64Str - base64编码的字符串
   * @returns {string} 解码后的字符串
   */
  static decode(base64Str) {
    try {
      if (typeof window !== 'undefined' && window.atob) {
        // 浏览器环境
        return decodeURIComponent(escape(window.atob(base64Str)));
      } else {
        // Node.js环境
        return Buffer.from(base64Str, 'base64').toString('utf-8');
      }
    } catch (error) {
      console.error('Base64解码失败:', error);
      return '';
    }
  }

  /**
   * 将base64字符串解码成普通字符串，并处理URL编码
   * @param {string} base64Str - base64编码的字符串
   * @returns {string} 解码后的字符串
   */
  static decodeWithURL(base64Str) {
    try {
      const decodedStr = this.decode(base64Str);
      var result = decodeURIComponent(decodedStr);
      console.log("result-decodeURIComponent", result);
      return result;
    } catch (error) {
      console.error('解码失败:', error);
      return '';
    }
  }
}

class Request {
  constructor(messageId) {
    this.messageId = messageId;
  }

  rawRequestDataToFile(saveFile) {
    if (typeof saveFile !== 'string') {
      throw new TypeError("参数类型错误：saveFile 应为字符串");
    }
    const encodedFile = Buffer.from(saveFile, 'utf-8');
    return Boolean(SunnyDll.RawRequestDataToFile(this.messageId, saveFile, encodedFile.length));
  }

  isRequestRawBody() {
    return Boolean(SunnyDll.IsRequestRawBody(this.messageId));
  }

  bodyLength() {
    return PtrToInt(SunnyDll.GetRequestBodyLen(this.messageId));
  }

  async body() {
    const ptr = SunnyDll.GetRequestBody(this.messageId);
    console.log("GetRequestBody", ptr);

    const lengthCount = this.bodyLength();
    console.log("bodyLength", lengthCount);

    try {
      const response = await axios.get(`http://localhost:8382/todos/ptrtobase64/${ptr}/${lengthCount}`, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'Connection': 'keep-alive',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0'
        },
        responseType: 'text'
      });

      SunnyDll.Free(ptr);

      return response.data;
    } catch (error) {
      console.error('Error fetching base64 data:', error);
      SunnyDll.Free(ptr);
      return null;
    }
  }

  async bodyToStr() {
    try {
      const base64Data = await this.body();
      if (!base64Data) {
        console.log("error--base64Data is null");
      };
      return Base64Util.decodeWithURL(base64Data)
      // 将 base64 字符串解码为 Buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // 尝试用 GBK 解码
      try {
        return buffer.toString('gbk');
      } catch (e) {
        // 如果 GBK 解码失败，尝试用 UTF-8 解码
        return buffer.toString('utf-8');
      }
    } catch (e) {
      console.error('Error in bodyToStr:', e);
      return '';
    }
  }

  setBody(data) {
    if (!Buffer.isBuffer(data)) {
      throw new TypeError("参数类型错误：data 应为字节数组");
    }
    return SunnyDll.SetRequestData(this.messageId, data.toString(), data.length) === 1;
  }

  setBodyStr(data) {
    if (typeof data !== 'string') {
      return false;
    }
    try {
      return this.setBody(Buffer.from(data, 'gbk'));
    } catch (e) {
      return this.setBody(Buffer.from(data, 'utf-8'));
    }
  }

  setRequestTimeout(timeout) {
    if (typeof timeout !== 'number') {
      throw new TypeError("参数类型错误：timeout 应为整数");
    }
    SunnyDll.SetRequestOutTime(this.messageId, timeout);
  }

  setH2Config(config) {
    if (typeof config !== 'string') {
      throw new TypeError("参数类型错误：config 应为字符串");
    }
    SunnyDll.SetRequestHTTP2Config(this.messageId, config);
  }

  randomJa3() {
    return Boolean(SunnyDll.RandomRequestCipherSuites(this.messageId));
  }

  setProxy(proxyUrl, timeout) {
    if (typeof proxyUrl !== 'string') {
      throw new TypeError("参数类型错误：proxyUrl 应为字符串");
    }
    if (typeof timeout !== 'number') {
      throw new TypeError("参数类型错误：timeout 应为整数");
    }
    return Boolean(SunnyDll.SetRequestProxy(this.messageId, Buffer.from(proxyUrl, 'utf-8'), timeout));
  }

  setHeaders(headers) {
    if (typeof headers !== 'string') {
      throw new TypeError("参数类型错误：headers 应为字符串");
    }
    SunnyDll.SetRequestALLHeader(this.messageId, Buffer.from(headers, 'utf-8'));
  }

  setCookies(value) {
    if (typeof value !== 'string') {
      throw new TypeError("参数类型错误：value 应为字符串");
    }
    SunnyDll.SetRequestAllCookie(this.messageId, value);
  }
  setCookie(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError("key 应为字符串");
    }
    if (typeof value !== 'string') {
      throw new TypeError("参数类型错误：value 应为字符串");
    }
    SunnyDll.SetRequestCookie(this.messageId, key, value);
  }

  setHeader(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError("参数类型错误：key 应为字符串");
    }
    if (typeof value === 'string') {
      SunnyDll.SetRequestHeader(this.messageId, Buffer.from(key, 'utf-8'), Buffer.from(value, 'utf-8'));
    } else if (Array.isArray(value) || value instanceof Set) {
      SunnyDll.SetRequestHeader(this.messageId, Buffer.from(key, 'utf-8'), Buffer.from(Array.from(value).join('\n'), 'utf-8'));
    } else {
      throw new TypeError("参数类型错误：value 应为字符串、列表或元组");
    }
  }

  setUrl(newUrl) {
    if (typeof newUrl !== 'string') {
      throw new TypeError("参数类型错误：newUrl 应为字符串");
    }
    console.log(newUrl);

    SunnyDll.SetRequestUrl(this.messageId, newUrl);
  }

  delHeader(key) {
    if (typeof key !== 'string') {
      throw new TypeError("参数类型错误：key 应为字符串");
    }
    SunnyDll.DelRequestHeader(this.messageId, Buffer.from(key, 'utf-8'));
  }

  removeCompressionMark() {
    this.setHeader("Accept-Encoding", "identity");
  }

  getHeaders() {
    return PointerToText(SunnyDll.GetRequestAllHeader(this.messageId)) || "";
  }

  getHeader(key) {
    const array = this.getHeaderArray(key);
    return array.length > 0 ? array[0] : "";
  }

  getHeaderArray(key) {
    if (typeof key !== 'string') {
      throw new TypeError("参数类型错误：key 应为字符串");
    }
    let res = SunnyDll.GetRequestHeader(this.messageId, Buffer.from(key, 'utf-8')) || "";
    console.log(res);

    return res.split("\n");
  }

  getProto() {
    return PointerToText(SunnyDll.GetRequestProto(this.messageId));
  }

  getCookies() {
    return PointerToText(SunnyDll.GetRequestALLCookie(this.messageId)) || "";
  }

  getCookie(key) {
    if (typeof key !== 'string') {
      throw new TypeError("参数类型错误：key 应为字符串");
    }
    const ptr = SunnyDll.GetRequestCookie(this.messageId, key) || "";
    return PointerToText(ptr);
  }

  getCookieValue(key) {
    const cookie = this.getCookie(key).split(`${key}=`);
    return cookie.length >= 2 ? cookie[1].replace(";", "").trim() : "";
  }

  delHeaders() {
    const headers = this.getHeaders();
    headers.split("\r\n").forEach(item => {
      const name = item.split(":")[0];
      if (name) {
        this.delHeader(name);
      }
    });
  }

  stop() {
    this.setHeader("Connection", "Close");
  }
}

class Response {
  constructor(messageId) {
    this.messageId = messageId;
  }

  setStatusCode(status) {
    if (typeof status !== 'number') {
      throw new TypeError("参数类型错误：status 应为整数");
    }
    if (status <= 0) {
      SunnyDll.SetResponseStatus(this.messageId, 200);
      return;
    }
    SunnyDll.SetResponseStatus(this.messageId, status);
  }

  getStatusCode() {
    return PtrToInt(SunnyDll.GetResponseStatusCode(this.messageId));
  }

  status() {
    const res = PointerToText(SunnyDll.GetResponseStatus(this.messageId));
    const parts = res.split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
  }

  serverAddress() {
    return PointerToText(SunnyDll.GetResponseServerAddress(this.messageId));
  }

  body() {
    // 暂时写的是直接返回解码好的数据（指针操作比较复杂，所以就直接返回了
    const ptr = SunnyDll.GetResponseBody(this.messageId);
    // const data = PtrToByte(ptr, 0, this.bodyLength());

    // SunnyDll.Free(ptr);
    return ptr
  }

  bodyAuto() {
    const data = this.body();
    return data
    // 关于解压缩的问题暂时无法解决（和dll传回的指针有关 目前没有太好解决方法 后续研究
    // data=Buffer.from(data);
    // const encoding = this.getHeader("Content-Encoding").toLowerCase();
    // switch (encoding) {
    //     case "gzip":
    //         return tools.GzipUnCompress(data) || data;
    //     case "br":
    //         return tools.BrUnCompress(data) || data;
    //     case "deflate":
    //         return tools.DeflateUnCompress(data) || data;
    //     case "zstd":
    //         return tools.ZSTDUnCompress(data) || data;
    //     case "zlib":
    //         return tools.ZlibUnCompress(data) || data;
    //     default:
    //         return data;
    // }
  }

  bodyAutoStr() {
    const data = this.bodyAuto();
    try {
      return data.toString('gbk');
    } catch (e) {
      return data?.toString('utf-8') ?? "";
    }
  }

  bodyLength() {
    const ptr = SunnyDll.GetResponseBodyLen(this.messageId);
    return PtrToInt(ptr);
  }

  setBody(data) {
    if (!Buffer.isBuffer(data)) {
      throw new TypeError("参数类型错误：data 应为字节数组");
    }
    return SunnyDll.SetResponseData(this.messageId, data.toString(), data.length);
  }

  setBodyStr(data) {
    if (typeof data !== 'string') {
      throw new TypeError("参数类型错误：data 应为字符串");
    }
    return this.setBody(Buffer.from(data, 'utf-8'));
  }

  setHeader(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError("参数类型错误：key 应为字符串");
    }
    if (typeof value === 'string') {
      SunnyDll.SetResponseHeader(this.messageId, key, value);
    } else if (Array.isArray(value) || value instanceof Set) {
      SunnyDll.SetResponseHeader(this.messageId, key, Array.from(value).join('\n'));
    } else {
      throw new TypeError("参数类型错误：value 应为字符串、列表或元组");
    }
  }

  setAllHeader(headers) {
    if (typeof headers !== 'string') {
      throw new TypeError("参数类型错误：headers 应为字符串");
    }
    SunnyDll.SetResponseAllHeader(this.messageId, headers);
  }

  delHeader(name) {
    if (typeof name !== 'string') {
      throw new TypeError("参数类型错误：name 应为字符串");
    }
    SunnyDll.DelResponseHeader(this.messageId, Buffer.from(name, 'utf-8'));
  }

  getAllHeader() {
    return PointerToText(SunnyDll.GetResponseAllHeader(this.messageId));
  }

  delAllHeader() {
    const headers = this.getAllHeader();
    headers.split("\r\n").forEach(line => {
      const parts = line.split(":");
      if (parts.length > 0) {
        this.delHeader(parts[0]);
      }
    });
  }

  getHeader(key) {
    const array = this.getHeaderArray(key);
    return array.length > 0 ? array[0] : "";
  }

  getHeaderArray(key) {
    if (typeof key !== 'string') {
      throw new TypeError("参数类型错误：key 应为字符串");
    }
    let res = SunnyDll.GetResponseHeader(this.messageId, key) || ""
    console.log(res);
    return res.replace("\r", "").split("\n");
  }
}

class HTTPEvent {
  constructor(sunny_context, theology_id, message_id, event_type, method, url, error, pid) {
    try {

      let EVENT_TYPE_REQUEST = 1
      let EVENT_TYPE_RESPONSE = 2
      let EVENT_TYPE_ERROR = 3
      this.__message_id = message_id
      this.__theology_id = theology_id
      this.__event_type = event_type
      this.__method = method
      this.__url = url
      this.__error = error
      this.__pid = pid
      this.__sunny_net_context = sunny_context
      this.__request = new Request(message_id)
      this.__response = new Response(message_id)
      this.__is_debug = error == "Debug"
      if (this.__is_debug) {
        this.__error = ""
      } else {
        this.__error = error
      }
      this.__client_ip = PointerToText(SunnyDll.GetRequestClientIp(message_id))
    } catch (error) {
      console.log("HTTPEvent", error);

    }

  }
  get_client_ip() {
    return PointerToText(SunnyDll.GetRequestClientIp(this.__message_id))
  }
  get_request() {
    return this.__request
  }
  get_response() {
    return this.__response
  }
  get_theology_id() {
    return this.__theology_id
  }
  get_sunny_net_context() {
    return this.__sunny_net_context
  }
  get_message_id() {
    return this.__message_id
  }
  get_event_type() {
    return this.__event_type
  }
  get_url() {
    return this.__url
  }
  get_error() {
    return this.__error
  }
  get_method() {
    return this.__method
  }
  get_pid() {
    return this.__pid
  }
  is_debug() {
    return this.__is_debug
  }
  get_user() {
    return SunnyDll.SunnyNetGetSocket5User(this.__theology_id)
  }
}

module.exports = {
  Request,
  Response,
  HTTPEvent
};
