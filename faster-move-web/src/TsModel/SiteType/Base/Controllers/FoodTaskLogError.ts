import type { FoodItemVo } from '@/TsModel/SiteType/Base/Models/FoodMove/FoodItemVo'

import type { FoodTaskLog } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodTaskLog'
export interface FoodTaskLogError extends FoodTaskLog {
  FoodVo: FoodItemVo
}
