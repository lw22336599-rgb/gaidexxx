import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {FunctionInfo} from "@/TsModel/Alien/Entity/Client/FunctionInfo";
import * as Comm from '@/TsModel/Comm/Comm';

export interface ClientApp {
		/** 店铺支持的功能列表*/
		Dic_FunctionTypes: Comm.Dictionary<ShopType, Comm.Dictionary<string, System.ValueTuple<FunctionInfo,System.Type>>>;
		/** 工作模式是否为商品复制*/
		WorkModelIsFdmv: System.Lazy<boolean>;
		/** 当前的服务的地址和端口*/
		WebHost?: string[] | null;
}
