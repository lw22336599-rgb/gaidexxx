/** 第一次创建客户端时, 用于创建服务器自动任务指定客户端名称的方法, 主要用于客户端向服务端报告时. 知道是哪个客户端*/
import {FoodMoveConf} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConf";
export interface InitClient extends FoodMoveConf {
		/** 客户端名称*/
		ClientName: string;
}
