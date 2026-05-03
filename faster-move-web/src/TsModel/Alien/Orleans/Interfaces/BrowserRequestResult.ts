import * as Comm from '@/TsModel/Comm/Comm';

export interface BrowserRequestResult {
		Success: boolean;
		ErrorMessage?: string | null;
		Cookies?: string | null;
		Content?: string | null;
		StatusCode: number;
		Headers?: Comm.Dictionary<string, string> | null;
}
