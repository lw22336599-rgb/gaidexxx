# IM 客服系统配置说明

## SignalR 连接配置

### 自动使用登录页默认线路

SignalR 连接地址**自动使用登录页配置的"默认接口地址"**，无需单独配置环境变量。

**配置方式**：
1. 在登录页点击"自定义接口"按钮
2. 输入"默认接口地址"（例如：`http://localhost:5200`）
3. 点击确定保存

**优势**：
- ✅ SignalR 地址自动跟随登录页配置
- ✅ 无需维护单独的环境变量
- ✅ 切换接口地址时，SignalR 自动重连到新地址
- ✅ 开发、测试、生产环境统一配置方式

### SignalR Hub 路径

SignalR 会在默认接口地址的基础上访问以下路径：
- **IM Hub**：`{默认接口地址}/im`
- **Notification Hub**：`{默认接口地址}/notification`

例如，如果默认接口地址是 `http://localhost:5200`，则：
- IM Hub 地址为：`http://localhost:5200/im`
- Notification Hub 地址为：`http://localhost:5200/notification`

## 提示音文件

如果需要使用消息提示音功能，请准备提示音文件并放置到 `public/static/sounds/` 目录下。

建议使用的音频格式：
- MP3（推荐，兼容性好）
- OGG
- WAV

示例文件路径：`public/static/sounds/message-alert.mp3`

## 后端配置要求

### SignalR Hub 配置

后端需要配置以下 SignalR Hub：

1. **IM Hub**：`/im`
   - 用于客服聊天消息推送
   - 需要支持的方法：`JoinAdmin`、`JoinConversation`、`LeaveConversation`
   - 需要推送的事件：`ReceiveMessage`、`SessionAssigned` 等

2. **Notification Hub**（可选）：`/notification`
   - 用于系统通知
   - 需要支持的方法：`JoinUser`
   - 需要推送的事件：`ReceiveNotification`、`ReceiveMessage`

### CORS 配置

如果前端和后端不在同一域名下，需要在后端配置 CORS 允许 SignalR 连接：

```csharp
services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000") // 前端地址
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // SignalR 需要
    });
});
```

## 客服角色配置

### 角色名称

客服角色的标识名称为：`KEFU`（全大写）

### 角色设置

使用以下 API 为用户设置客服角色：

```typescript
await apiManager.adminApi.SetSubordinateRoles({
  UserId: userId,
  Roles: ['KEFU']
})
```

### 角色权限

拥有 `KEFU` 角色的用户将：
1. 登录系统后自动连接 SignalR IM 服务
2. 看到右下角的客服浮球
3. 可以访问客服聊天页面
4. 可以接收和回复客户消息

## 功能验证

### 1. 验证 SignalR 连接

登录后打开浏览器控制台，应该能看到类似以下日志：

```
[SignalR] 正在连接...
[SignalR] 连接成功
[SignalR] 已加入管理员组
```

### 2. 验证客服浮球

- 使用具有 `KEFU` 角色的账号登录
- 应该能在右下角看到蓝色的客服浮球
- 点击浮球应该能跳转到客服聊天页面

### 3. 验证消息接收

当有新的客户消息时：
- 浮球上的未读数字应该增加
- 应该播放提示音（如果启用）
- 控制台应该有消息接收日志

## 故障排查

### SignalR 连接失败

1. 检查登录页是否配置了"默认接口地址"
2. 检查后端 SignalR 服务是否正常运行
3. 检查网络连接和防火墙设置
4. 查看浏览器控制台的错误信息
5. 验证 SignalR Hub 路径：
   - `{默认接口地址}/im` 应该可以访问
   - `{默认接口地址}/notification` 应该可以访问

### 浮球不显示

1. 确认当前用户是否有 `KEFU` 角色
2. 检查浏览器控制台是否有错误
3. 确认主布局文件是否正确导入了浮球组件

### 提示音不播放

1. 检查提示音文件是否存在
2. 检查浏览器权限设置（某些浏览器需要用户交互后才能播放音频）
3. 检查 IM 设置中的提示音开关是否启用

---

**最后更新**：2026-01-06
**维护人员**：开发团队
