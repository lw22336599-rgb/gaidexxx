import {DataValueType} from "@/TsModel/Alien/Controllers/AppData/DataValueType";

/** 顶部数据指标*/
export interface TopDataItem {
		/** 数据类型*/
		data_type: DataValueType;
		/** 标题*/
		title: string;
		/** 单位*/
		unit: string;
		/** 值*/
		count: number;
		/** 相对于昨日*/
		of_yday: number;
}
