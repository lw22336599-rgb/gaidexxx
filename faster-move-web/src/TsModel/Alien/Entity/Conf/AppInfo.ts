import {AppInfo_Banner_Item} from "@/TsModel/Alien/Entity/Conf/AppInfo_Banner_Item";

/** 应用信息,等于是贴牌,每个代理可能都有.如果获取失败应该用代理的*/
export interface AppInfo {
		/** 应用名称*/
		name: string;
		description: string;
		/** 应用图标地址*/
		icon_url: string;
		/** 分享标题*/
		share_title?: string | null;
		/** 分享图片*/
		shar_img?: string | null;
		/** 海报横幅-首页*/
		banner_home?: AppInfo_Banner_Item[] | null;
		/** 教程页横幅-首页*/
		banner_course?: AppInfo_Banner_Item[] | null;
		/** 代理id*/
		agency_id?: string | null;
		/** 微信小程序id*/
		wx_appId: string;
		/** 微信公众号id*/
		wx_public_appId: string;
		/** 默认的邀请码,如果只有一个时.就自动填,免得客户端输*/
		code: string;
}
