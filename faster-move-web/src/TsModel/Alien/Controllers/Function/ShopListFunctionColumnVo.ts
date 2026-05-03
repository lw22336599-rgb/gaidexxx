/** 店铺列表功能列项：供前端决定是否展示该列及是否显示「设置」链接*/
export interface ShopListFunctionColumnVo {
		/** 功能 id，对应 t_wmt_function.id，可空（DB 未配置时）*/
		id?: string | null;
		/** 功能代码，如 ZDCC、IMZDHF*/
		code: string;
		/** 功能名称，用于列头展示*/
		name: string;
		/** 排序序号，来自 t_wmt_function.index*/
		index: number;
		/** 是否实现 Blazor 配置 UI，为 true 时前端可展示「xx设置」入口*/
		hasBlazorUI: boolean;
}
