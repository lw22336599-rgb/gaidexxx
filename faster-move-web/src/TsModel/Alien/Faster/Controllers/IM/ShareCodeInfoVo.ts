import {QuickReplyVo} from "@/TsModel/Alien/Faster/Controllers/IM/QuickReplyVo";

/** 分享码详细信息VO（导入前预览分享码内容）*/
export interface ShareCodeInfoVo {
		/** 分享码*/
		share_code: string;
		/** 分享者ID*/
		admin_id: string;
		/** 分享者姓名*/
		admin_name: string;
		/** 话术总数*/
		script_count: number;
		/** 过期时间（null表示永久有效）*/
		expire_time?: Date | null;
		/** 是否已过期*/
		is_expired: boolean;
		/** 话术列表（分享者的所有话术详细信息）*/
		scripts: QuickReplyVo[];
}
