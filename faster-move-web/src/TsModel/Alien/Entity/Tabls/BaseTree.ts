import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface BaseTree extends BaseSys, ITree {
		Parent?: string | null;
		AllParent?: string[] | null;
}
