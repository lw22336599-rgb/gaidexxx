/** 移除下级角色的参数*/
export interface RemoveSubordinateRolesVo {
		/** 目标用户ID列表（支持批量操作多个用户）*/
		UserIds: string[];
		/** 要移除的角色（单个角色，必须是当前用户拥有的角色，KEFU角色除外）*/
		Role: string;
}
