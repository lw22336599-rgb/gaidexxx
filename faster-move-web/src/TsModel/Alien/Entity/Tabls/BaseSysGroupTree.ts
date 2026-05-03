/** 让表支持分组和树*/
import {BaseSysGroup} from "@/TsModel/Alien/Entity/Tabls/BaseSysGroup";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface BaseSysGroupTree extends BaseSysGroup, ITree {
		Parent: string;
		AllParent: string[];
}
