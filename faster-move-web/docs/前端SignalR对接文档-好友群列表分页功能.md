# SignalR 聊天客户端前端对接文档 - 好友/群列表分页功能

## 📋 文档概述

本文档描述了好友/群列表分页功能的前后端对接方案，现已升级支持**分页**和**关键词过滤**功能。

## 🎯 两种使用场景

### 场景1：管理后台调用（HTTP API）
适用于管理后台前端，通过 REST API 获取聊天客户端的好友/群列表。

- **调用方式**：HTTP GET 请求
- **接口路径**：`/api/ChatMg/client/friendlist` 或 `/api/ChatMg/client/grouplist`
- **适用场景**：管理后台、Web 管理界面

### 场景2：聊天客户端实现（SignalR Hub 方法）
适用于桌面聊天客户端，需要实现 SignalR Hub 方法供后端调用。

- **调用方式**：后端通过 SignalR Hub 调用前端注册的方法
- **适用场景**：桌面客户端、移动端客户端

---

## 📡 场景1：HTTP API 使用（管理后台）

### 1. 获取好友列表 API

**接口地址：** `GET /api/ChatMg/client/friendlist`

**请求参数：**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| chatId | string | 是 | - | 聊天账号ID (t_chat_push_list.id) |
| pageIndex | number | 否 | 1 | 页码（从1开始） |
| pageSize | number | 否 | 20 | 每页数量 |
| keyword | string | 否 | null | 关键词（搜索昵称、备注、ID） |

**响应示例：**

```json
{
  "total": 150,
  "pageIndex": 1,
  "pageSize": 20,
  "totalPages": 8,
  "items": [
    {
      "chatType": 1,
      "memType": 1,
      "name": "张三",
      "remark": "同事-产品部",
      "headImg": "https://avatar.url/zhangsan.jpg",
      "offid": "wxid_zhangsan",
      "otherValues": null
    }
  ]
}
```

**前端调用示例（Axios）：**

```typescript
import axios from 'axios';

interface ChatMemberPageResult {
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  items: ChatMemberItem[];
}

interface ChatMemberItem {
  chatType: number;
  memType: number;
  name: string;
  remark?: string | null;
  headImg?: string | null;
  offid: string;
  otherValues?: Record<string, string> | null;
}

// 获取好友列表
async function getFriendList(
  chatId: string,
  pageIndex: number = 1,
  pageSize: number = 20,
  keyword?: string
): Promise<ChatMemberPageResult> {
  const response = await axios.get<ChatMemberPageResult>(
    '/api/ChatMg/client/friendlist',
    {
      params: {
        chatId,
        pageIndex,
        pageSize,
        keyword,
      },
    }
  );
  return response.data;
}

// 使用示例
const result = await getFriendList('chat_001', 1, 20, '张三');
console.log(`共 ${result.total} 个好友，当前第 ${result.pageIndex} 页`);
console.log(result.items);
```

### 2. 获取群列表 API

**接口地址：** `GET /api/ChatMg/client/grouplist`

**请求参数：** 同好友列表 API

**响应示例：** 同好友列表 API

**前端调用示例（Fetch）：**

```typescript
// 获取群列表
async function getGroupList(
  chatId: string,
  pageIndex: number = 1,
  pageSize: number = 20,
  keyword?: string
): Promise<ChatMemberPageResult> {
  const params = new URLSearchParams({
    chatId,
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
  });

  if (keyword) {
    params.append('keyword', keyword);
  }

  const response = await fetch(
    `/api/ChatMg/client/grouplist?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// 使用示例
const result = await getGroupList('chat_001', 1, 20, '工作群');
console.log(`共 ${result.total} 个群，当前第 ${result.pageIndex} 页`);
```

---

## 🔌 场景2：SignalR Hub 方法实现（聊天客户端）

### 变更内容

#### 1. GetFriendList - 获取好友列表（已升级）

**方法名称：** `GetFriendList`

**调用方式：** 后端通过 SignalR Hub 调用前端注册的此方法

#### 📥 **输入参数（变更）**

原参数：无参数

**新参数结构：** `ChatMemberPageRequest` 对象

```typescript
interface ChatMemberPageRequest {
  /**
   * 页码（从1开始）
   * @type {number}
   * @default 1
   */
  pageIndex: number;

  /**
   * 每页数量
   * @type {number}
   * @default 20
   */
  pageSize: number;

  /**
   * 关键词搜索（可选）
   * 搜索范围：昵称、备注、ID
   * @type {string | null}
   */
  keyword?: string | null;
}
```

#### 📤 **返回数据（变更）**

原返回：`ChatMemberItem[]`（数组）

**新返回结构：** `ChatMemberPageResult` 对象

```typescript
interface ChatMemberPageResult {
  /**
   * 总记录数
   */
  total: number;

  /**
   * 当前页码
   */
  pageIndex: number;

  /**
   * 每页数量
   */
  pageSize: number;

  /**
   * 总页数（计算得出）
   */
  totalPages: number;

  /**
   * 成员列表数据
   */
  items: ChatMemberItem[];
}

interface ChatMemberItem {
  /**
   * 账号类型（微信、钉钉、飞书等）
   * 0=未知, 1=微信, 2=钉钉, 3=飞书, 等等
   */
  chatType: number;

  /**
   * 成员类型（好友或群）
   * 0=未知, 1=好友, 2=群
   */
  memType: number;

  /**
   * 成员昵称/名称
   */
  name: string;

  /**
   * 成员备注（仅好友有备注）
   */
  remark?: string | null;

  /**
   * 头像（可能是图片链接或base64）
   */
  headImg?: string | null;

  /**
   * 成员的唯一标识（微信ID、钉钉ID等）
   */
  offid: string;

  /**
   * 其他扩展信息
   */
  otherValues?: Record<string, string> | null;
}
```

---

#### 2. GetGroupList - 获取群列表（已升级）

**方法名称：** `GetGroupList`

**调用方式：** 后端通过 SignalR Hub 调用前端注册的此方法

#### 📥 **输入参数（变更）**

原参数：无参数

**新参数结构：** 同 `GetFriendList`，使用 `ChatMemberPageRequest` 对象

```typescript
interface ChatMemberPageRequest {
  pageIndex: number;
  pageSize: number;
  keyword?: string | null;
}
```

#### 📤 **返回数据（变更）**

原返回：`ChatMemberItem[]`（数组）

**新返回结构：** 同 `GetFriendList`，使用 `ChatMemberPageResult` 对象

---

### 前端实现示例

#### 示例1：Vue 3 + TypeScript + @microsoft/signalr

```typescript
// types.ts - 类型定义
export interface ChatMemberPageRequest {
  pageIndex: number;
  pageSize: number;
  keyword?: string | null;
}

export interface ChatMemberPageResult {
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  items: ChatMemberItem[];
}

export interface ChatMemberItem {
  chatType: number;
  memType: number;
  name: string;
  remark?: string | null;
  headImg?: string | null;
  offid: string;
  otherValues?: Record<string, string> | null;
}

// signalr-service.ts - SignalR 服务
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export class ChatSignalRService {
  private connection: HubConnection;
  private friendList: ChatMemberItem[] = []; // 假设这是完整的好友列表
  private groupList: ChatMemberItem[] = []; // 假设这是完整的群列表

  constructor(hubUrl: string) {
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    this.registerMethods();
  }

  private registerMethods() {
    // 注册 GetFriendList 方法
    this.connection.on(
      'GetFriendList',
      (request: ChatMemberPageRequest): ChatMemberPageResult => {
        return this.getFriendListWithPagination(request);
      }
    );

    // 注册 GetGroupList 方法
    this.connection.on(
      'GetGroupList',
      (request: ChatMemberPageRequest): ChatMemberPageResult => {
        return this.getGroupListWithPagination(request);
      }
    );
  }

  /**
   * 获取好友列表（分页）
   */
  private getFriendListWithPagination(
    request: ChatMemberPageRequest
  ): ChatMemberPageResult {
    // 1. 根据关键词过滤
    let filteredList = this.friendList;
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filteredList = this.friendList.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.remark?.toLowerCase().includes(keyword) ||
          item.offid.toLowerCase().includes(keyword)
      );
    }

    // 2. 计算分页
    const total = filteredList.length;
    const startIndex = (request.pageIndex - 1) * request.pageSize;
    const endIndex = startIndex + request.pageSize;
    const items = filteredList.slice(startIndex, endIndex);

    // 3. 返回分页结果
    return {
      total,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      totalPages: Math.ceil(total / request.pageSize),
      items,
    };
  }

  /**
   * 获取群列表（分页）
   */
  private getGroupListWithPagination(
    request: ChatMemberPageRequest
  ): ChatMemberPageResult {
    // 1. 根据关键词过滤
    let filteredList = this.groupList;
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase();
      filteredList = this.groupList.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.offid.toLowerCase().includes(keyword)
      );
    }

    // 2. 计算分页
    const total = filteredList.length;
    const startIndex = (request.pageIndex - 1) * request.pageSize;
    const endIndex = startIndex + request.pageSize;
    const items = filteredList.slice(startIndex, endIndex);

    // 3. 返回分页结果
    return {
      total,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      totalPages: Math.ceil(total / request.pageSize),
      items,
    };
  }

  async start() {
    await this.connection.start();
  }

  async stop() {
    await this.connection.stop();
  }
}
```

---

#### 示例2：React + TypeScript

```typescript
// useChatSignalR.ts - React Hook
import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

interface ChatMemberPageRequest {
  pageIndex: number;
  pageSize: number;
  keyword?: string | null;
}

interface ChatMemberPageResult {
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  items: ChatMemberItem[];
}

interface ChatMemberItem {
  chatType: number;
  memType: number;
  name: string;
  remark?: string | null;
  headImg?: string | null;
  offid: string;
  otherValues?: Record<string, string> | null;
}

export const useChatSignalR = (
  hubUrl: string,
  friendList: ChatMemberItem[],
  groupList: ChatMemberItem[]
) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // 创建连接
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    // 注册 GetFriendList 方法
    connection.on('GetFriendList', (request: ChatMemberPageRequest) => {
      return filterAndPaginate(friendList, request);
    });

    // 注册 GetGroupList 方法
    connection.on('GetGroupList', (request: ChatMemberPageRequest) => {
      return filterAndPaginate(groupList, request);
    });

    // 启动连接
    connection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('SignalR Connection Error:', err));

    connectionRef.current = connection;

    // 清理
    return () => {
      connection.stop();
    };
  }, [hubUrl, friendList, groupList]);

  return connectionRef.current;
};

/**
 * 通用的过滤和分页函数
 */
function filterAndPaginate(
  list: ChatMemberItem[],
  request: ChatMemberPageRequest
): ChatMemberPageResult {
  // 1. 关键词过滤
  let filtered = list;
  if (request.keyword) {
    const keyword = request.keyword.toLowerCase();
    filtered = list.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.remark?.toLowerCase().includes(keyword) ||
        item.offid.toLowerCase().includes(keyword)
    );
  }

  // 2. 分页
  const total = filtered.length;
  const start = (request.pageIndex - 1) * request.pageSize;
  const end = start + request.pageSize;
  const items = filtered.slice(start, end);

  return {
    total,
    pageIndex: request.pageIndex,
    pageSize: request.pageSize,
    totalPages: Math.ceil(total / request.pageSize),
    items,
  };
}
```

---

#### 示例3：纯 JavaScript（不使用框架）

```javascript
// chat-signalr.js
import * as signalR from '@microsoft/signalr';

class ChatSignalRClient {
  constructor(hubUrl, friendList, groupList) {
    this.hubUrl = hubUrl;
    this.friendList = friendList;
    this.groupList = groupList;
    this.connection = null;
  }

  async init() {
    // 创建连接
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    // 注册方法
    this.registerMethods();

    // 启动连接
    await this.connection.start();
    console.log('SignalR 连接成功');
  }

  registerMethods() {
    // 注册 GetFriendList
    this.connection.on('GetFriendList', (request) => {
      return this.filterAndPaginate(this.friendList, request);
    });

    // 注册 GetGroupList
    this.connection.on('GetGroupList', (request) => {
      return this.filterAndPaginate(this.groupList, request);
    });
  }

  /**
   * 过滤和分页
   */
  filterAndPaginate(list, request) {
    // 关键词过滤
    let filtered = list;
    if (request.keyword) {
      const kw = request.keyword.toLowerCase();
      filtered = list.filter(
        (item) =>
          item.name.toLowerCase().includes(kw) ||
          (item.remark && item.remark.toLowerCase().includes(kw)) ||
          item.offid.toLowerCase().includes(kw)
      );
    }

    // 分页
    const total = filtered.length;
    const startIdx = (request.pageIndex - 1) * request.pageSize;
    const endIdx = startIdx + request.pageSize;
    const items = filtered.slice(startIdx, endIdx);

    return {
      total: total,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      totalPages: Math.ceil(total / request.pageSize),
      items: items,
    };
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
    }
  }
}

// 使用示例
const friendList = [
  /* 好友数据 */
];
const groupList = [
  /* 群组数据 */
];

const client = new ChatSignalRClient(
  'http://localhost:5000/chatClientHub',
  friendList,
  groupList
);

client.init();
```

---

---

## 🔍 关键词搜索说明（两种场景通用）

### 搜索字段范围

关键词会在以下字段中进行模糊匹配（不区分大小写）：

1. **name** - 成员昵称/名称
2. **remark** - 成员备注（仅好友）
3. **offid** - 成员唯一标识

### 搜索逻辑

- 只要任意一个字段包含关键词，该成员就会被返回
- 搜索不区分大小写
- 支持部分匹配（模糊搜索）

### 示例

假设有以下好友：

```json
[
  { "name": "张三", "remark": "同事", "offid": "wx_zhangsan" },
  { "name": "李四", "remark": "老板", "offid": "wx_lisi" },
  { "name": "王五", "remark": null, "offid": "wx_wangwu" }
]
```

- 搜索关键词 `"张"` → 返回张三
- 搜索关键词 `"老板"` → 返回李四
- 搜索关键词 `"wx_"` → 返回全部（3人）
- 搜索关键词 `"wangwu"` → 返回王五

---

---

## 📝 实现注意事项

### 场景1（HTTP API）注意事项

1. **认证授权**：需要在请求头中携带认证 Token
2. **错误处理**：注意处理 HTTP 状态码（401、403、500等）
3. **超时设置**：建议设置合理的请求超时时间（30秒）
4. **参数校验**：`chatId` 为必填参数，其他参数可选

### 场景2（SignalR Hub）注意事项

#### 1. 方法注册时机

确保在 SignalR 连接建立 **之前** 注册好 `GetFriendList` 和 `GetGroupList` 方法，否则后端调用时会失败。

```typescript
// ✅ 正确：先注册，后连接
connection.on('GetFriendList', handler);
await connection.start();

// ❌ 错误：先连接，后注册（可能导致后端调用时方法未注册）
await connection.start();
connection.on('GetFriendList', handler);
```

#### 2. 返回值类型

后端使用 `InvokeAsync<ChatMemberPageResult>` 调用，要求前端方法必须返回符合 `ChatMemberPageResult` 结构的对象，否则会导致反序列化失败。

#### 3. 性能优化建议

- 如果好友/群列表数据量很大（>1000条），建议在前端建立索引或使用虚拟列表
- 可以在前端缓存已加载的分页数据，避免重复计算

#### 4. 错误处理

如果前端方法执行过程中出现异常，后端会捕获到超时或调用失败的错误。建议前端添加 try-catch：

```typescript
connection.on('GetFriendList', (request) => {
  try {
    return filterAndPaginate(friendList, request);
  } catch (error) {
    console.error('GetFriendList 执行失败:', error);
    // 返回空结果而不是抛出异常
    return {
      total: 0,
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      totalPages: 0,
      items: [],
    };
  }
});
```

---

## 🧪 测试建议

### 测试场景清单

| 场景                       | 输入参数                                     | 期望结果                 |
| -------------------------- | -------------------------------------------- | ------------------------ |
| 第一页数据                 | `{pageIndex: 1, pageSize: 20, keyword: ""}` | 返回前20条数据           |
| 第二页数据                 | `{pageIndex: 2, pageSize: 20, keyword: ""}` | 返回21-40条数据          |
| 关键词搜索（有结果）       | `{pageIndex: 1, pageSize: 20, keyword: "张"}` | 返回所有包含"张"的数据   |
| 关键词搜索（无结果）       | `{pageIndex: 1, pageSize: 20, keyword: "不存在"}` | 返回空列表，total=0      |
| 超出总页数                 | `{pageIndex: 999, pageSize: 20, keyword: ""}` | 返回空列表               |
| 每页数量为1（边界测试）    | `{pageIndex: 1, pageSize: 1, keyword: ""}`  | 返回1条数据              |
| 每页数量为100（大分页）    | `{pageIndex: 1, pageSize: 100, keyword: ""}` | 返回前100条数据          |

---

## 📞 技术支持

如有疑问，请联系后端开发团队。

---

**文档版本：** v1.0
**更新日期：** 2026-01-14
**适用后端版本：** .NET 10.0+
