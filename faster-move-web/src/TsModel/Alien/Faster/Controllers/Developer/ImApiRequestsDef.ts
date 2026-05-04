import type { ReplyMessageRequest } from '@/TsModel/Alien/Faster/Controllers/IM/ReplyMessageRequest'
import type { TagRequest } from '@/TsModel/Alien/Faster/Controllers/IM/TagRequest'
import type { RemarksRequest } from '@/TsModel/Alien/Faster/Controllers/IM/RemarksRequest'
import type { CloseSessionRequest } from '@/TsModel/Alien/Faster/Controllers/IM/CloseSessionRequest'
import type { TransferSessionRequest } from '@/TsModel/Alien/Faster/Controllers/IM/TransferSessionRequest'

/** API 请求模型定义*/
export interface ImApiRequestsDef {
  /** 回复消息请求*/
  ReplyMessage: ReplyMessageRequest
  /** 标签请求*/
  Tag: TagRequest
  /** 备注请求*/
  Remarks: RemarksRequest
  /** 关闭会话请求*/
  CloseSession: CloseSessionRequest
  /** 转交会话请求*/
  TransferSession: TransferSessionRequest
}
