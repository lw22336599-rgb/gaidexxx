import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { RemoteBrowserShopItem } from '/@/TsModel/Alien/Entity/WebView/RemoteBrowserDtos'
import type { GetShopsForRemoteBrowserRequest } from '/@/TsModel/Alien/Entity/WebView/GetShopsForRemoteBrowserRequest'

export interface RemoteBrowserKeyResult {
  Key: string
}

/** 远程浏览器 API */
export class RemoteBrowserApi {
  private baseUrl: string
  private axiosInstance: AxiosInstance

  constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
    this.axiosInstance = axiosInstance
    this.baseUrl = baseUrl
  }

  /** 获取店铺远程浏览器连接密钥 */
  async GetConnectionKey(shopId: string, shopType: number): Promise<RemoteBrowserKeyResult> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/RemoteBrowser/GetConnectionKey`,
      params: { shopId, shopType },
    }
    const response: AxiosResponse<RemoteBrowserKeyResult> = await this.axiosInstance(config)
    return response.data
  }

  /** 获取需要打开远程浏览器的店铺。老到新复制传 [老店id, 新店id]；竞对复制只传 [新店id]。对每个店铺做存在性和权限校验 */
  async GetShopsForRemoteBrowser(request: GetShopsForRemoteBrowserRequest): Promise<RemoteBrowserShopItem[]> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/RemoteBrowser/GetShopsForRemoteBrowser`,
      data: request,
    }
    const response: AxiosResponse<RemoteBrowserShopItem[]> = await this.axiosInstance(config)
    return response.data ?? []
  }
}
