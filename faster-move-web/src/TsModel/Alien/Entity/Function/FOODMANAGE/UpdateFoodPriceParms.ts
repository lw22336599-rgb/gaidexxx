import type { UpdateSpuInSkuItem } from '@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateSpuInSkuItem'
import type { ChangePriceTypeEnum } from '@/TsModel/Alien/Entity/Function/FOODMANAGE/ChangePriceTypeEnum'

import type { FoodManageParmsBase } from '@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase'
export interface UpdateFoodPriceParms extends FoodManageParmsBase {
  /** 要更新的商品和sku列表，如果为空则更新全部商品*/
  Targets?: UpdateSpuInSkuItem[] | null
  ChangeType: ChangePriceTypeEnum
  Value: number
}
