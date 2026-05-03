import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {RuleForEvent} from "@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForEvent";
import {EvntRuleSetValueType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/EvntRuleSetValueType";
import {RuleForType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForType";

/** 添加规则参数*/
export interface AddFdmvRuleParmsVo {
		/** 规则名称*/
		name?: string | null;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 针对事件型*/
		for_evnt?: RuleForEvent | null;
		/** 针对事件关键词*/
		evnt_words?: string | null;
		/** 关键词用正则匹配*/
		evnt_reg?: boolean | null;
		/** 当正则匹配成功时,将匹配成功的第一个项设置到 r_word_old*/
		evnt_set_rword?: boolean | null;
		/** 如果 evnt_set_rword 为true 代表要设置的字段类型*/
		evnt_set_type?: EvntRuleSetValueType | null;
		/** 如果自动将规则保存到数据库*/
		evnt_set_save?: boolean | null;
		/** 针对 for_evnt 事件发生后,针对这条规则处理后再次进行尝试最多少次*/
		evnt_try?: number | null;
		/** 针对商品中的哪个部分*/
		ForType: RuleForType;
		/** 针对文本 替换字符串 老字符串*/
		r_word_old?: string | null;
		/** 针对文本 替换字符串 新字符串*/
		r_word_new?: string | null;
		/** 字符串替换正则模式*/
		r_word_reg?: boolean | null;
		/** 针对字符串最大长度(超过将被截取)*/
		str_max_length?: number | null;
		/** 针对字符串的最小长度(小于这个长度将追加相同内容以适应长度)*/
		str_min_length?: number | null;
		/** 针对数字 (最大值)*/
		max_val?: number | null;
		/** 针对数字 (最小值)*/
		min_val?: number | null;
		/** 分组ID*/
		group?: string | null;
		/** 分组名称*/
		group_name?: string | null;
		/** 备注*/
		notes?: string | null;
}
