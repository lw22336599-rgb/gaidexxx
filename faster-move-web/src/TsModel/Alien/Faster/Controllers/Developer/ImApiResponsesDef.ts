import {ReplyMessageResult} from "@/TsModel/Alien/Faster/Controllers/IM/ReplyMessageResult";
import {OnlineAdminsVo} from "@/TsModel/Alien/Faster/Controllers/IM/OnlineAdminsVo";
import {AdminWorkloadVo} from "@/TsModel/Alien/Faster/Controllers/IM/AdminWorkloadVo";
import {MyWorkloadVo} from "@/TsModel/Alien/Faster/Controllers/IM/MyWorkloadVo";
import {t_wmt_im_session} from "@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session";

/** API 响应模型定义*/
export interface ImApiResponsesDef {
		/** 回复消息结果*/
		ReplyMessageResult: ReplyMessageResult;
		/** 在线客服列表*/
		OnlineAdmins: OnlineAdminsVo;
		/** 客服工作负载*/
		AdminWorkload: AdminWorkloadVo;
		/** 我的工作负载*/
		MyWorkload: MyWorkloadVo;
		/** 分页结果*/
		PageResult: Alien.Entity.GlobalModel.PageResultVo<t_wmt_im_session>;
}
