/** 文件日志配置。*/
export interface LoggingFileSettings {
		/** 输出文件名或完整路径。*/
		FileName?: string | null;
		/** 是否采用追加写入。*/
		Append: boolean;
		/** 最小记录级别。*/
		MinimumLevel?: string | null;
		/** 单个日志文件的大小上限（字节）。*/
		FileSizeLimitBytes?: number | null;
		/** 最大保留的滚动日志数量。*/
		MaxRollingFiles?: number | null;
}
