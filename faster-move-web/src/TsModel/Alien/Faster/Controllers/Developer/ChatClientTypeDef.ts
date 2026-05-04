import type { ChatClientEnumsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ChatClientEnumsDef'
import type { ChatClientEntitiesDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ChatClientEntitiesDef'
import type { ChatClientConfigsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ChatClientConfigsDef'
import type { ChatClientHubMethodsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ChatClientHubMethodsDef'
import type { WebhookInfoDef } from '@/TsModel/Alien/Faster/Controllers/Developer/WebhookInfoDef'

/** 聊天客户端类型定义*/
export interface ChatClientTypeDef {
  /** 枚举定义*/
  Enums: ChatClientEnumsDef
  /** 实体定义*/
  Entities: ChatClientEntitiesDef
  /** 配置定义*/
  Configs: ChatClientConfigsDef
  /** SignalR Hub 方法定义*/
  HubMethods: ChatClientHubMethodsDef
  /** Webhook 配置说明*/
  WebhookInfo: WebhookInfoDef
}
