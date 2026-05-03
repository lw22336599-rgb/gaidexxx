<div align="center">
<img width="200" src="https://gcore.jsdelivr.net/gh/zxwk1998/image/logo/vite.svg" alt="VAB"/>
<h1>shop-vite</h1>
</div>
### build相关配置

```txt
// 打包的配置都放到 build里
"build": {
    "productName":"ElectronDeskTopTool",//项目名 这也是生成的exe文件的前缀名，也可以在每个环境中自行配置
    "appId": "com.dyy.dongyuanwai",//应用程序的唯一标识符，通常是反转的域名格式
    "copyright":"dyy.dongyuanwai © 2024",//版权信息，显示在应用程序中说明版权归属的地方
    "compression": "maximum", //压缩级别，指定打包时使用的压缩级别。这里设置为"maximum"表示最大压缩
    "asar": true, // 是否启用 asar 打包，asar 是 Electron 提供的一种文件打包方式，能够提高应用程序的性能和安全性。
    "directories": { //指定输出目录，打包完成后的文件会放置在该目录下。
      "output": "release"
    },
    // windows相关的配置
    "win": {
      "icon": "xxx/icon.ico", //图标路径
      "artifactName": "${productName}-v${version}-${platform}-setup.${ext}" // 安装包名称
    }，
     // 这个意思是打出来32 bit + 64 bit的包，但是要注意：这样打包出来的安装包体积比较大，所以建议直接打32的安装包。
      "arch": [
          "x64",
          "ia32"
        ]
  }
```

### NSIS配置
```txt
"nsis": {
  "oneClick": false, // 是否一键安装
  "perMachine": true, //设置为 true 时，将在计算机上所有用户账户中安装应用程序；false 则只会在当前用户账户下安装
  "allowElevation": true, // 允许提升权限进行安装，设置为 true 时，安装过程可能会请求管理员权限
  "allowToChangeInstallationDirectory": true, // 允许修改安装目录
  "installerIcon": "xxx/xxxx.ico",// 安装图标
  "uninstallerIcon": "xxx/xxxx.ico",//卸载图标
  "installerHeaderIcon": "xxx/xxxx.ico", // 安装时头部图标
  "deleteAppDataOnUninstall": true, // 设置为 true 时，卸载应用程序时会删除应用程序的数据文件
  "createDesktopShortcut": true, // 创建桌面图标
  "createStartMenuShortcut": true,// 创建开始菜单图标
  "shortcutName": "xxxx", // 图标名称
},
```
shop-vite文档已初步开发完成，不再使用admin系列产品文档，后续将持续完善，敬请期待！
文档访问地址：https://vuejs-core.cn/shop-vite-book-2025
密码 zxwkcg 回车
shop-vite仓库地址：https://github.com/vue-admin-beautiful/shop-vite


打包白名单
   "files": [
    //   "src/**",
    //  "src-electron/**",
    //  "SunnyNet/**",
      "dist/**"
    ]


# 换品牌流程
第一步: 全局替换品牌名

第二步: 全局替换图标
src/assets/home_images/zdblogo.png
src\assets\logo.png
/public/logo.ico
/public/favicon.ico
/public/logo.png
com.alien.admin->com.{新的英文名}.admin
"name": "alien"->"name": "{新的英文名}"
还有以下信息
pakage.json中的
 "name": "alien",
   "build": {
    "productName": "极狐助手",
    "appId": "com.alien.admin",
    "copyright": "com.alien.admin © 2025",
    "compression": "maximum",
    "asar": true,
    "directories": {
      "output": "release/fastermove/${version}"
    },
