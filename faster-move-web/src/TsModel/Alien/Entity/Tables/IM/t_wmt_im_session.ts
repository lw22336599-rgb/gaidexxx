import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ImSessionStatus} from "@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus";
import * as Comm from '@/TsModel/Comm/Comm';
import {ImOrderDetailVo} from "@/TsModel/Alien/Entity/Function/IM/ImOrderDetailVo";

/** IM会话表
用于管理店铺与客户的聊天会话*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_im_session extends BaseSysExTime {
		/** 店铺ID（t_wmt_shop_list.id）*/
		shop_id: string;
		/** 店铺名*/
		shop_name?: string | null;
		/** 店铺头像*/
		shop_img?: string | null;
		/** 平台类型*/
		site_type: ShopType;
		/** 平台会话id*/
		site_session: string;
		/** 客户ID（平台客户ID）*/
		customer_id: string;
		/** 客户名称*/
		customer_name?: string | null;
		/** 最后一条消息内容（用于会话列表预览）*/
		last_message?: string | null;
		/** 最后消息时间*/
		last_message_time?: Date | null;
		/** 未读消息数*/
		unread_count: number;
		/** 会话状态*/
		status: ImSessionStatus;
		/** 分配的客服ID（关联 t_sc_admin.id）*/
		assigned_admin_id?: string | null;
		/** 负责人上级id*/
		assigned_parent_id?: string | null;
		/** 客服名称（冗余字段）*/
		assigned_admin_name?: string | null;
		/** 分配时间*/
		assigned_at?: Date | null;
		/** 客服最后回复时间*/
		last_admin_reply_at?: Date | null;
		/** 响应超时分钟数（从配置读取设置）*/
		response_timeout_minutes: number;
		/** 会话标签列表（限制5个字符，不含特殊符号）
在PostgreSQL中会映射为jsonb类型*/
		tags?: string[] | null;
		/** 会话备注
在PostgreSQL中会映射为text类型*/
		remarks?: string | null;
		/** 完结说明（会话关闭时填写）*/
		close_reason?: string | null;
		/** 关联的平台订单ID（可空，部分会话可能不关联订单）*/
		site_order_id?: string | null;
		/** 平台扩展数据（JSON格式存储）
用于存储平台特定的额外信息
在PostgreSQL中会映射为jsonb类型*/
		site_data?: Comm.Dictionary<string, string> | null;
		/** 订单信息对像
在PostgreSQL中会映射为jsonb类型*/
		order_info?: ImOrderDetailVo | null;
}
