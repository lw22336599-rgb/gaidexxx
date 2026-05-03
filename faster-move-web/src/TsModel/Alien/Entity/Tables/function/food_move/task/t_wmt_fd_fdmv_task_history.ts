import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 任务历史*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fd_fdmv_task_history extends BaseSysExTime {
		/** 任务id*/
		task: string;
		/** 创建任务的人*/
		admin: string;
		/** 老店类型*/
		old_type: ShopType;
		/** 老店名称*/
		old_name: string;
		/** 老店门店id*/
		old_offid: string;
		/** 新店类型*/
		new_type: ShopType;
		/** 新店名*/
		new_name: string;
		/** 新店门店id*/
		new_offid: string;
		/** 复制时间*/
		copy_time?: Date | null;
		/** 成功数量*/
		ok_count: number;
		/** 失败数量*/
		fail_count: number;
}
