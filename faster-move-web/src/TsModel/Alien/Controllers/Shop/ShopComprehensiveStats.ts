import {ShopAuthErrorCount} from "@/TsModel/Alien/Controllers/Shop/ShopAuthErrorCount";
import {ShopFuncCount} from "@/TsModel/Alien/Controllers/Shop/ShopFuncCount";
import * as Comm from '@/TsModel/Comm/Comm';

/** 店铺综合统计（授权异常 + 功能到期）*/
export interface ShopComprehensiveStats {
		/** 授权异常统计（按平台分组）*/
		AuthErrors: ShopAuthErrorCount[];
		/** 功能到期统计（按功能代码分组）*/
		FuncCounts: Comm.Dictionary<string, ShopFuncCount>;
}
