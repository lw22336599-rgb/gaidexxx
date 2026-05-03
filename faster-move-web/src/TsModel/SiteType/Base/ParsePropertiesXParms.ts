import {PropertySubValueItem} from "@/TsModel/SiteType/Base/PropertySubValueItem";

/** 支持树型的属性转换*/
export interface ParsePropertiesXParms {
		/** 格式为 a.b.c*/
		OffidPath: string;
		/** 格式为 a.b.c 要与KeyPath*/
		NamePath: string;
		/** 子项*/
		SubValues: PropertySubValueItem[];
}
