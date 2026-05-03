import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ActivityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";
import {CreateTaskTypeEnum} from "@/TsModel/Alien/Entity/Enums/CreateTaskTypeEnum";
import {DbType} from "@/TsModel/SqlSugar/DbType";
import {TaskStateType} from "@/TsModel/Alien/Entity/Enums/TaskStateType";

/** 店铺搬家任务表*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_fc_fdmv_task extends BaseSys {
		/** 任务创建人*/
		admin: string;
		/** 老店 t_wmt_shop_list.id 如果为空就是竞对店铺*/
		old_shop?: string | null;
		/** 如果是老到新就是门店id 如果是竞对就是前端指定 如（md5=店铺+地址）*/
		old_shop_offid: string;
		/** 老店类型*/
		old_shop_type: ShopType;
		/** 复制到新店 t_wmt_shop_list.id*/
		new_shop: string;
		/** 到新店铺的门店id*/
		new_shop_offid: string;
		/** 新店类型*/
		new_shop_type: ShopType;
		/** 开始搬家之前重置新店*/
		reset_new_shop: boolean;
		/** 同步库存,如果为false 新店数据库存全部为99999*/
		sync_stock: boolean;
		/** 同步活动列表*/
		sync_activitys: boolean;
		/** 商品类目用推荐模式*/
		category_use_recomend: boolean;
		/** 开启 ai 推荐属性(针对映射失败的)*/
		attr_recomend?: boolean | null;
		/** 属性推荐最小相似度(百分比)*/
		attr_recomend_s?: number | null;
		/** 仅同步这些活动 如果为空就是全部活动*/
		OnlyActivitys?: ActivityType[] | null;
		/** 同步老店的上下架状态 如果为false 哪到到新店的商品将全部为下架状态*/
		sync_sale_state: boolean;
		/** 最大线程数*/
		MaxThreads: number;
		/** 尝试去除水印*/
		RemoveWaterMark: boolean;
		/** 上次批量复制时间*/
		batch_time?: Date | null;
		/** 表示老店是竞对店铺*/
		is_contend: boolean;
		/** 任务类型*/
		TaskType?: CreateTaskTypeEnum | null;
		/** 数据库类型*/
		DbType?: DbType | null;
		/** 如果数据库是mysql类型 此值为true时就不会在去初始化数据库了*/
		db_isini?: boolean | null;
		/** 数据库存放目录*/
		db_path?: string | null;
		/** 其他设置 json 内容如平台 非通用的*/
		other_conf?: string | null;
		/** 任务阶段列表  -> t_ls_job_info.task_name*/
		task_stages?: string[] | null;
		/** 当前阶段-> t_ls_job_info.task_name*/
		current_stage?: string | null;
		/** 任务状态 1:需人工处理*/
		TaskState: TaskStateType;
}
