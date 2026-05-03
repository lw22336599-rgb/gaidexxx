import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 系统配置整体实体（前端初始化时一次性获取）*/
export interface SystemConfigAllDto {
		/** 在线客服地址*/
		CustomerServiceUrl: string;
		/** 软件下载地址*/
		DownloadUrl: string;
		/** 商务洽谈联系方式*/
		BusinessContact: string;
		/** 门店管理下显示哪些平台的菜单*/
		ShopManagePlatforms: ShopType[];
		/** 店铺复制下显示哪些平台的菜单*/
		ShopCopyPlatforms: ShopType[];
		/** 店铺调研下显示哪些平台的菜单*/
		ShopResearchPlatforms: ShopType[];
}
