import {BaseSysGroup} from "@/TsModel/Alien/Entity/Tabls/BaseSysGroup";
export interface t_wmt_course extends BaseSysGroup {
		index: number;
		title: string;
		src: string;
		img: string;
		/** 所属用户*/
		admin: string;
}
