import {Food_Item} from "@/TsModel/Alien/Entity/Function/CPFX/Food_Item";

/** 菜品分类, 分类中就包含菜单*/
export interface Food_Group {
		/** 商品分类id 此id指向平台网站. 并不做为数据库的主键使用*/
		id: string;
		/** 分组名称*/
		Name: string;
		/** 子菜品*/
		Items: Food_Item[];
		/** 点击 美团算的是 销售量*/
		dj: number;
		/** 子分组可能没有*/
		Children?: Food_Group[] | null;
}
