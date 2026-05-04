import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { ShopState } from '@/TsModel/Alien/Entity/Enums/ShopState'
import type { BrowserInfo } from '@/TsModel/Alien/Orleans/Entity/WebView/BrowserInfo'
import type { HttpRequestItem } from '@/TsModel/Alien/Orleans/Entity/WebView/HttpRequestItem'

export interface ShowBrowserRequest {
  Id: string
  Name: string
  User: string
  ShopType: ShopType
  ShopUser?: string | null
  ShopPassword?: string | null
  OfficeId: string
  Cookies?: string | null
  State: ShopState
  EndTime: Date
  Img?: string | null
  MainShop?: string | null
  BrowserInfo?: BrowserInfo | null
  AfterRequest?: HttpRequestItem | null
}
