# Webhook 配置管理 API 文档

## 概述

用户可以配置 Webhook 地址,用于接收店铺掉线通知。支持企业微信、钉钉、飞书三种群机器人。

**基础路径**: `/api/WebhookConfig`

**权限要求**: 需要登录,支持 ADMIN、AGENCY、BOSS 角色

---

## API 列表

### 1. 获取我的 Webhook 配置列表

**接口**: `GET /api/WebhookConfig/GetMyWebhooks`

**描述**: 获取当前登录用户的所有 Webhook 配置

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "webhook_id_1",
      "webhookType": 4,
      "webhookTypeName": "企业微信",
      "webhookUrl": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
      "remark": "技术运维群",
      "enabled": true,
      "addTime": "2026-01-13T10:00:00",
      "updateTime": "2026-01-13T10:00:00"
    },
    {
      "id": "webhook_id_2",
      "webhookType": 5,
      "webhookTypeName": "钉钉",
      "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
      "remark": "店铺监控群",
      "enabled": true,
      "addTime": "2026-01-13T11:00:00",
      "updateTime": "2026-01-13T11:00:00"
    }
  ],
  "msg": "success"
}
```

---

### 2. 添加 Webhook 配置

**接口**: `POST /api/WebhookConfig/AddWebhook`

**描述**: 为当前用户添加新的 Webhook 配置

**请求参数**:
```json
{
  "webhookType": 4,
  "webhookUrl": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here",
  "remark": "技术运维群"
}
```

**参数说明**:
- `webhookType`: Webhook 类型 (必填)
  - `4` = 企业微信群机器人
  - `5` = 钉钉群机器人
  - `6` = 飞书群机器人
- `webhookUrl`: Webhook URL 地址 (必填,最长500字符)
- `remark`: 备注名称 (可选,最长100字符)

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": "webhook_id_new",
    "webhookType": 4,
    "webhookTypeName": "企业微信",
    "webhookUrl": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here",
    "remark": "技术运维群",
    "enabled": true,
    "addTime": "2026-01-13T12:00:00",
    "updateTime": "2026-01-13T12:00:00"
  },
  "msg": "success"
}
```

**限制说明**:
- 每个用户最多配置 10 个 Webhook
- 不能添加重复的 Webhook URL

---

### 3. 更新 Webhook 配置

**接口**: `PUT /api/WebhookConfig/UpdateWebhook`

**描述**: 更新已有的 Webhook 配置

**请求参数**:
```json
{
  "id": "webhook_id_1",
  "webhookType": 4,
  "webhookUrl": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=new_key",
  "remark": "技术运维群(更新)"
}
```

**参数说明**:
- `id`: 配置ID (必填)
- `webhookType`: Webhook 类型 (必填)
- `webhookUrl`: Webhook URL 地址 (必填)
- `remark`: 备注名称 (可选)

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": "webhook_id_1",
    "webhookType": 4,
    "webhookTypeName": "企业微信",
    "webhookUrl": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=new_key",
    "remark": "技术运维群(更新)",
    "enabled": true,
    "addTime": "2026-01-13T10:00:00",
    "updateTime": "2026-01-13T14:00:00"
  },
  "msg": "success"
}
```

---

### 4. 删除 Webhook 配置

**接口**: `DELETE /api/WebhookConfig/DeleteWebhook?id={id}`

**描述**: 删除指定的 Webhook 配置(软删除)

**请求参数**:
- `id`: 配置ID (必填,Query参数)

**响应示例**:
```json
{
  "code": 200,
  "data": null,
  "msg": "success"
}
```

---

### 5. 启用/禁用 Webhook

**接口**: `POST /api/WebhookConfig/ToggleWebhook`

**描述**: 启用或禁用指定的 Webhook 配置

**请求参数**:
```json
{
  "id": "webhook_id_1",
  "enabled": false
}
```

**参数说明**:
- `id`: 配置ID (必填)
- `enabled`: 是否启用 (必填, true=启用, false=禁用)

**响应示例**:
```json
{
  "code": 200,
  "data": null,
  "msg": "success"
}
```

---

### 6. 测试 Webhook 连通性

**接口**: `POST /api/WebhookConfig/TestWebhook`

**描述**: 向指定的 Webhook 发送测试消息,验证配置是否正确

**请求参数**:
```json
{
  "id": "webhook_id_1"
}
```

**参数说明**:
- `id`: 配置ID (必填)

**响应示例** (成功):
```json
{
  "code": 200,
  "data": {
    "success": true,
    "message": "测试成功!消息已发送到您的群聊"
  },
  "msg": "success"
}
```

**响应示例** (失败):
```json
{
  "code": 200,
  "data": {
    "success": false,
    "message": "测试失败: 连接超时"
  },
  "msg": "success"
}
```

---

### 7. 获取支持的 Webhook 类型列表

**接口**: `GET /api/WebhookConfig/GetWebhookTypes`

**描述**: 获取系统支持的所有 Webhook 类型及说明

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "type": 4,
      "name": "企业微信群机器人",
      "description": "通过企业微信群机器人接收通知",
      "helpUrl": "https://developer.work.weixin.qq.com/document/path/91770"
    },
    {
      "type": 5,
      "name": "钉钉群机器人",
      "description": "通过钉钉群机器人接收通知",
      "helpUrl": "https://open.dingtalk.com/document/robots/custom-robot-access"
    },
    {
      "type": 6,
      "name": "飞书群机器人",
      "description": "通过飞书群机器人接收通知",
      "helpUrl": "https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN"
    }
  ],
  "msg": "success"
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未登录或登录已过期 |
| 403 | 无权限访问 |
| 500 | 服务器内部错误 |

**常见错误消息**:
- "不支持的 Webhook 类型，仅支持企业微信、钉钉、飞书"
- "Webhook URL 格式不正确"
- "该 Webhook URL 已存在"
- "每个用户最多可配置 10 个 Webhook"
- "Webhook 配置不存在或无权限"

---

## 使用流程

### 1. 配置企业微信群机器人

1. 在企业微信群中添加群机器人
2. 复制 Webhook URL
3. 调用 `AddWebhook` 接口添加配置
4. 调用 `TestWebhook` 接口测试连通性
5. 等待店铺掉线时接收通知

### 2. 配置钉钉群机器人

1. 在钉钉群中添加自定义机器人
2. 复制 Webhook URL
3. 调用 `AddWebhook` 接口添加配置
4. 调用 `TestWebhook` 接口测试连通性
5. 等待店铺掉线时接收通知

### 3. 配置飞书群机器人

1. 在飞书群中添加自定义机器人
2. 复制 Webhook URL
3. 调用 `AddWebhook` 接口添加配置
4. 调用 `TestWebhook` 接口测试连通性
5. 等待店铺掉线时接收通知

---

## 店铺掉线通知示例

当店铺掉线时,系统会自动向用户配置的所有已启用的 Webhook 推送通知:

```
⚠️ 店铺掉线通知 ⚠️

店铺名称: 测试店铺
店铺ID: shop_123456
平台类型: Elm
掉线时间: 2026-01-13 15:30:00
掉线原因: 授权过期

请及时处理店铺授权问题,以免影响业务运行。
```

---

## 注意事项

1. **安全性**: 请妥善保管 Webhook URL,避免泄露
2. **限制**: 每个用户最多配置 10 个 Webhook
3. **去重**: 同一个 Webhook URL 不能重复添加
4. **权限**: 只能管理自己的 Webhook 配置
5. **测试**: 建议添加后立即测试,确保配置正确
6. **启用状态**: 只有启用状态的 Webhook 才会接收通知
7. **店铺关联**: 通过 `t_wmt_shop_list.MgAgencys` 字段自动关联管理的店铺

---

## 开发者信息

- **版本**: v1.0
- **最后更新**: 2026-01-13
- **维护者**: Alien 开发团队
