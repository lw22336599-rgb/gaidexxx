import {ShopLoginResultType} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginResultType";

/** 登陆结果*/
export interface ShopLoginResult {
		/** 返回店铺在数据库中的id*/
		id: string;
		ResultType: ShopLoginResultType;
		/** 如果有错误.就设置网页上的原错误信息*/
		Msg?: string | null;
		/** 如果登陆成功了. 这就是cookies*/
		cookies?: string | null;
		/** 如果需要二维码登陆. 就选二维码*/
		Base64CodeImg?: string | null;
}
