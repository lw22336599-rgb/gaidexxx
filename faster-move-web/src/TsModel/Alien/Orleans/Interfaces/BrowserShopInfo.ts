export interface BrowserShopInfo {
		ShopId: string;
		ShopName: string;
		IsOpen: boolean;
		LastActiveTime: Date;
		ActivationTime?: Date | null;
		NodeName: string;
		WebView2Version?: string | null;
}
