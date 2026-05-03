import {ResultPrtyItem} from "@/TsModel/Alien/Entity/FdmvFuncService/ResultPrtyItem";

export interface ResultPrty {
		/** 属性*/
		Prty: ResultPrtyItem;
		/** 相似度*/
		Similarity: number;
		/** 属性值列表*/
		Values: ResultPrtyItem[];
		/** 如果匹配不到 就显示错误消息*/
		msg?: string | null;
}
