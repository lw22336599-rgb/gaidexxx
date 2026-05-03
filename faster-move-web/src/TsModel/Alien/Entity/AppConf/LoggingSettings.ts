import * as Comm from '@/TsModel/Comm/Comm';
import {LoggingFileSettings} from "@/TsModel/Alien/Entity/AppConf/LoggingFileSettings";

/** 日志配置。*/
export interface LoggingSettings {
		/** 各类别日志级别设置。*/
		LogLevel: Comm.Dictionary<string, string>;
		/** 文本日志输出相关设置。*/
		File?: LoggingFileSettings | null;
		/** Furion Monitor 拦截日志设置。*/
		Monitor?: Furion.Logging.LoggingMonitorSettings | null;
}
