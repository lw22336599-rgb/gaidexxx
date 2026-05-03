import {LRFX_Data} from "@/TsModel/Alien/Entity/Function/LRFX/LRFX_Data";

export interface LRFX {
		/** 更新时间*/
		UpTime: Date;
		/** 参考数据*/
		Data: LRFX_Data;
}
