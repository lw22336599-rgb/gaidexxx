export interface PushDataItem {
  /** 启用推送*/
  Enable: boolean
  /** 开始时间 为空代表或00:00:00不限定时间*/
  Time?: any | null
  /** 结束时间 为空代表不限定时间,如果设置了则在此时间之后不推送*/
  EndTime?: any | null
}
