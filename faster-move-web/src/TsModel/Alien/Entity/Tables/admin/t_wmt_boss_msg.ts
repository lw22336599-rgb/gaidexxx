/** 针对商家的消息*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_boss_msg extends BaseSys {
		/** 所属代理*/
		admin: string;
		/** 标题*/
		title: string;
		msg: string;
}
