/** 菜品*/
export interface Food_Item {
		/** 此商品的id 此id指向平台网站. 并不做为数据库的主键使用*/
		id: string;
		/** 商品名*/
		Name: string;
		/** 商品图片*/
		Img: string;
		/** 曝光*/
		bg: number;
		/** 点击*/
		dj: number;
		/** 加购率*/
		jgl: number;
}
