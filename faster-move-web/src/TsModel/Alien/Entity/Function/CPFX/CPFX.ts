import {Food} from "@/TsModel/Alien/Entity/Function/CPFX/Food";

export interface CPFX {
		/** 昨日*/
		Yday?: Food | null;
		/** 近一周*/
		Day7?: Food | null;
		/** 近30天*/
		Day30?: Food | null;
		UpTime: Date;
}
