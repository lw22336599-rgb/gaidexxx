import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface BaseTreeExTime extends BaseSysExTime, ITree {
		Parent?: string | null;
		AllParent?: string[] | null;
}
