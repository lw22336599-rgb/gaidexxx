import type { Data_Revn } from '@/TsModel/Alien/Entity/Function/ZNBB/Data_Revn'
import type { Data_Conv } from '@/TsModel/Alien/Entity/Function/ZNBB/Data_Conv'
import type { Data_Repurchase } from '@/TsModel/Alien/Entity/Function/ZNBB/Data_Repurchase'
import type { Data_Ad } from '@/TsModel/Alien/Entity/Function/ZNBB/Data_Ad'
import type { Data_Ad_type } from '@/TsModel/Alien/Entity/Function/ZNBB/Data_Ad_type'

/** 智能报表的首页数据模型*/
export interface ZNBB_Home {
  /** 更新时间*/
  UpTime: Date
  /** 营业收入相关*/
  Revn: Data_Revn
  /** 转化*/
  Conv: Data_Conv
  /** 复购*/
  Repurchase: Data_Repurchase
  /** 推广*/
  Ad: Data_Ad
  /** 推广来源明细*/
  AdTypes: Data_Ad_type[]
}
