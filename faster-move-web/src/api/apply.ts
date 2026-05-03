import { apiManager } from '@/TsModel/Api/ApiManager'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'
import { FunctionSaveVo } from '@/TsModel/Alien/Controllers/Function/FunctionSaveVo'
import { GetFuncListItemVo } from '@/TsModel/Alien/Controllers/Function/GetFuncListItemVo'

/**
 * 获取功能列表
 * @param params 查询参数，包含 shoptype 和 avtag
 * @returns 功能列表
 */
export const getFuncList = async (params: { shoptype: number; avtag?: boolean }): Promise<GetFuncListItemVo[]> => {
  const shopType = params.shoptype as ShopType
  const avtag = params.avtag
  return await apiManager.functionappApi.GetFuncList(shopType, avtag)
}

/**
 * 添加功能
 * @param data 功能数据
 * @returns 添加后的功能数据
 */
export const addFunction = async (data: t_wmt_function): Promise<t_wmt_function> => {
  return await apiManager.functionappApi.AddFunction(data)
}

/**
 * 编辑功能
 * @param data 功能保存数据
 */
export const editFunction = async (data: FunctionSaveVo): Promise<void> => {
  return await apiManager.functionappApi.UpdateFunction(data)
}

/**
 * 设置功能启用/禁用状态
 * @param data 包含 id 和 avtag 的对象
 */
export const setAvtag = async (data: { id: string; avtag: boolean }): Promise<void> => {
  return await apiManager.functionappApi.SetAvtag(data.id, data.avtag)
}

/**
 * 删除应用
 * @param id 功能id
 */
export const deleteFunction = async (id: string): Promise<void> => {
  return await apiManager.functionappApi.DeleteFunction(id)
}
