import type { WeatherClass } from '@/TsModel/Alien/Controllers/AppData/WeatherClass'
import type { DataValueType } from '@/TsModel/Alien/Controllers/AppData/DataValueType'
import type { TopDataItem } from '@/TsModel/Alien/Controllers/AppData/TopDataItem'
import type * as Comm from '@/TsModel/Comm/Comm'
import type { t_biz_calendar } from '@/TsModel/Alien/Entity/Tables/Business/t_biz_calendar'
import type { MemberDataMonthClass } from '@/TsModel/Alien/Controllers/AppData/MemberDataMonthClass'
import type { MemberDataMonthClassShop } from '@/TsModel/Alien/Controllers/AppData/MemberDataMonthClassShop'
import type { CalenderCount } from '@/TsModel/Alien/Controllers/AppData/CalenderCount'
import type { AdminBalanceTop } from '@/TsModel/Alien/Controllers/AppData/AdminBalanceTop'

export interface AppHomeDataV2 {
  /** 当前城市天气(可能为空)*/
  weather?: WeatherClass | null
  /** 顶部四个数据指标*/
  top_data: Comm.Dictionary<DataValueType, TopDataItem>
  /** 最近一周数据*/
  last_week: Comm.Dictionary<string, Comm.Dictionary<DataValueType, number>>
  /** 待办事项和更新记录*/
  calendar_top10: t_biz_calendar[]
  /** 更新记录*/
  update_top10: t_biz_calendar[]
  /** 月度成员数据排行*/
  month_pay_member: MemberDataMonthClass[]
  /** 月度名下成员数排行*/
  month_member_count: MemberDataMonthClass[]
  /** 月度名下店铺数排行*/
  month_shop_count: MemberDataMonthClassShop[]
  /** 待办事项统计*/
  calendar_count: CalenderCount
  /** 团队成员*/
  BalanceTop: AdminBalanceTop[]
}
