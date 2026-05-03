import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 工具功能对外输出模型*/
export interface ToolItemDto {
		/** 主键*/
		Id: string;
		/** 功能标题*/
		Name: string;
		/** 功能说明*/
		Text: string;
		/** 积分*/
		Points: number;
		/** 工具图标 URL*/
		Img: string;
		/** 是否显示站点图标*/
		ShowSiteIcon: boolean;
		/** 关联的功能代码列表（系统功能 code 集合）*/
		FunctionCodes: string[];
		/** 源店铺类型列表*/
		FromShopTypes: ShopType[];
		/** 教程视频 URL*/
		TutorialUrl: string;
		/** 是否可用*/
		Avtag: boolean;
		/** 排序序号*/
		Sort: number;
}
