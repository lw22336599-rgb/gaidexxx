/**
 * DCloud 云打包说明：生成上架用 iOS/Android 安装包需在 DCloud 侧完成签名与队列，本脚本只做检查与本地 App 资源构建。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifest = path.join(root, "src", "manifest.json");

let raw = "";
try {
  raw = fs.readFileSync(manifest, "utf8");
} catch {
  raw = "";
}
const appidM = raw.match(/"appid"\s*:\s*"([^"]*)"/);
const appidVal = appidM ? appidM[1].trim() : "";
const hasAppId = appidVal.length > 0 && !/^__?$/.test(appidVal);
const hasWxId = /"mp-weixin"[\s\S]*?"appid"\s*:\s*"wx[0-9a-f]+"/i.test(raw);

console.log("\n========== uni-app 云打包 / 上架准备 ==========");
console.log("1）在 DCloud 开发者中心申请应用：https://dev.dcloud.net.cn/ ，分配 uni-app 的 appid。");
console.log("2）将 appid 写入 src/manifest.json 的根字段 appid（当前", hasAppId ? "已填写非空" : "⚠ 需填写 DCloud appid", "）。");
console.log("3）微信小程序：在 manifest 的 mp-weixin.appid 填写微信公众平台 AppID（当前", hasWxId ? "已填写" : "⚠ 需填写", "）。");
console.log("4）iOS 提交 App Store：需 Apple 开发者账号、证书、描述文件，在 HBuilderX「发行 → 原生App-云打包」上传并按用图形界面勾选项提交（CLI 无法代替云端签名队列）。");
console.log("5）Android：在云打包中选择包名、签名证书（.keystore），生成 apk/aab。");
console.log("6）本地先验证 App 资源：在项目根执行  npm run build:app  ，输出通常在 dist/build/app ，再导入 HBuilderX 云打包。");
console.log("================================================\n");
