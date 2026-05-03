/** 支持过期数据删除的父表类*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface BaseSysExTime extends BaseSys {
		/** 数据过期时间,超过这个时间后，就删除*/
		ExTime: Date;
}
