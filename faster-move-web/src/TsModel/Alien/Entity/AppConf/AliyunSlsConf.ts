/** 阿里云日志服务*/
export interface AliyunSlsConf {
		/** 可用区查询: https://api.aliyun.com/product/Sls*/
		RegionId: string;
		/** 访问密钥ID，用于阿里云日志服务的身份验证。*/
		AccessKeyId: string;
		/** 用于访问阿里云服务的密钥，与AccessKeyId配对使用以进行身份验证。*/
		AccessKeySecret: string;
		/** 日志项目*/
		Project: string;
}
