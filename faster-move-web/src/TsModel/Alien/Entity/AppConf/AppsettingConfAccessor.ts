import {AppsettingConf} from "@/TsModel/Alien/Entity/AppConf/AppsettingConf";

/** 提供便捷访问 AppsettingConf 的静态入口。*/
export interface AppsettingConfAccessor {
		/** 获取全局统一配置实例。*/
		Current: AppsettingConf;
}
