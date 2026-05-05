/** 与 faster-move-web `src/api/business.ts` getHomeData 同路径，仅经 `utils/request` 发往 PC Vite。 */
import { get } from "@/utils/request";

export function getHomeData() {
  return get("/homedata/v2/gethomedata", undefined, { timeout: 60000 });
}
