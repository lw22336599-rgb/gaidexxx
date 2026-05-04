import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import type { TaskProgressBase } from '@/TsModel/Alien/Common/TaskProgressBase'
import type { FoodItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem'

export interface GetGroupFoodsParms {
  /** 目标分组*/
  GroupList: FoodGroupItem[]
  /** 进度条*/
  CallProcess?: TaskProgressBase | null
  /** 商品处理对像*/
  DisQueueTask: Alien.Common.QueueTaskAsync<FoodItem>
}
