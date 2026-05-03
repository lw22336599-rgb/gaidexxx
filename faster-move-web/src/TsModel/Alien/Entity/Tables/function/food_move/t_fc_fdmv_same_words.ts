/** 记录所有属性名和属性值的向量值 已经去重复的.为了查找相近意义的来设置*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_fc_fdmv_same_words extends BaseSys {
		/** 词*/
		word: string;
		/** 向量*/
		same: string[];
		/** 相似度 精确两位*/
		similarity: number[];
		/** 相似词数量*/
		count: number;
}
