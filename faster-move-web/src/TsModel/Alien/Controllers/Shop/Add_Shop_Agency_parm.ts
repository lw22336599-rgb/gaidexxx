import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {AddShopCallBack} from "@/TsModel/Alien/Controllers/Shop/AddShopCallBack";

export interface Add_Shop_Agency_parm {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 店铺用户名*/
		shop_user?: string | null;
		/** 店铺密码*/
		shop_pwd?: string | null;
		/** cookies*/
		cookies: string;
		/** 重置权限 (此店铺的所有其他绑定用户都将取消,只保留当前用户的权限)*/
		reset_power?: boolean | null;
		/** 添加或修复店铺成功时,的回调指定地址协议*/
		CallBack?: AddShopCallBack | null;
}
