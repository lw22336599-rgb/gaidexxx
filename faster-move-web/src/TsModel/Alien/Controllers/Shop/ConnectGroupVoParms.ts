export interface ConnectGroupVoParms {
		/** 分组id*/
		groupId: string;
		/** 店铺id*/
		shopIds?: string[] | null;
		/** 通过门店id(官方门店id)关联*/
		shopOfficeIds?: string[] | null;
}
