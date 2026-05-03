# 聊天客户端 SignalR 对接文档

## 概述

本文档说明如何在客户端电脑上实现聊天软件（微信、钉钉、飞书等）与后端服务器的 SignalR 双向通信。

### 应用场景
- 一台客户电脑上可能同时登录多个聊天账号（如：微信1、微信2、钉钉1、企业微信1等）
- 每个聊天账号建立一个独立的 SignalR 连接
- 同一账号重复连接时，新连接会自动踢掉旧连接

### 技术架构
- **协议**: SignalR (基于 WebSocket)
- **连接地址**: `http://服务器地址:5265/hubs/chatclient`
- **认证方式**: chatId + key
- **消息格式**: JSON

---

## 1. 连接流程

### 1.1 建立连接

```csharp
using Microsoft.AspNetCore.SignalR.Client;

// 创建 SignalR 连接
var connection = new HubConnectionBuilder()
    .WithUrl("http://服务器地址:5265/hubs/chatclient")
    .WithAutomaticReconnect() // 自动重连
    .Build();

// 启动连接
await connection.StartAsync();
Console.WriteLine("SignalR 连接已建立");
```

### 1.2 身份认证

连接建立后，必须调用 `JoinChatClient` 方法进行身份验证：

```csharp
// 从数据库或配置文件获取
string chatId = "your-chat-id";  // t_chat_push_list.id
string key = "your-secret-key";   // t_chat_push_list.key

try
{
    bool success = await connection.InvokeAsync<bool>("JoinChatClient", chatId, key);
    
    if (success)
    {
        Console.WriteLine("身份验证成功，已加入聊天客户端");
    }
}
catch (HubException ex)
{
    Console.WriteLine($"身份验证失败: {ex.Message}");
    // 可能的错误：chatId 不存在、key 不正确
}
```

### 1.3 断线处理

```csharp
// 监听连接断开事件
connection.Closed += async (error) =>
{
    Console.WriteLine($"连接已断开: {error?.Message}");
    
    // 等待一段时间后重连
    await Task.Delay(5000);
    await connection.StartAsync();
    
    // 重新认证
    await connection.InvokeAsync<bool>("JoinChatClient", chatId, key);
};
```

---

## 2. 实现服务端可调用的方法

服务端会通过 SignalR 调用客户端的以下方法，客户端必须实现并注册这些方法。

### 2.1 GetMyInfo - 获取账号信息

**说明**: 返回当前登录的聊天账号信息

**返回类型**: `ChatInfo`

```csharp
connection.On<ChatInfo>("GetMyInfo", () =>
{
    // 获取本地聊天账号信息（如微信账号信息）
    var myInfo = new ChatInfo
    {
        ChatType = ChatType.WechatPc,  // 微信PC版
        Name = "张三",
        HeadImg = "base64_image_or_url",
        OffId = "wxid_abc123",
        OtherValues = new Dictionary<string, string>
        {
            { "mobile", "13800138000" }
        }
    };
    
    return myInfo;
});
```

### 2.2 GetFriendList - 获取好友列表

**说明**: 返回所有好友列表

**返回类型**: `List<ChatMemberItem>`

```csharp
connection.On<List<ChatMemberItem>>("GetFriendList", () =>
{
    // 从本地聊天软件获取好友列表
    var friends = new List<ChatMemberItem>
    {
        new ChatMemberItem
        {
            ChatType = ChatType.WechatPc,
            MemType = MemberType.好友,
            Name = "李四",
            Remark = "同事",
            HeadImg = "base64_or_url",
            Offid = "wxid_friend001",
            OtherValues = new Dictionary<string, string>()
        },
        // ... 更多好友
    };
    
    return friends;
});
```

### 2.3 GetGroupList - 获取群列表

**说明**: 返回所有群列表

**返回类型**: `List<ChatMemberItem>`

```csharp
connection.On<List<ChatMemberItem>>("GetGroupList", () =>
{
    // 从本地聊天软件获取群列表
    var groups = new List<ChatMemberItem>
    {
        new ChatMemberItem
        {
            ChatType = ChatType.WechatPc,
            MemType = MemberType.群,
            Name = "技术交流群",
            HeadImg = "base64_or_url",
            Offid = "12345678@chatroom",  // 微信群ID通常以 @chatroom 结尾
            OtherValues = new Dictionary<string, string>()
        },
        // ... 更多群
    };
    
    return groups;
});
```

### 2.4 GetMemberList - 获取指定成员列表

**说明**: 根据提供的 offId 列表，返回对应的成员信息

**参数**: `List<string> offIds`

**返回类型**: `List<ChatMemberItem>`

```csharp
connection.On<List<string>, List<ChatMemberItem>>("GetMemberList", (offIds) =>
{
    // 根据 offIds 查询成员信息
    var members = new List<ChatMemberItem>();
    
    foreach (var offId in offIds)
    {
        // 从本地聊天软件查询该成员信息
        var member = FindMemberByOffId(offId);
        if (member != null)
        {
            members.Add(member);
        }
    }
    
    return members;
});
```

### 2.5 PushChatMsg - 推送消息到聊天软件

**说明**: 将消息发送给指定的好友或群

**参数**:
- `string memberOffId`: 接收消息的成员ID（好友ID或群ID）
- `string message`: 消息内容

**返回类型**: `bool` (成功返回true，失败返回false)

```csharp
connection.On<string, string, bool>("PushChatMsg", (memberOffId, message) =>
{
    try
    {
        // 调用本地聊天软件API发送消息
        bool success = SendMessageToChat(memberOffId, message);
        
        if (success)
        {
            Console.WriteLine($"消息发送成功: {memberOffId}");
        }
        else
        {
            Console.WriteLine($"消息发送失败: {memberOffId}");
        }
        
        return success;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"发送消息异常: {ex.Message}");
        return false;
    }
});
```

### 2.6 ForceDisconnect - 强制断开通知

**说明**: 服务端通知客户端被强制断开（新连接已建立）

**参数**: `string reason` - 断开原因

**返回类型**: 无

```csharp
connection.On<string>("ForceDisconnect", (reason) =>
{
    Console.WriteLine($"连接被服务端强制断开: {reason}");
    // 可以选择停止当前连接或记录日志
    connection.StopAsync();
});
```

---

## 3. 数据结构定义

### 3.1 ChatType 枚举

```csharp
public enum ChatType
{
    None = 0,
    WechatPc = 1,      // 微信PC版
    WechatIpad = 2,    // 微信iPad版
    WechatWeb = 3,     // 微信网页版
    WechatWebHook = 4, // 企业微信群机器人
    DingdingWebHook = 5, // 钉钉群机器人
    FeishuWebHook = 6    // 飞书群机器人
}
```

### 3.2 MemberType 枚举

```csharp
public enum MemberType
{
    None = 0,
    好友 = 1,
    群 = 2
}
```

### 3.3 ChatInfo 类

```csharp
public class ChatInfo
{
    /// <summary>
    /// 账号类型（微信、钉钉、飞书等）
    /// </summary>
    public ChatType ChatType { get; set; }

    /// <summary>
    /// 账号昵称/名称
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// 头像（可能是图片链接或base64）
    /// </summary>
    public string? HeadImg { get; set; }

    /// <summary>
    /// 账号的唯一标识（微信ID、钉钉ID等）
    /// </summary>
    public string OffId { get; set; }

    /// <summary>
    /// 其他扩展信息（如手机号等）
    /// </summary>
    public Dictionary<string, string>? OtherValues { get; set; }
}
```

### 3.4 ChatMemberItem 类

```csharp
public class ChatMemberItem
{
    /// <summary>
    /// 账号类型（微信、钉钉、飞书等）
    /// </summary>
    public ChatType ChatType { get; set; }

    /// <summary>
    /// 成员类型（好友或群）
    /// </summary>
    public MemberType MemType { get; set; }

    /// <summary>
    /// 成员昵称/名称
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// 成员备注（仅好友有备注）
    /// </summary>
    public string? Remark { get; set; }

    /// <summary>
    /// 头像（可能是图片链接或base64）
    /// </summary>
    public string? HeadImg { get; set; }

    /// <summary>
    /// 成员的唯一标识（微信ID、钉钉ID等）
    /// </summary>
    public string Offid { get; set; }

    /// <summary>
    /// 其他扩展信息
    /// </summary>
    public Dictionary<string, string>? OtherValues { get; set; }
}
```

---

## 4. 完整示例代码

```csharp
using Microsoft.AspNetCore.SignalR.Client;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class ChatClientManager
{
    private HubConnection _connection;
    private string _chatId;
    private string _key;

    public ChatClientManager(string serverUrl, string chatId, string key)
    {
        _chatId = chatId;
        _key = key;

        // 创建连接
        _connection = new HubConnectionBuilder()
            .WithUrl($"{serverUrl}/hubs/chatclient")
            .WithAutomaticReconnect(new[] { TimeSpan.Zero, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(5) })
            .Build();

        // 注册事件
        RegisterHandlers();
        
        // 断线重连
        _connection.Closed += OnDisconnected;
        _connection.Reconnected += OnReconnected;
    }

    private void RegisterHandlers()
    {
        // 获取账号信息
        _connection.On<ChatInfo>("GetMyInfo", GetMyInfo);

        // 获取好友列表
        _connection.On<List<ChatMemberItem>>("GetFriendList", GetFriendList);

        // 获取群列表
        _connection.On<List<ChatMemberItem>>("GetGroupList", GetGroupList);

        // 获取指定成员列表
        _connection.On<List<string>, List<ChatMemberItem>>("GetMemberList", GetMemberList);

        // 推送消息
        _connection.On<string, string, bool>("PushChatMsg", PushChatMsg);

        // 强制断开
        _connection.On<string>("ForceDisconnect", OnForceDisconnect);
    }

    public async Task ConnectAsync()
    {
        try
        {
            await _connection.StartAsync();
            Console.WriteLine("SignalR 连接已建立");

            // 身份验证
            bool success = await _connection.InvokeAsync<bool>("JoinChatClient", _chatId, _key);
            if (success)
            {
                Console.WriteLine("身份验证成功");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"连接失败: {ex.Message}");
        }
    }

    private async Task OnDisconnected(Exception error)
    {
        Console.WriteLine($"连接断开: {error?.Message}");
    }

    private async Task OnReconnected(string connectionId)
    {
        Console.WriteLine($"重新连接成功: {connectionId}");
        
        // 重新认证
        try
        {
            await _connection.InvokeAsync<bool>("JoinChatClient", _chatId, _key);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"重新认证失败: {ex.Message}");
        }
    }

    #region 实现服务端调用的方法

    private ChatInfo GetMyInfo()
    {
        // TODO: 从本地聊天软件获取账号信息
        return new ChatInfo
        {
            ChatType = ChatType.WechatPc,
            Name = "我的微信昵称",
            OffId = "wxid_123456",
            HeadImg = null,
            OtherValues = new Dictionary<string, string>()
        };
    }

    private List<ChatMemberItem> GetFriendList()
    {
        // TODO: 从本地聊天软件获取好友列表
        return new List<ChatMemberItem>();
    }

    private List<ChatMemberItem> GetGroupList()
    {
        // TODO: 从本地聊天软件获取群列表
        return new List<ChatMemberItem>();
    }

    private List<ChatMemberItem> GetMemberList(List<string> offIds)
    {
        // TODO: 根据 offIds 获取成员信息
        return new List<ChatMemberItem>();
    }

    private bool PushChatMsg(string memberOffId, string message)
    {
        try
        {
            // TODO: 调用本地聊天软件API发送消息
            Console.WriteLine($"发送消息到 {memberOffId}: {message}");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"发送消息失败: {ex.Message}");
            return false;
        }
    }

    private void OnForceDisconnect(string reason)
    {
        Console.WriteLine($"被服务端强制断开: {reason}");
    }

    #endregion

    public async Task DisconnectAsync()
    {
        await _connection.StopAsync();
    }
}

// 使用示例
class Program
{
    static async Task Main(string[] args)
    {
        var manager = new ChatClientManager(
            serverUrl: "http://your-server:5265",
            chatId: "your-chat-id",
            key: "your-secret-key"
        );

        await manager.ConnectAsync();

        Console.WriteLine("按任意键退出...");
        Console.ReadKey();

        await manager.DisconnectAsync();
    }
}
```

---

## 5. 错误处理

### 5.1 常见错误

| 错误场景 | 错误信息 | 处理方式 |
|---------|---------|---------|
| chatId 不存在 | "身份验证失败：chatId或key不正确" | 检查数据库 t_chat_push_list 表 |
| key 不正确 | "身份验证失败：chatId或key不正确" | 检查 key 是否匹配 |
| 连接超时 | "连接超时" | 检查网络、防火墙 |
| 方法调用超时 | "操作超时" | 服务端默认30秒超时 |

### 5.2 超时设置

服务端调用客户端方法时，默认超时时间为 **30秒**。如果客户端处理时间过长，会抛出超时异常。

建议在客户端实现时：
1. 异步处理耗时操作
2. 对于可能超时的操作，先返回结果，再异步处理
3. 缓存常用数据（如好友列表、群列表）

---

## 6. 测试建议

### 6.1 连接测试
- ✅ 正常连接和认证
- ✅ 错误的 chatId
- ✅ 错误的 key
- ✅ 网络断开后自动重连

### 6.2 方法调用测试
- ✅ GetMyInfo 返回正确的账号信息
- ✅ GetFriendList 返回完整好友列表
- ✅ GetGroupList 返回完整群列表
- ✅ GetMemberList 根据 offIds 返回正确成员
- ✅ PushChatMsg 成功发送消息

### 6.3 异常测试
- ✅ 调用方法时客户端处理失败
- ✅ 调用方法时客户端超时（>30秒）
- ✅ 同一账号重复连接（旧连接被踢）

### 6.4 并发测试
- ✅ 多个聊天账号同时连接
- ✅ 同时发送多条消息
- ✅ 高频调用客户端方法

---

## 7. 注意事项

### 7.1 性能优化
1. **缓存数据**: 好友列表、群列表等不常变化的数据应该缓存，避免每次都重新获取
2. **异步处理**: 所有方法都应该异步实现，避免阻塞
3. **批量操作**: GetMemberList 支持批量获取，尽量减少调用次数

### 7.2 安全注意
1. **密钥保护**: key 应该加密存储，不要明文保存
2. **连接加密**: 生产环境建议使用 HTTPS (wss://)
3. **数据校验**: 接收到的消息内容应该进行合法性校验

### 7.3 稳定性
1. **自动重连**: 使用 `WithAutomaticReconnect()` 实现自动重连
2. **心跳检测**: SignalR 内置心跳机制，无需额外实现
3. **错误日志**: 记录所有异常和错误信息，便于排查问题

### 7.4 踢线机制
- 同一个 chatId 只能保持一个连接
- 新连接建立时，旧连接会收到 `ForceDisconnect` 通知
- 客户端收到 `ForceDisconnect` 后应该停止当前连接
- 这种设计是为了处理客户端重启、异常断开等场景

---



## 8. 联系支持

如有问题，请联系开发团队或查看以下资源：

- **SignalR 官方文档**: https://docs.microsoft.com/aspnet/core/signalr/
- **项目仓库**: [内部Git地址]
- **技术支持**: [联系方式]

---

## 附录：微信PC版示例

以下是针对微信PC版的具体实现参考（基于微信Hook API）：

```csharp
// 微信特定实现示例
private ChatInfo GetMyInfo()
{
    // 调用微信Hook API获取个人信息
    var wxApi = new WeChatApi();
    var myInfo = wxApi.GetPersonalInfo();
    
    return new ChatInfo
    {
        ChatType = ChatType.WechatPc,
        Name = myInfo.NickName,
        OffId = myInfo.WxId,
        HeadImg = myInfo.HeadImgUrl,
        OtherValues = new Dictionary<string, string>
        {
            { "mobile", myInfo.Mobile }
        }
    };
}

private List<ChatMemberItem> GetFriendList()
{
    var wxApi = new WeChatApi();
    var contacts = wxApi.GetContactList();
    
    return contacts
        .Where(c => !c.WxId.Contains("@chatroom")) // 排除群
        .Select(c => new ChatMemberItem
        {
            ChatType = ChatType.WechatPc,
            MemType = MemberType.好友,
            Name = c.NickName,
            Remark = c.Remark,
            Offid = c.WxId,
            HeadImg = c.HeadImgUrl
        })
        .ToList();
}

private bool PushChatMsg(string memberOffId, string message)
{
    var wxApi = new WeChatApi();
    return wxApi.SendTextMessage(memberOffId, message);
}
```

---

## 相关资料
获取企业微信webhook 教程
https://cloud.tencent.com/document/product/1263/71731#webhook  推送原理 https://developer.work.weixin.qq.com/document/path/91770

获取钉钉webhook
https://cloud.tencent.com/document/product/1263/71732  
https://open.dingtalk.com/document/dingstart/custom-bot-creation-and-installation
获取飞书webhook
https://cloud.tencent.com/document/product/1263/74218
https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot



**文档版本**: v1.0  
**最后更新**: 2026-01-13  
**适用版本**: Alien.Faster v1.0+


