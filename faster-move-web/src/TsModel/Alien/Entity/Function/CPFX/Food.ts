import {Food_Group} from "@/TsModel/Alien/Entity/Function/CPFX/Food_Group";

/** 对一个页面的封装*/
export interface Food {
		UpTime: Date;
		Groups?: Food_Group[] | null;
}
