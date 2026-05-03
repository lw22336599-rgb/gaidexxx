const logger = require('electron-log')
module.exports = {
  *beforeSendRequest(requestDetail) {
    // logger.info("发送：",requestDetail.url);
    // if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
    //   const newRequestOptions = requestDetail.requestOptions;
    //   newRequestOptions.headers['User-Agent'] = 'AnyProxy/0.0.0';
    //   return {
    //     requestOptions: newRequestOptions
    //   };
    // }
  },
  *beforeSendResponse(requestDetail, responseDetail) {
    const decoder = new TextDecoder("utf8"); // 指定编码格式为 UTF-8
    const text = decoder.decode(responseDetail.response.body);
    // logger.info("收到：", text);
    logger.info("收到：",requestDetail.url,text,responseDetail.response);
    //判断网址。然后进去解码后发到后端
    if (requestDetail.url.indexOf('http://httpbin.org') === 0) {
      //const decoder = new TextDecoder("utf-8"); // 指定编码格式为 UTF-8
      // const text = decoder.decode(responseDetail.response.body);
      //logger.info("收到：text);
      // const newResponse = responseDetail.response;
      // newResponse.statusCode = 404;
      // return {
      //   response: newResponse
      // };
      const modifiedResponse = JSON.stringify({message: "This content has been modified by AnyProxy"});

      // 这里你可以选择直接发送数据给Vue页面，或者保存下来稍后发送
      // 例如，可以通过Electron的ipcMain模块发送数据到渲染进程

      return responseDetail.respond({
        statusCode: 200,
        header: {'Content-Type': 'application/json'},
        body: modifiedResponse
      });
    }
  }
};
