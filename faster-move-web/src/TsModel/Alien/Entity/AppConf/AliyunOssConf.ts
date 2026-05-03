/** 对像储存设置对像*/
export interface AliyunOssConf {
		/** 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户*/
		AccessKeyId: string;
		/** 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户*/
		AccessKeySecret: string;
		/** 访问域名 填写Bucket所在地域对应的Endpoint。以华东1（杭州）为例，Endpoint填写为https://oss-cn-hangzhou.aliyuncs.com。
Endpoint 表示OSS对外服务的访问域名。OSS以HTTP RESTful API的形式对外提供服务，当访问不同地域的时候，需要不同的域名。通过内网和外网访问同一个地域所需要的域名也是不同的。具体的内容请参见
https://help.aliyun.com/document_detail/31837.htm?spm=a2c4g.11186623.0.0.347d5d7aIekK8a#concept-zt4-cvy-5db*/
		Endpoint: string;
		/** 空间名称*/
		BucketName: string;
		/** Bucket  域名 如 file-temp.Alien.cloud*/
		BucketDomain: string;
}
