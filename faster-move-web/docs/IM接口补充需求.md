# IM 接口补充需求

## 概述

根据 IM 客服系统的功能需求，当前项目中已有 `ImSessionApi`（会话管理），但还缺少以下两个 API 接口模块。

## 已实现的接口

### ImSessionApi (会话管理)
位置：`src/TsModel/Api/Alien/Faster/Controllers/IM/ImSessionApi.ts`

已实现的接口：
- ✅ GetSessionList - 获取会话列表
- ✅ GetSessionDetail - 获取会话详情
- ✅ GetSessionMessages - 获取消息列表
- ✅ GetSessionMessagesStream - 获取消息列表（游标分页）
- ✅ ReplyToCustomer - 回复客户
- ✅ AddTag - 添加标签
- ✅ RemoveTag - 删除标签
- ✅ UpdateRemarks - 更新备注
- ✅ CloseSession - 关闭会话
- ✅ TransferSession - 转交会话

## 需要补充的接口

### 1. ImAdminApi (客服管理API)

**命名空间**: `Alien.Faster.Controllers.IM`
**文件路径**: `src/TsModel/Api/Alien/Faster/Controllers/IM/ImAdminApi.ts`

#### 需要的接口方法

1. **GetOnlineAdmins** - 获取在线客服列表
   ```csharp
   /// <summary>
   /// 获取在线客服列表
   /// </summary>
   /// <returns>在线客服列表</returns>
   [HttpGet("online-admins")]
   public async Task<List<AdminInfo>> GetOnlineAdmins()
   ```

2. **GetAdminWorkload** - 获取客服工作负载
   ```csharp
   /// <summary>
   /// 获取指定客服的工作负载
   /// </summary>
   /// <param name="adminId">客服ID</param>
   /// <returns>工作负载信息</returns>
   [HttpGet("admin/{adminId}/workload")]
   public async Task<AdminWorkloadInfo> GetAdminWorkload(string adminId)
   ```

3. **GetMySessions** - 获取我的会话列表
   ```csharp
   /// <summary>
   /// 获取当前登录客服的会话列表
   /// </summary>
   /// <param name="page">页码</param>
   /// <param name="pageSize">每页数量</param>
   /// <param name="status">会话状态（可选）</param>
   /// <returns>会话列表</returns>
   [HttpGet("my-sessions")]
   public async Task<PageResultVo<t_wmt_im_session>> GetMySessions(
       int page,
       int pageSize,
       ImSessionStatus? status = null)
   ```

4. **GetMyWorkload** - 获取我的工作负载
   ```csharp
   /// <summary>
   /// 获取当前登录客服的工作负载
   /// </summary>
   /// <returns>工作负载信息</returns>
   [HttpGet("my-workload")]
   public async Task<AdminWorkloadInfo> GetMyWorkload()
   ```

#### 相关数据模型

```csharp
/// <summary>
/// 客服信息
/// </summary>
public class AdminInfo
{
    /// <summary>客服ID</summary>
    public string Id { get; set; }

    /// <summary>客服名称</summary>
    public string Name { get; set; }

    /// <summary>是否在线</summary>
    public bool IsOnline { get; set; }

    /// <summary>当前服务中的会话数</summary>
    public int ActiveSessionCount { get; set; }
}

/// <summary>
/// 客服工作负载信息
/// </summary>
public class AdminWorkloadInfo
{
    /// <summary>客服ID</summary>
    public string AdminId { get; set; }

    /// <summary>服务中的会话数</summary>
    public int ActiveSessionCount { get; set; }

    /// <summary>今日接待数</summary>
    public int TodaySessionCount { get; set; }

    /// <summary>今日消息数</summary>
    public int TodayMessageCount { get; set; }

    /// <summary>平均响应时间（秒）</summary>
    public double AvgResponseTime { get; set; }
}
```

---

### 2. ImManageApi (消息管理API)

**命名空间**: `Alien.Faster.Controllers.IM`
**文件路径**: `src/TsModel/Api/Alien/Faster/Controllers/IM/ImManageApi.ts`

#### 需要的接口方法

1. **MarkSessionRead** - 标记会话已读
   ```csharp
   /// <summary>
   /// 标记会话已读
   /// </summary>
   /// <param name="sessionId">会话ID</param>
   [HttpPost("session/{sessionId}/mark-read")]
   public async Task MarkSessionRead(string sessionId)
   ```

2. **GetUnreadCount** - 获取未读消息数量
   ```csharp
   /// <summary>
   /// 获取当前客服的未读消息数量
   /// </summary>
   /// <returns>未读消息数</returns>
   [HttpGet("unread-count")]
   public async Task<int> GetUnreadCount()
   ```

3. **GetSessionSummary** - 获取会话统计
   ```csharp
   /// <summary>
   /// 获取会话统计信息
   /// </summary>
   /// <param name="startDate">开始日期（可选）</param>
   /// <param name="endDate">结束日期（可选）</param>
   /// <returns>统计信息</returns>
   [HttpGet("session-summary")]
   public async Task<SessionSummary> GetSessionSummary(
       DateTime? startDate = null,
       DateTime? endDate = null)
   ```

#### 相关数据模型

```csharp
/// <summary>
/// 会话统计信息
/// </summary>
public class SessionSummary
{
    /// <summary>总会话数</summary>
    public int TotalSessions { get; set; }

    /// <summary>进行中的会话数</summary>
    public int ActiveSessions { get; set; }

    /// <summary>已关闭的会话数</summary>
    public int ClosedSessions { get; set; }

    /// <summary>平均响应时间（秒）</summary>
    public double AvgResponseTime { get; set; }

    /// <summary>平均会话时长（秒）</summary>
    public double AvgSessionDuration { get; set; }
}
```

---

## SignalR Hub 事件说明

### IM Hub

**Hub 路径**: `/im`

#### 客户端调用方法

1. **JoinAdmin** - 客服加入管理员组
   ```csharp
   public async Task JoinAdmin(string userId)
   ```

2. **JoinConversation** - 加入会话组
   ```csharp
   public async Task JoinConversation(string conversationId)
   ```

3. **LeaveConversation** - 离开会话组
   ```csharp
   public async Task LeaveConversation(string conversationId)
   ```

#### 服务端推送事件

1. **ReceiveMessage** - 接收消息
   ```typescript
   ReceiveMessage(message: ImMessage)
   ```

2. **SessionAssigned** - 会话分配
   ```typescript
   SessionAssigned(event: ImSessionAssignedMessage)
   ```

3. **SessionTransferred** - 会话转交
   ```typescript
   SessionTransferred(event: ImSessionTransferredMessage)
   ```

4. **SessionStatusChanged** - 会话状态变更
   ```typescript
   SessionStatusChanged(event: ImSessionStatusChangedMessage)
   ```

5. **SessionTagsUpdated** - 标签更新
   ```typescript
   SessionTagsUpdated(event: ImSessionTagsUpdatedMessage)
   ```

6. **SessionRemarksUpdated** - 备注更新
   ```typescript
   SessionRemarksUpdated(event: ImSessionRemarksUpdatedMessage)
   ```

---

## 实施建议

1. **优先级排序**：
   - 🔴 高优先级：`GetUnreadCount`（客服浮球显示未读数必需）
   - 🟡 中优先级：`GetMySessions`、`MarkSessionRead`（基础客服功能必需）
   - 🟢 低优先级：工作负载和统计相关接口（数据分析功能）

2. **接口实现顺序建议**：
   1. ImManageApi.GetUnreadCount
   2. ImManageApi.MarkSessionRead
   3. ImAdminApi.GetMySessions
   4. ImAdminApi.GetOnlineAdmins
   5. ImAdminApi.GetMyWorkload
   6. ImAdminApi.GetAdminWorkload
   7. ImManageApi.GetSessionSummary

3. **TypeScript 类型生成**：
   实现后端接口后，请运行 TypeScript 生成器自动生成前端类型定义到 `src/TsModel/` 目录。

---

## 附录：当前已实现的相关类型

位于 `src/TsModel/Alien/Entity/` 目录下：

- ✅ `Messages/ImMessage.ts` - IM 消息实体
- ✅ `Messages/ImSessionAssignedMessage.ts` - 会话分配消息
- ✅ `Messages/ImSessionTransferredMessage.ts` - 会话转交消息
- ✅ `Messages/ImSessionStatusChangedMessage.ts` - 状态变更消息
- ✅ `Messages/ImSessionTagsUpdatedMessage.ts` - 标签更新消息
- ✅ `Messages/ImSessionRemarksUpdatedMessage.ts` - 备注更新消息
- ✅ `Enums/IM/ImDirection.ts` - 消息方向枚举
- ✅ `Enums/IM/ImMsgType.ts` - 消息类型枚举
- ✅ `Enums/IM/ImSessionStatus.ts` - 会话状态枚举
- ✅ `Tables/IM/t_wmt_im_message.ts` - 消息表
- ✅ `Tables/IM/t_wmt_im_session.ts` - 会话表
- ✅ `Faster/Controllers/IM/CloseSessionRequest.ts` - 关闭会话请求
- ✅ `Faster/Controllers/IM/RemarksRequest.ts` - 备注请求
- ✅ `Faster/Controllers/IM/ReplyMessageRequest.ts` - 回复消息请求
- ✅ `Faster/Controllers/IM/TagRequest.ts` - 标签请求
- ✅ `Faster/Controllers/IM/TransferSessionRequest.ts` - 转交会话请求

---

**文档创建日期**：2026-01-06
**文档版本**：v1.0
