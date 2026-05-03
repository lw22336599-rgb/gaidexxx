import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 更新工具功能入参*/
export interface ToolItemUpdateDto {
		/** 功能标题*/
		Name: string;
		/** 功能描述*/
		Text: string;
		/** 积分*/
		Points: number;
		/** 图标*/
		Img: string;
		/** 是否显示站点图标*/
		ShowSiteIcon: boolean;
		/** 关联功能 code 列表*/
		FunctionCodes: string[];
		/** 可复制的源店铺类型*/
		FromShopTypes: ShopType[];
		/** 教程链接*/
		TutorialUrl: string;
		/** 排序*/
		Sort: number;
		/** 目标店铺类型*/
		TargetShopType: ShopType;
		/** 是否可用*/
		Avtag: boolean;
}
