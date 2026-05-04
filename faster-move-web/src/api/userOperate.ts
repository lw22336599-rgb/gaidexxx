/**
 * 用户运营模块 API（开发版）
 * - 直接调用本机 dev-bridge（默认 :3000，自动用当前页面 hostname）
 * - 不经过 utils/request 的全局 baseURL，避免污染既有页面
 */
import axios from 'axios'
import { applyBridgeEvent, devMockBaseURL, isDevMockOn } from '/@/config/devMock'

/** 兼容旧导出名；统一从 devMock.ts 取地址 */
export function bridgeBase(): string {
  return devMockBaseURL()
}

function ensureMockOn(): true | never {
  if (!isDevMockOn()) {
    throw new Error('DEV_MOCK_OFF: 当前已切换到生产数据源，dev-bridge 不可用')
  }
  return true
}

const http = axios.create({
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' }
})

export interface DevStore {
  shop_id: number
  shop_name: string
  platform_type: string
  platform_title?: string
  status: number
  address?: string
  create_time?: string
}

export interface DevUser {
  id: number
  user_name: string
  phone?: string
  shop_id: number
  shop_name?: string
  role: string
  balance?: number
  integral?: number
  create_time?: string
}

export interface DevTodo {
  id: number
  user_id: number
  title: string
  status: number
  due?: string
}

export interface DevEnvelope<T> {
  code: number
  msg: string
  data: T
}

const url = (path: string): string => `${bridgeBase()}${path}`

const emptyEnvelope = <T>(data: T, msg = 'mock-off'): DevEnvelope<T> => ({ code: 200, msg, data })

/* stores */
export const fetchStores = () =>
  isDevMockOn()
    ? http.get<DevEnvelope<DevStore[]>>(url('/seed/stores')).then(r => r.data)
    : Promise.resolve(emptyEnvelope<DevStore[]>([]))
export const addStore = (data: Partial<DevStore>) => (
  ensureMockOn(), http.post<DevEnvelope<DevStore>>(url('/seed/stores/add'), data).then(r => r.data)
)
export const updateStore = (data: Partial<DevStore> & { shop_id: number }) => (
  ensureMockOn(), http.post<DevEnvelope<DevStore>>(url('/seed/stores/update'), data).then(r => r.data)
)
export const deleteStore = (shop_id: number) => (
  ensureMockOn(), http.post<DevEnvelope<{ removed: number }>>(url('/seed/stores/delete'), { shop_id }).then(r => r.data)
)

/* users */
export const fetchUsers = () =>
  isDevMockOn()
    ? http.get<DevEnvelope<{ list: DevUser[]; total: number }>>(url('/seed/users')).then(r => r.data)
    : Promise.resolve(emptyEnvelope<{ list: DevUser[]; total: number }>({ list: [], total: 0 }))
export const addUser = (data: Partial<DevUser>) => (
  ensureMockOn(), http.post<DevEnvelope<DevUser>>(url('/seed/users/add'), data).then(r => r.data)
)
export const updateUser = (data: Partial<DevUser> & { id: number }) => (
  ensureMockOn(), http.post<DevEnvelope<DevUser>>(url('/seed/users/add'), data).then(r => r.data)
)
export const deleteUser = (id: number) => (
  ensureMockOn(), http.post<DevEnvelope<{ removed: number }>>(url('/seed/users/delete'), { id }).then(r => r.data)
)

/* todos */
export const fetchTodos = () =>
  isDevMockOn()
    ? http.get<DevEnvelope<DevTodo[]>>(url('/seed/todos')).then(r => r.data)
    : Promise.resolve(emptyEnvelope<DevTodo[]>([]))
export const addTodo = (data: Partial<DevTodo>) => (
  ensureMockOn(), http.post<DevEnvelope<DevTodo>>(url('/seed/todos/add'), data).then(r => r.data)
)
export const updateTodo = (data: Partial<DevTodo> & { id: number }) => (
  ensureMockOn(), http.post<DevEnvelope<DevTodo>>(url('/seed/todos/update'), data).then(r => r.data)
)
export const deleteTodo = (id: number) => (
  ensureMockOn(), http.post<DevEnvelope<{ removed: number }>>(url('/seed/todos/delete'), { id }).then(r => r.data)
)

/* stats / home aggregate */
export interface DevStats {
  stores: number
  users: number
  todos: number
  todos_undone: number
  todos_done: number
  byPlatform: { type: string; title: string; count: number }[]
}

export const fetchStats = () =>
  isDevMockOn()
    ? http.get<DevEnvelope<DevStats>>(url('/seed/stats')).then(r => r.data)
    : Promise.reject(new Error('DEV_MOCK_OFF'))
export const fetchHomeAggregate = () =>
  isDevMockOn()
    ? http.get<DevEnvelope<Record<string, unknown>>>(url('/homedata/v2/gethomedata')).then(r => r.data)
    : Promise.reject(new Error('DEV_MOCK_OFF'))

/* SSE 实时订阅；返回 unsubscribe */
export interface DevChangeEvent {
  resource: 'stores' | 'users' | 'todos'
  action: 'add' | 'update' | 'delete'
  payload: unknown
  ts: number
  stats: DevStats
}

export type BridgeSystemEventName = 'hello' | 'mode' | 'clear' | 'reset'

export interface SubscribeEventsOptions {
  /** bridge 侧系统事件（mode/clear/reset/hello），在 applyBridgeEvent 之后调用 */
  onSystem?: (name: BridgeSystemEventName) => void
}

export function subscribeEvents(
  onChange: (e: DevChangeEvent) => void,
  onHelloOrOptions?: ((s: { stats: DevStats; ts: number }) => void) | SubscribeEventsOptions
): () => void {
  // 不再因本地 env 关掉订阅；订阅 SSE 也是同步 mode/clear 的通道
  let onHello: ((s: { stats: DevStats; ts: number }) => void) | undefined
  let options: SubscribeEventsOptions | undefined
  if (typeof onHelloOrOptions === 'function') {
    onHello = onHelloOrOptions
  } else {
    options = onHelloOrOptions
  }

  if (typeof window === 'undefined' || !('EventSource' in window)) {
    return () => undefined
  }
  const es = new EventSource(`${bridgeBase()}/seed/events`)
  const passSystem = (name: BridgeSystemEventName) => (ev: Event) => {
    try {
      const data = JSON.parse((ev as MessageEvent).data)
      applyBridgeEvent(name, data)
      options?.onSystem?.(name)
    } catch {
      /* ignore */
    }
  }
  es.addEventListener('change', ev => {
    try {
      onChange(JSON.parse((ev as MessageEvent).data) as DevChangeEvent)
    } catch {
      /* ignore malformed */
    }
  })
  es.addEventListener('hello', ev => {
    passSystem('hello')(ev)
    try {
      onHello?.(JSON.parse((ev as MessageEvent).data))
    } catch {
      /* ignore */
    }
  })
  es.addEventListener('mode', passSystem('mode'))
  es.addEventListener('clear', passSystem('clear'))
  es.addEventListener('reset', passSystem('reset'))
  return () => es.close()
}
