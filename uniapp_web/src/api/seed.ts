/**
 * 手机端访问 dev-bridge 的 /seed/* 端点；走 utils/request（基址与 PC Vite 5200 对齐）。
 * Mock=on：命中 dev-bridge（与 PC 同一份种子）；Mock=off：透传给真实后端 /seed/* 路径
 */
import { get } from "@/utils/request";

export interface DevStore {
  shop_id: number;
  shop_name: string;
  platform_type: string;
  platform_title?: string;
  status: number;
  address?: string;
  create_time?: string;
  __mock?: boolean;
  __source?: string;
}

export interface DevUser {
  id: number;
  user_name: string;
  phone?: string;
  shop_id: number;
  shop_name?: string;
  role: string;
  balance?: number;
  integral?: number;
  create_time?: string;
  __mock?: boolean;
  __source?: string;
}

export interface DevTodo {
  id: number;
  user_id: number;
  title: string;
  status: number;
  due?: string;
  __mock?: boolean;
  __source?: string;
}

/** /seed 列表请求单次超时（配合 seed-list 重试） */
const SEED_FETCH_TIMEOUT_MS = 10_000;

export const fetchStores = () => get<DevStore[]>("/seed/stores", undefined, { timeout: SEED_FETCH_TIMEOUT_MS });
export const fetchUsers = () =>
  get<{ list: DevUser[]; total: number }>("/seed/users", undefined, { timeout: SEED_FETCH_TIMEOUT_MS });
export const fetchTodos = () => get<DevTodo[]>("/seed/todos", undefined, { timeout: SEED_FETCH_TIMEOUT_MS });
