import {QuickReplyType} from "@/TsModel/Alien/Entity/Enums/IM/QuickReplyType";

/** 导入分享码参数*/
export interface ImportShareCodeDto {
		/** 分享码*/
		share_code: string;
		/** 导入为个人话术还是团队话术*/
		import_as_type: QuickReplyType;
}
