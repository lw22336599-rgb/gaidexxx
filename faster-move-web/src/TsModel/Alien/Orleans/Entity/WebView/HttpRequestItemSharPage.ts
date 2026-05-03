import {SetCookieDomanItemInfo} from "@/TsModel/Alien/Orleans/Entity/WebView/SetCookieDomanItemInfo";

import {HttpRequestItem} from "@/TsModel/Alien/Orleans/Entity/WebView/HttpRequestItem";
export interface HttpRequestItemSharPage extends HttpRequestItem {
		SetCookieDomanInfos: SetCookieDomanItemInfo[];
		ReturnCookies: boolean;
		ReturnPostdata: boolean;
		HeaderWhitelist?: string[] | null;
}
