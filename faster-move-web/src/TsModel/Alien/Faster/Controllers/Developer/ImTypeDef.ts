import type { ImEnumsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImEnumsDef'
import type { ImMessagesDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImMessagesDef'
import type { ImTablesDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImTablesDef'
import type { ImApiRequestsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImApiRequestsDef'
import type { ImApiResponsesDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImApiResponsesDef'
import type { ImFunctionModelsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImFunctionModelsDef'
import type { ImHubDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImHubDef'
import type { ImApiEndpointsDef } from '@/TsModel/Alien/Faster/Controllers/Developer/ImApiEndpointsDef'

/** IM 类型定义集合*/
export interface ImTypeDef {
  /** 枚举定义*/
  Enums: ImEnumsDef
  /** 消息类型定义*/
  Messages: ImMessagesDef
  /** 数据库表实体定义*/
  Tables: ImTablesDef
  /** API 请求模型定义*/
  ApiRequests: ImApiRequestsDef
  /** API 响应模型定义*/
  ApiResponses: ImApiResponsesDef
  /** 功能相关模型定义*/
  FunctionModels: ImFunctionModelsDef
  /** Hub 定义*/
  Hub: ImHubDef
  /** API 端点定义*/
  ApiEndpoints: ImApiEndpointsDef
}
