import {PropertySubValueItem} from "@/TsModel/SiteType/Base/PropertySubValueItem";

/** 支持树型的属性转换*/
export interface ParsePropertiesParms {
		/** 索引 从0开始*/
		index: number;
		/** 属性id 可能没有*/
		off_id: string;
		/** 属性名称*/
		name?: string | null;
		/** 子项 也就是属性值了*/
		SubValues: PropertySubValueItem[];
}
