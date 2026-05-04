// types.ts
export interface ShopData {
  id: string
  name: string
  shop_type: number
  office_id: string
  codeStr?: string
  is_top: boolean
  state?: number
  cookies?: string
  // 其他字段...
}

export interface ColumnConfig {
  label: string
  sortable?: boolean
  checked: boolean
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  disableCheck?: boolean
}

export interface TabItem {
  id: string
  label: string
  muted?: boolean
}

export interface WebviewItem extends ShopData {
  muted: boolean
}

export const ShopTypeMap = {
  1: '美团外卖',
  2: '饿了么外卖',
  3: '美团闪购',
  4: '美团医药',
  5: '饿百零售',
  6: '京东到家',
  7: '抖音即时零售'
} as const
