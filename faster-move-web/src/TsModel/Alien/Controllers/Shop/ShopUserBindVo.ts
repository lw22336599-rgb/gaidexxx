import {ShopUserBindItem} from "@/TsModel/Alien/Controllers/Shop/ShopUserBindItem";

/** 绑定店铺的用户*/
export interface ShopUserBindVo {
		BindList: ShopUserBindItem[];
		/** 自动修复*/
		auto_fix: boolean;
		/** 店铺用户*/
		shop_user: string;
		/** 店铺密码*/
		shop_pwd: string;
}
