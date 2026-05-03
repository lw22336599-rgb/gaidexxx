import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

export interface UpdateShopConfigRequest {
		Mode: string;
		Shop?: string | null;
		ShopType?: ShopType | null;
		Token: string;
}
