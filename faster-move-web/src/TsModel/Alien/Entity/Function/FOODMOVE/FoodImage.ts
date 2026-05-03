import * as Comm from '@/TsModel/Comm/Comm';

/** 记录商品图片的对像,千万别记录大数据,因为要返回给前端*/
export interface FoodImage {
		/** 图片地址*/
		Img: string;
		/** 是否为主图*/
		IsMaster: boolean;
		/** 排序 从 0开始*/
		Index: number;
		/** 其他信息 比如饿了么还有图片的哈希等*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
