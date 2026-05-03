import * as Comm from '@/TsModel/Comm/Comm';

/** Post 数据类型：0=String，1=Byte，2=FilePath，3=Form_Data */
export const PostDataType = {
  String: 0,
  Byte: 1,
  FilePath: 2,
  Form_Data: 3,
} as const

export interface HttpRequestItem {
  URL: string
  Method: string
  Timeout: number
  Accept: string
  ContentType: string
  Postdata?: string | null
  /** 0=String，1=Byte，2=FilePath，3=Form_Data */
  PostDataType?: number
  /** 仅 PostDataType===3 时有效 */
  Form_Data?: Comm.Dictionary<string, string> | null
  Cookie?: string | null
  Headers?: Comm.Dictionary<string, string> | null
  UseInterceptor: boolean
}
