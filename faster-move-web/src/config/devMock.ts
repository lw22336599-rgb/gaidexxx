/**
 * Mock 数据总开关（PC 端，运行时与 dev-bridge 联动）
 * - 本地 .env 的 VITE_USE_MOCK 仅作为「启动期默认值」
 * - 真正的权威配置来自 bridge 的 GET /seed/config（mode = mock | real）
 *   bridge mode 改变（POST /seed/mode）会通过 SSE 实时推送，前端联动切换
 * - 配套：POST /seed/clear 清空种子；POST /seed/reset 还原 15/20/5 默认种子
 *
 * 切换时页面渲染 / 事件绑定 / 同步关联关系保持不变；仅数据来源切换。
 */
import { reactive, computed } from 'vue'

function envMock(): boolean {
  const env = import.meta.env as Record<string, string | undefined>
  const v = String(env.VITE_USE_MOCK || '').toLowerCase()
  return v === 'true' || v === '1'
}

interface DevMockState {
  bridgeKnown: boolean
  bridgeMock: boolean
  lastUpdated: number
}

const state = reactive<DevMockState>({
  bridgeKnown: false,
  bridgeMock: envMock(),
  lastUpdated: 0
})

export function devMockBaseURL(): string {
  const env = import.meta.env as Record<string, string | undefined>
  const explicit = (env.VITE_MOCK_API_BASE || '').trim()
  if (explicit) return explicit.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.hostname}:3000`
  }
  return 'http://localhost:3000'
}

/** 同步只读：当前生效值；.env 关闭 Mock 后不再被 bridge 切回假数据 */
export function isDevMockOn(): boolean {
  if (!envMock()) return false
  return state.bridgeKnown ? state.bridgeMock : true
}

/** 响应式：模板与 watchEffect 可直接绑定 */
export const devMockOn = computed(() => {
  if (!envMock()) return false
  return state.bridgeKnown ? state.bridgeMock : true
})

/** 启动期向 bridge 拉一次 /seed/config；失败则保持本地 env 值 */
export async function refreshDevMockConfig(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return state.bridgeMock
  try {
    const r = await fetch(`${devMockBaseURL()}/seed/config`, { cache: 'no-store' })
    if (!r.ok) throw new Error(String(r.status))
    const j = await r.json()
    if (j && j.code === 200 && j.data) {
      state.bridgeMock = !!j.data.mock
      state.bridgeKnown = true
      state.lastUpdated = Date.now()
      return state.bridgeMock
    }
  } catch {
    state.bridgeKnown = false
  }
  return envMock()
}

/** 由 EventSource 钩子调用：mode/clear/reset 事件触发本地刷新 */
export function applyBridgeEvent(name: string, data: { mode?: string; mock?: boolean }) {
  if (name === 'mode' || name === 'hello') {
    if (typeof data.mock === 'boolean') {
      state.bridgeMock = data.mock
      state.bridgeKnown = true
      state.lastUpdated = Date.now()
    }
  }
}

/** 远程操作：切模式 / 清数据 / 还原种子 */
export async function setBridgeMode(mode: 'mock' | 'real'): Promise<void> {
  await fetch(`${devMockBaseURL()}/seed/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  })
}
export async function clearBridgeSeed(): Promise<void> {
  await fetch(`${devMockBaseURL()}/seed/clear`, { method: 'POST' })
}
export async function resetBridgeSeed(): Promise<void> {
  await fetch(`${devMockBaseURL()}/seed/reset`, { method: 'POST' })
}
