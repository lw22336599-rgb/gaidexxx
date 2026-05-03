import {UserType} from "@/TsModel/Alien/Entity/Enums/UserType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_feedback extends BaseSys {
		/** 反馈用户*/
		user: string;
		/** 上级*/
		parent: string;
		/** 联系方式*/
		contact: string;
		/** 反馈图片*/
		img: string[];
		msg: string;
		/** 是否已读*/
		is_read: boolean;
		/** 反馈消息的用户类型*/
		user_type?: UserType | null;
}
