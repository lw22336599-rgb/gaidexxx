/** 聊天成员列表分页请求参数*/
export interface ChatMemberPageRequest {
  /** 页码（从1开始）*/
  PageIndex: number;
  /** 每页数量*/
  PageSize: number;
  /** 关键词（搜索昵称、备注、ID）*/
  Keyword?: string | null;
  /** 仅返回这些联系人 OffId（白名单）。非 null 且非空时生效 */
  OnlyMemberOffIds?: string[] | null;
}
