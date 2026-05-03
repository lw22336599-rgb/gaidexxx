; 自定义安装脚本：安装时自动清理旧版 web-resources 缓存目录
!macro customInstall
  ; 删除 %USERPROFILE%\AppData\Roaming\alien\web-resources 目录（如果存在则删除，不存在则忽略）
  RMDir /r "$APPDATA\alien\web-resources"
!macroend
