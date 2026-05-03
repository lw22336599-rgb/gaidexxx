/** 转交会话请求*/
export interface TransferSessionRequest {
		/** 目标客服ID*/
		ToAdminId: string;
		/** 转交备注（可选）*/
		Remark?: string | null;
}
