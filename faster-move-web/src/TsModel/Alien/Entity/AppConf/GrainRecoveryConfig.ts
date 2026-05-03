/** Grain 恢复配置。*/
export interface GrainRecoveryConfig {
		/** 启动延时（秒）。*/
		StartupDelaySec: number;
		/** 单批处理数量。*/
		BatchSize: number;
		/** 批次间延时（毫秒）。*/
		DelayBetweenBatchesMs: number;
}
