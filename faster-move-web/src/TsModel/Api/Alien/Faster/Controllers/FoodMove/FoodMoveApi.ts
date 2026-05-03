/**
 * FoodMove API 请求类
 * 命名空间: Alien.Faster.Controllers.FoodMove
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { ActivityType } from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";
import { AddFoodToTaskParms } from "@/TsModel/SiteType/Base/Controllers/AddFoodToTaskParms";
import { AddGroupToTaskParms } from "@/TsModel/SiteType/Base/Controllers/AddGroupToTaskParms";
import { FdmvTaskType } from "@/TsModel/Alien/Entity/Function/FOODMOVE/FdmvTaskType";
import { FoodGroupItem } from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";
import { FoodItemVo } from "@/TsModel/SiteType/Base/Models/FoodMove/FoodItemVo";
import { FoodMoveConf } from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConf";
import { FoodTaskLog } from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodTaskLog";
import { FoodTaskLogError } from "@/TsModel/SiteType/Base/Controllers/FoodTaskLogError";
import { GetLogParms } from "@/TsModel/SiteType/Base/Controllers/GetLogParms";
import { ProgressInfo } from "@/TsModel/Alien/Entity/ProgressInfo";
import { QueryShopItemVo } from "@/TsModel/SiteType/Base/Controllers/QueryShopItemVo";
import { ShopMoveInfo } from "@/TsModel/SiteType/Base/Models/FoodMove/ShopMoveInfo";
import { SyncFoodsParms } from "@/TsModel/SiteType/Base/Controllers/SyncFoodsParms";
import { SyncGroupsParms } from "@/TsModel/SiteType/Base/Controllers/SyncGroupsParms";
import { t_fdmv_ctgry } from "@/TsModel/Alien/Entity/Tables/function/food_move/t_fdmv_ctgry";
import { t_wmt_fc_fdmv_log } from "@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_log";
import { t_wmt_fc_fdmv_task_actcopy } from "@/TsModel/Alien/Entity/Tables/function/food_move/task/t_wmt_fc_fdmv_task_actcopy";
import { t_wmt_fc_fdmv_task } from "@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_task";
import { t_wmt_fd_fdmv_task_history } from "@/TsModel/Alien/Entity/Tables/function/food_move/task/t_wmt_fd_fdmv_task_history";
import { t_wmt_shop_list } from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list";
import { UpdateFoodSpuPrice } from "@/TsModel/SiteType/Base/Models/FoodMove/UpdateFoodSpuPrice";
import { UpdateFoodVoParms } from "@/TsModel/SiteType/Base/Controllers/UpdateFoodVoParms";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 店铺搬家服务 */
export class FoodMoveApi {
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
    this.axiosInstance = axiosInstance;
    this.baseUrl = baseUrl;
  }

  /** 检查老店数据是否准备好 */
  async IsOldShopDataReady(taskId: string): Promise<boolean> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/IsOldShopDataReady`,
      params: { taskId },
    };

    const response: AxiosResponse<boolean> = await this.axiosInstance(config);
    return response.data;
  }

  /** 重置老店和任务 */
  async ResetOldShopData(taskId: string): Promise<string> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/ResetOldShopData`,
      params: { taskId },
    };

    const response: AxiosResponse<string> = await this.axiosInstance(config);
    return response.data;
  }

  async StartTask(taskId: string, taskType: FdmvTaskType): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/StartTask`,
      params: { taskId, taskType },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 停止任务 */
  async StopTask(taskId: string, taskType: FdmvTaskType): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/StopTask`,
      params: { taskId, taskType },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 查询任务执行进度 */
  async TaskProgress(taskId: string, taskType: FdmvTaskType): Promise<ProgressInfo> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/TaskProgress`,
      params: { taskId, taskType },
    };

    const response: AxiosResponse<ProgressInfo> = await this.axiosInstance(config);
    return response.data;
  }

  /** 准备老店数据 */
  async BeginData(taskId: string): Promise<ProgressInfo> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/BeginData`,
      params: { taskId },
    };

    const response: AxiosResponse<ProgressInfo> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取老店数据 此过程会调用父类相关采集方法,然后自动加入数据库并自动加入任务 */
  async GetData(taskId: string): Promise<ShopMoveInfo> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/GetData`,
      params: { taskId },
    };

    const response: AxiosResponse<ShopMoveInfo> = await this.axiosInstance(config);
    return response.data;
  }

  /** 通过门店i拿到店铺对像 */
  async GetShopWithOffid(officeId: string): Promise<t_wmt_shop_list> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/GetShopWithOffid`,
      params: { officeId },
    };

    const response: AxiosResponse<t_wmt_shop_list> = await this.axiosInstance(config);
    return response.data;
  }

  /** 查询名下店铺 */
  async QueryShops(words: string): Promise<QueryShopItemVo[]> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/FoodMove/QueryShops`,
      params: { words },
    };

    const response: AxiosResponse<QueryShopItemVo[]> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取新店类目 */
  async GetNewSiteCtgry(/** 任务id */
    taskId: string, /** 上级id 不填将返回类目 */
    parentId?: string): Promise<t_fdmv_ctgry[]> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/FoodMove/GetNewSiteCtgry`,
      params: { taskId, parentId },
    };

    const response: AxiosResponse<t_fdmv_ctgry[]> = await this.axiosInstance(config);
    return response.data;
  }

  /** 从老店获取分组列表 */
  async GetOldShopGroupList(taskId: string): Promise<FoodGroupItem[]> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/FoodMove/GetOldShopGroupList`,
      params: { taskId },
    };

    const response: AxiosResponse<FoodGroupItem[]> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取分组下的商品列表 */
  async GetGroupFoods(/** 任务ID */
    taskId: string, /** 分组ID */
    groupId: string, /** 页码 */
    page: number, /** 每页大小 */
    pageSize: number, /** 商品名称过滤（可选） */
    foodName?: string): Promise<PageResultVo<FoodItemVo>> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/GetGroupFoods`,
      params: { taskId, groupId, page, pageSize, foodName },
    };

    const response: AxiosResponse<PageResultVo<FoodItemVo>> = await this.axiosInstance(config);
    return response.data;
  }

  /** 同步商品分组 */
  async SyncGroups(parms: SyncGroupsParms): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncGroups`,
      data: parms,
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  async TaskQuery(page: number, pageSize: number, shopOffId?: string): Promise<PageResultVo<t_wmt_fd_fdmv_task_history>> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/TaskQuery`,
      params: { page, pageSize, shopOffId },
    };

    const response: AxiosResponse<PageResultVo<t_wmt_fd_fdmv_task_history>> = await this.axiosInstance(config);
    return response.data;
  }

  /** 商品复制任务 */
  async SyncFoodsProgress(taskId: string): Promise<ProgressInfo> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncFoodsProgress`,
      params: { taskId },
    };

    const response: AxiosResponse<ProgressInfo> = await this.axiosInstance(config);
    return response.data;
  }

  /** 更新规则列表 如果更新了规则最好执行下 */
  async UpdateRules(): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/UpdateRules`,
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 上传指定商品 */
  async SyncFoods(parms: SyncFoodsParms): Promise<ProgressInfo> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncFoods`,
      data: parms,
    };

    const response: AxiosResponse<ProgressInfo> = await this.axiosInstance(config);
    return response.data;
  }

  /** 同步商品上下架状态 */
  async SyncSellState(taskId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncSellState`,
      params: { taskId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 同步店铺装修 */
  async SyncDecorate(taskId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncDecorate`,
      params: { taskId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  async SyncIndexSet(taskId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncIndexSet`,
      params: { taskId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 拉取老店活动列表 */
  async PullOldShopActivitys(/** 任务ID */
    taskId: string): Promise<ProgressInfo> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/PullOldShopActivitys`,
      params: { taskId },
    };

    const response: AxiosResponse<ProgressInfo> = await this.axiosInstance(config);
    return response.data;
  }

  /** 同步活动 */
  async SyncActivitys(taskId: string, /** 限定活动类型,哪果不传代表不限制 */
    actType?: ActivityType): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/SyncActivitys`,
      params: { taskId, actType },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 重置新店铺 */
  async ResetNewShop(/** 任务ID */
    taskId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/ResetNewShop`,
      params: { taskId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取任务日志 */
  async GetLog(parms: GetLogParms): Promise<PageResultVo<t_wmt_fc_fdmv_log>> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/FoodMove/GetLog`,
      data: parms,
    };

    const response: AxiosResponse<PageResultVo<t_wmt_fc_fdmv_log>> = await this.axiosInstance(config);
    return response.data;
  }

  async TestOpenCv4(imgUrl: string): Promise<string> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/TestOpenCv4`,
      params: { imgUrl },
    };

    const response: AxiosResponse<string> = await this.axiosInstance(config);
    return response.data;
  }

  async TestIoebCv42(): Promise<string> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/TestIoebCv42`,
    };

    const response: AxiosResponse<string> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取商品复制日志 */
  async GetFoodTaskLog(taskId: string, page: number, pageSize: number, /** （复制是否成功）不填代表所有日志 */
    succeed?: boolean): Promise<PageResultVo<FoodTaskLog>> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/FoodMove/GetFoodTaskLog`,
      params: { taskId, page, pageSize, succeed },
    };

    const response: AxiosResponse<PageResultVo<FoodTaskLog>> = await this.axiosInstance(config);
    return response.data;
  }

  /** 查询商品任务是否成功 不成功报错信息 */
  async QueryFoodTask(taskId: string, foodId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/QueryFoodTask`,
      params: { taskId, foodId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取任务错误日志 */
  async GetFoodTaskErrLog(/** 任务ID */
    taskId: string, /** 页码 */
    page: number, /** 每页大小 */
    pageSize: number, /** 商品名称过滤（可选） */
    foodName?: string): Promise<PageResultVo<FoodTaskLogError>> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/GetFoodTaskErrLog`,
      params: { taskId, page, pageSize, foodName },
    };

    const response: AxiosResponse<PageResultVo<FoodTaskLogError>> = await this.axiosInstance(config);
    return response.data;
  }

  /** 获取活动复制日志 */
  async GetActivityTaskLog(taskId: string, page: number, pageSize: number, /** （复制是否成功）不填代表所有 */
    succeed?: boolean, /** 限制活动类型，不传代表所有 */
    actType?: ActivityType): Promise<PageResultVo<t_wmt_fc_fdmv_task_actcopy>> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/GetActivityTaskLog`,
      params: { taskId, page, pageSize, succeed, actType },
    };

    const response: AxiosResponse<PageResultVo<t_wmt_fc_fdmv_task_actcopy>> = await this.axiosInstance(config);
    return response.data;
  }

  /** 创建任务 */
  async CreateTask(conf: FoodMoveConf): Promise<t_wmt_fc_fdmv_task> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/CreateTask`,
      data: conf,
    };

    const response: AxiosResponse<t_wmt_fc_fdmv_task> = await this.axiosInstance(config);
    return response.data;
  }

  /** 批量更新商品价格 会把所有商品id的sku值改成指定的金额 */
  async BeachUpdateFoodPrice(parms: UpdateFoodSpuPrice): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/BeachUpdateFoodPrice`,
      data: parms,
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 更改商品 */
  async UpdaetFood(foodVo: UpdateFoodVoParms): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/UpdaetFood`,
      data: foodVo,
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 查询商品复制异常数量 */
  async FoodFailCount(taskId: string): Promise<number> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/FoodFailCount`,
      params: { taskId },
    };

    const response: AxiosResponse<number> = await this.axiosInstance(config);
    return response.data;
  }

  /** 添加分组到任务 */
  async AddGroupToTask(/** 分组对像 */
    parms: AddGroupToTaskParms): Promise<string> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/AddGroupToTask`,
      data: parms,
    };

    const response: AxiosResponse<string> = await this.axiosInstance(config);
    return response.data;
  }

  /** 添加分组到任务 */
  async AddGroupToTaskV2(/** 分组对像 */
    parms: AddGroupToTaskParms): Promise<FoodGroupItem> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/AddGroupToTaskV2`,
      data: parms,
    };

    const response: AxiosResponse<FoodGroupItem> = await this.axiosInstance(config);
    return response.data;
  }

  /** 添加商品到任务 */
  async AddFoodToTask(food: AddFoodToTaskParms): Promise<string> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/AddFoodToTask`,
      data: food,
    };

    const response: AxiosResponse<string> = await this.axiosInstance(config);
    return response.data;
  }

  /** 从任务中删除商品 */
  async RemoveFoodFromTask(/** 任务ID */
    taskId: string, /** 商品数据库ID（t_wmt_fc_fdmv_food.id） */
    foodId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/RemoveFoodFromTask`,
      params: { taskId, foodId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 释放任务 */
  async DisposeTask(taskId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/DisposeTask`,
      params: { taskId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 导出指定任务的老店商品数据（压缩加密包），供竞对复制导入使用，最多 1000 条商品。 */
  async ExportTaskFoodData(/** 任务ID */
    taskId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/ExportTaskFoodData`,
      params: { taskId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

  /** 导入商品数据到竞对复制任务，从其他任务导出的压缩加密包。传入新店ID，有任务则重置后导入，无任务则创建后导入；包中老店不存在时自动创建。 */
  async ImportTaskFoodData(/** 新店ID（t_wmt_shop_list.id） */
    newShopId: string, /** 导出包文件 */
    packageFile: any): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/FoodMove/ImportTaskFoodData`,
      data: packageFile,
      params: { newShopId },
    };

    const response: AxiosResponse<any> = await this.axiosInstance(config);
    return response.data;
  }

}
