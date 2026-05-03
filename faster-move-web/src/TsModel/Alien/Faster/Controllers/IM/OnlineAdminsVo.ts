import {OnlineAdminItemVo} from "@/TsModel/Alien/Faster/Controllers/IM/OnlineAdminItemVo";

/** 在线客服列表返回对象*/
export interface OnlineAdminsVo {
		/** 在线客服总数*/
		total: number;
		/** 上级ID*/
		parentId: string;
		/** 在线客服列表*/
		admins: OnlineAdminItemVo[];
}
