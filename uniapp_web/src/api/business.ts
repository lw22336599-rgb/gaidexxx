/**
 * 与 faster-move-web `src/api/business.ts` 同路径、同契约（待办日历 CRUD + 列表）
 */
import { get, post } from "@/utils/request";

export function getListOrderByCtime(params: Record<string, unknown>) {
  return get("/system/business/calendar/getlistorderbyctime", params);
}

export function addCalendar(data: Record<string, unknown>) {
  return post("/system/business/calendar/add", data);
}

export function editCalendar(data: Record<string, unknown>) {
  return post("/system/business/calendar/update", data);
}

export function delCalendar(id: number | string) {
  return post(`/system/business/calendar/delete?id=${encodeURIComponent(String(id))}`, {});
}
