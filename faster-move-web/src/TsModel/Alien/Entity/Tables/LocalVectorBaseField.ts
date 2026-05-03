/** 本地数据库字段*/
export interface LocalVectorBaseField {
		/** 向量数据库中的id 也是表id 此值不用手动附值 。会自动附值*/
		VectorId: number;
		/** 相似度*/
		Distances?: number | null;
}
