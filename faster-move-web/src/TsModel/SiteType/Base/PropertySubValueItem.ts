import * as Comm from '@/TsModel/Comm/Comm';

/** 子项*/
export interface PropertySubValueItem {
		/** 属性名称*/
		name: string;
		/** 属性id*/
		officeId: string;
		OtherValues?: Comm.Dictionary<string, string> | null;
}
