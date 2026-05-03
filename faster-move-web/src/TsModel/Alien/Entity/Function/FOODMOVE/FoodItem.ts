import {FoodProperty} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodProperty";
import {FoodGroupItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";

/** 老到新 也是最终向平台提交的最终数据结构类型*/
import {FoodItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItemBase";
export interface FoodItem extends FoodItemBase {
		/** 由系统分配给此对像的id 非双方平台的*/
		id: string;
		/** 商品类目属性列表*/
		Properties?: FoodProperty[] | null;
		/** 多分组表示这个商品属性多个分组 零售时多用*/
		GroupMulti: FoodGroupItem[];
}
