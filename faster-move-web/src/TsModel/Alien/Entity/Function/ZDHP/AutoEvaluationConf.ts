import {HasPjStrType} from "@/TsModel/Alien/Entity/Function/ZDHP/HasPjStrType";
import {AutoEvaluationConf_TemplateItem} from "@/TsModel/Alien/Entity/Function/ZDHP/AutoEvaluationConf_TemplateItem";

/** 自动回评设置 不能使用默认配置，太长了*/
export interface AutoEvaluationConf {
		/** 有无内容*/
		PjStrType: HasPjStrType;
		ConfTemplate: AutoEvaluationConf_TemplateItem[];
		/** 使用的huifu模板*/
		UseTemplate?: string | null;
		/** 好评自动回评*/
		reply_hp: boolean;
		/** 好评回复列表-回复时会随机抽取*/
		reply_hp_strList?: string[] | null;
		/** 中评自动回评*/
		reply_zp: boolean;
		/** 中评回复列表-会随机抽取回复*/
		reply_zp_strList?: string[] | null;
		/** 差评自动回复*/
		reply_cp: boolean;
		/** 差评回复列表-会随机抽取回复*/
		reply_cp_strList?: string[] | null;
}
