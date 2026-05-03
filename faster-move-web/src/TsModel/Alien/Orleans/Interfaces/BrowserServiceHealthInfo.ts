export interface BrowserServiceHealthInfo {
		ShopId: string;
		ShopName: string;
		LastActiveTime: Date;
		ActivationTime?: Date | null;
		IsOpen: boolean;
		IsRunning: boolean;
		NodeName: string;
		WebView2Version?: string | null;
}
