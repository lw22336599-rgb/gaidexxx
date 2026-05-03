import {SpecificationType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/SpecificationType";
import {FoodSpecificationOption} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSpecificationOption";
import * as Comm from '@/TsModel/Comm/Comm';

/** 商品规格*/
export interface FoodSpecification {
		/** 规格组id 注意这是自己生成的,用于让sku 对应*/
		id: string;
		/** 规格组类型*/
		SpecType: SpecificationType;
		/** 规格名称，如：份量*/
		Name: string;
		/** 顺序*/
		Index: number;
		/** 选项 如 大份，小份*/
		Options: FoodSpecificationOption[];
		/** 其他信息 比如饿了么可能还会储存其他id*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
