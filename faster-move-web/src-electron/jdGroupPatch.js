;(function () {
  // url关键字 → 强制替换的 POST body
  const PATCH_MAP = [
    {
      key: 'getSaasAppInfoByAppId',
      body: '{"encryptAppId":"17rE%2FqhgPIz6vTPvgxHtMw%3D%3D"}'
    },
    {
      key: 'saasAutoAuth',
      body: '{"encryptAppId":"17rE%2FqhgPIz6vTPvgxHtMw%3D%3D","authDimension":1}'
    },
  ];

  function getFixedBody(url) {
    for (const rule of PATCH_MAP) {
      if (url.includes(rule.key)) return rule.body;
    }
    return null;
  }

  // 拦截 XMLHttpRequest
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._jdUrl = typeof url === 'string' ? url : '';
    this._jdMethod = (method || '').toUpperCase();
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this._jdMethod === 'POST') {
      const fixed = getFixedBody(this._jdUrl);
      if (fixed) {
        console.log('[JD预加载] XHR body 已替换 →', this._jdUrl);
        return origSend.call(this, fixed);
      }
    }
    return origSend.call(this, body);
  };

  // 拦截 fetch
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const fixed = getFixedBody(url);
    if (fixed) {
      console.log('[JD预加载] fetch body 已替换 →', url);
      init = Object.assign({}, init, { body: fixed });
    }
    return origFetch.call(window, input, init);
  };

  console.log('[JD预加载] 拦截器就绪');
})();
