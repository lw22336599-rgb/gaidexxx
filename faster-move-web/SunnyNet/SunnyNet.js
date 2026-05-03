const { SunnyDll } = require('./SunnyDLL.js');

const os = require('os');
const os_type = os.type();
const darwinProxy = require('./darwinProxy.js');

function init() {
  return SunnyDll.CreateSunnyNet();
}
const Context = init();
let g_port;

function set_port(port) {
  g_port = port;
  return SunnyDll.SunnyNetSetPort(Context, port);
}

function get_version() {
  return SunnyDll.GetSunnyVersion();
}

function set_callback(HttpCallback, TcpCallback, WsCallback, UDPCallback) {
  return SunnyDll.SunnyNetSetCallback(Context, HttpCallback, TcpCallback, WsCallback, UDPCallback);
}

function start() {
  return SunnyDll.SunnyNetStart(Context);
}

function install_cert_to_system() {
  return SunnyDll.SunnyNetInstallCert(Context);
}

function is_script_code_supported() {
  return set_script_page("") != "no";
}

function set_script_page(page) {
  return SunnyDll.SetScriptPage(Context, page);
}

function open_drive(is_nfapi_dev) {
  return SunnyDll.OpenDrive(Context, is_nfapi_dev);
}

function process_all(enable, StopNetwork) {
  return SunnyDll.ProcessALLName(Context, enable, StopNetwork);
}
function process_atName(nameStr) {
  return SunnyDll.ProcessAddName(Context, nameStr);
}
//取消所有
function process_cancel_all() {
  return SunnyDll.ProcessCancelAll(Context);
}
function cancel_ie_proxy() {
  if (os_type === 'Windows_NT') {
    return SunnyDll.CancelIEProxy(Context);
  } else if (os_type === 'Linux') {
    return false;
  } else if (os_type === 'Darwin') {
    return darwinProxy.disableWebProxy();
  }
}

function set_ie_proxy(port) {
  console.log(os_type);
  if (os_type === 'Windows_NT') {
    try {
      console.log("Windows_NT 设置ie代理中。。。");
      return SunnyDll.SetIeProxy(Context);
    } catch (error) {
      console.log("设置代理失败 set proxy eror", error);
    }
  } else if (os_type === 'Linux') {
    return false;
  } else if (os_type === 'Darwin') {
    return darwinProxy.setWebProxy("127.0.0.1", port);
  } else {
    console.log("无相应平台 no any os_type",);
    return false;
  }
}

function stop() {
  cancel_ie_proxy();
  return SunnyDll.SunnyNetClose(Context);
}

function random_ja3(enable) {
  if (typeof enable !== 'boolean') {
    throw new TypeError("参数类型错误：enable 应为布尔值");
  }
  return SunnyDll.SetRandomTLS(Context, enable);
}

function must_tcp(enable) {
  if (typeof enable !== 'boolean') {
    throw new TypeError("参数类型错误：enable 应为布尔值");
  }
  return SunnyDll.SunnyNetMustTcp(Context, enable);
}

function set_dns_server(server_name) {
  if (typeof server_name !== 'string') {
    throw new TypeError("参数类型错误：server_name 应为字符串");
  }
  return SunnyDll.SetDnsServer(Context, Buffer.from(server_name, 'utf-8'));
}

function open_verify_user(enable) {
  if (typeof enable !== 'boolean') {
    throw new TypeError("参数类型错误：enable 应为布尔值");
  }
  return SunnyDll.SunnyNetVerifyUser(Context, enable);
}

function verify_user_add(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new TypeError("参数类型错误：username 和 password 应为字符串");
  }
  return SunnyDll.SunnyNetSocket5AddUser(Context, Buffer.from(username, 'utf-8'), Buffer.from(password, 'utf-8'));
}

function verify_user_del(username) {
  if (typeof username !== 'string') {
    throw new TypeError("参数类型错误：username 应为字符串");
  }
  return SunnyDll.SunnyNetSocket5DelUser(Context, username);
}

function export_cert() {
  return SunnyDll.ExportCert(Context);
}

function error() {
  return SunnyDll.SunnyNetError(Context);
}

function set_http_request_max_update_length(max_update_length) {
  if (typeof max_update_length !== 'number') {
    throw new TypeError("参数类型错误：max_update_length 应为整数");
  }
  return SunnyDll.SetHTTPRequestMaxUpdateLength(Context, max_update_length);
}

function disable_tcp(disable) {
  if (typeof disable !== 'boolean') {
    throw new TypeError("参数类型错误：disable 应为布尔值");
  }
  return SunnyDll.DisableTCP(Context, disable);
}

function disable_udp(disable) {
  if (typeof disable !== 'boolean') {
    throw new TypeError("参数类型错误：disable 应为布尔值");
  }
  return SunnyDll.DisableUDP(Context, disable);
}

function set_proxy(proxy_url) {
  if (typeof proxy_url !== 'string') {
    throw new TypeError("参数类型错误：proxy_url 应为字符串");
  }
  return SunnyDll.SetGlobalProxy(Context, Buffer.from(proxy_url, 'utf-8'));
}

function set_proxy_rules(regexp) {
  if (typeof regexp !== 'string') {
    throw new TypeError("参数类型错误：regexp 应为字符串");
  }
  return SunnyDll.CompileProxyRegexp(Context, Buffer.from(regexp, 'utf-8'));
}

function set_must_tcp_regexp(regexp, rules_allow) {
  if (typeof regexp !== 'string') {
    throw new TypeError("参数类型错误：regexp 应为字符串");
  }
  if (typeof rules_allow !== 'boolean') {
    throw new TypeError("参数类型错误：rules_allow 应为布尔值");
  }
  return SunnyDll.SetMustTcpRegexp(Context, Buffer.from(regexp, 'utf-8'), rules_allow);
}

function add_http_certRules(host, cert_manager, rules) {
  if (typeof host !== 'string') {
    throw new TypeError("参数类型错误：host 应为字符串");
  }
  if (!(cert_manager instanceof CertManager)) {
    throw new TypeError("参数类型错误：cert_manager 应为 CertManager 对象");
  }
  if (typeof rules !== 'number') {
    throw new TypeError("参数类型错误：rules 应为整数");
  }
  return SunnyDll.AddHttpCertificate(Buffer.from(host, 'utf-8'), cert_manager.context(), rules);
}

function del_http_certRules(host) {
  if (typeof host !== 'string') {
    throw new TypeError("参数类型错误：host 应为字符串");
  }
  return SunnyDll.DelHttpCertificate(Buffer.from(host, 'utf-8'));
}

module.exports = {
  set_port,
  get_version,
  set_callback,
  start,
  install_cert_to_system,
  is_script_code_supported,
  set_script_page,
  open_drive,
  process_all,
  process_atName,
  process_cancel_all,
  set_ie_proxy,
  cancel_ie_proxy,
  stop,
  random_ja3,
  must_tcp,
  set_dns_server,
  open_verify_user,
  verify_user_add,
  verify_user_del,
  export_cert,
  error,
  set_http_request_max_update_length,
  disable_tcp,
  disable_udp,
  set_proxy,
  set_proxy_rules,
  set_must_tcp_regexp,
  add_http_certRules,
  del_http_certRules
};
