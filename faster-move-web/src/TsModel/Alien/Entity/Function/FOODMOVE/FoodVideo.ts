import * as Comm from '@/TsModel/Comm/Comm';

/** 商品视频*/
export interface FoodVideo {
		/** 视频图片地址*/
		Img?: string | null;
		/** 视频地址*/
		VideoUrl: string;
		/** 排序 从 0开始*/
		Index: number;
		/** 其他信息 比如饿了么还有图片的哈希等*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
