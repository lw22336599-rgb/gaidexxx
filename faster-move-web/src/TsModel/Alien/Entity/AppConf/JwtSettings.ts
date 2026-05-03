/** JWT 基础配置。*/
export interface JwtSettings {
		/** 是否验证签名密钥。*/
		ValidateIssuerSigningKey: boolean;
		/** 签名密钥。*/
		IssuerSigningKey?: string | null;
		/** 是否验证签发方。*/
		ValidateIssuer: boolean;
		/** 签发方标识。*/
		ValidIssuer?: string | null;
		/** 是否验证接收方。*/
		ValidateAudience: boolean;
		/** 接收方标识。*/
		ValidAudience?: string | null;
		/** 是否验证过期时间。*/
		ValidateLifetime: boolean;
		/** Token 过期时间（分钟）。*/
		ExpiredTime: number;
		/** 过期容错值（秒）。*/
		ClockSkew: number;
		/** 加密算法名称。*/
		Algorithm?: string | null;
}
