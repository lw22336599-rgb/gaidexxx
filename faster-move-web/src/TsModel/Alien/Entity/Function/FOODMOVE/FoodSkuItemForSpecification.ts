import {UintType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/UintType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 打包费针对的规格和属性*/
export interface FoodSkuItemForSpecification {
		/** 这是规格组id 由系统生成的.可以反向去查找*/
		SpecId: string;
		/** 规格组名*/
		SpecName: string;
		/** 这是选项id 由系统生成,可以反向查找层级*/
		OptId: string;
		/** 规格选项名*/
		OptionName: string;
		/** skuid 其实这里skuid 在同一ForSpec 都会一样*/
		SkuId: string;
		/** 值*/
		Weight: number;
		/** 单位*/
		WeightType: UintType;
		/** 在规格第几层*/
		Level: number;
		/** 对像的其他值*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
