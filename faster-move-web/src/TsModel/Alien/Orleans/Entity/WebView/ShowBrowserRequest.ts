import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopState} from "@/TsModel/Alien/Entity/Enums/ShopState";
import {BrowserInfo} from "@/TsModel/Alien/Orleans/Entity/WebView/BrowserInfo";
import {HttpRequestItem} from "@/TsModel/Alien/Orleans/Entity/WebView/HttpRequestItem";

export interface ShowBrowserRequest {
		Id: string;
		Name: string;
		User: string;
		ShopType: ShopType;
		ShopUser?: string | null;
		ShopPassword?: string | null;
		OfficeId: string;
		Cookies?: string | null;
		State: ShopState;
		EndTime: Date;
		Img?: string | null;
		MainShop?: string | null;
		BrowserInfo?: BrowserInfo | null;
		AfterRequest?: HttpRequestItem | null;
}
