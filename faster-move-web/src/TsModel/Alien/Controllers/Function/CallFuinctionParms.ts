import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 调用功能方法的参数*/
export interface CallFuinctionParms {
		/** 店铺类型*/
		ShopType: ShopType;
		/** 功能代码*/
		FunctionCode: string;
		/** 店铺ID*/
		ShopId: string;
		/** 要调用的方法名称*/
		Method: string;
		/** 方法参数对象（JSON字符串）*/
		ParmsObj: string;
}
