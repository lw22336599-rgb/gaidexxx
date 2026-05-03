import {t_wmt_im_session} from "@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session";
import {t_wmt_im_message} from "@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_message";
import {t_wmt_fc_imzdhf_log} from "@/TsModel/Alien/Entity/Tables/function/imzdhf/t_wmt_fc_imzdhf_log";

/** 数据库表实体定义*/
export interface ImTablesDef {
		/** IM 会话表*/
		Session: t_wmt_im_session;
		/** IM 消息表*/
		Message: t_wmt_im_message;
		/** IM 自动回复日志表*/
		AutoReplyLog: t_wmt_fc_imzdhf_log;
}
