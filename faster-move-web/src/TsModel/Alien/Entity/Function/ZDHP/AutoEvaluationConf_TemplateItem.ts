export interface AutoEvaluationConf_TemplateItem {
		/** 模板名称*/
		Name: string;
		/** 好评回复列表-回复时会随机抽取*/
		reply_hp_strList?: string[] | null;
		/** 中评回复列表-会随机抽取回复*/
		reply_zp_strList?: string[] | null;
		/** 差评回复列表-会随机抽取回复*/
		reply_cp_strList?: string[] | null;
}
