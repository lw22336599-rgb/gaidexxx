/**
 * Mock 数据总开关（PC）
 *
 * 开关来源（优先级从高到低）：
 *   1) localStorage.MOCK_OVERRIDE = 'on' | 'off'   （仅调试用，可在浏览器手动覆盖一次）
 *   2) import.meta.env.VITE_USE_MOCK              （.env.development / .env.production）
 *
 * - mock=true  -> 走本地 dev-bridge（/seed/* + SSE），数据带 `(dev-seed)` 标记
 * - mock=false -> 走真实后端（VITE_API_BASE 或 VITE_APP_BASE_URL），不订阅 SSE
 *
 * 切换不需要改任何页面逻辑：所有 mock 特有路径（CRUD /seed/*、SSE /seed/events、用户运营菜单）
 * 都通过 isMockEnabled() 判定，关闭后自动降级。
 */

export const MOCK_TAG = 'dev-seed'

export function isMockEnabled(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    const ov = window.localStorage.getItem('MOCK_OVERRIDE')
    if (ov === 'on') return true
    if (ov === 'off') return false
  }
  return String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true'
}

export function mockApiBase(): string {
  const cfg = String(import.meta.env.VITE_MOCK_API_BASE || '').trim()
  if (cfg) return cfg.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.hostname}:3000`
  }
  return 'http://localhost:3000'
}

export function realApiBase(): string {
  const real = String(import.meta.env.VITE_API_BASE || import.meta.env.VITE_APP_BASE_URL || '')
  return real.replace(/\/$/, '')
}

export function apiBase(): string {
  return isMockEnabled() ? mockApiBase() : realApiBase()
}

/** 仅用于显示「当前数据源」徽标 */
export function currentSourceLabel(): { text: string; tone: 'mock' | 'real' } {
  return isMockEnabled() ? { text: `Mock 模式 · ${MOCK_TAG}`, tone: 'mock' } : { text: '真实后端', tone: 'real' }
}
