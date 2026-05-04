/** 更新规则参数*/
import type { AddFdmvRuleParmsVo } from '@/TsModel/Alien/Faster/Controllers/FoodMove/AddFdmvRuleParmsVo'
export interface UpdateFdmvRuleParmsVo extends AddFdmvRuleParmsVo {
  /** 规则ID*/
  id: string
  /** 是否可用*/
  avtag: boolean
}
