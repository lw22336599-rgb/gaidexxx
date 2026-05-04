/**
 * Mock 数据总开关（手机端，运行时与 dev-bridge 联动）
 * - 本地 .env 的 VITE_USE_MOCK 仅作为「启动期默认值」
 * - 真正的权威配置来自 bridge 的 GET /seed/config（mode = mock | real）
 *   bridge mode 改变（POST /seed/mode）会通过 SSE 实时推送，前端联动切换
 *
 * 切换时页面渲染 / 事件绑定 / 同步关联关系保持不变；仅数据来源切换。
 */
import { reactive, computed } from "vue";
import { resolveBridgeOrigin } from "@/utils/h5DevOrigins";

function envMock(): boolean {
  const env = import.meta.env as Record<string, string | undefined>;
  const v = String(env.VITE_USE_MOCK || "").toLowerCase();
  return v === "true" || v === "1";
}

interface DevMockState {
  bridgeKnown: boolean;
  bridgeMock: boolean;
  lastUpdated: number;
}

const state = reactive<DevMockState>({
  bridgeKnown: false,
  bridgeMock: envMock(),
  lastUpdated: 0,
});

export function devMockBaseURL(): string {
  return resolveBridgeOrigin();
}

export function isDevMockOn(): boolean {
  // .env 明确关闭 Mock 时，只走真实 baseURL，不允许 bridge /seed/config 把数据源切回假数据
  if (!envMock()) return false;
  return state.bridgeKnown ? state.bridgeMock : true;
}

export const devMockOn = computed(() => {
  if (!envMock()) return false;
  return state.bridgeKnown ? state.bridgeMock : true;
});

export async function refreshDevMockConfig(): Promise<boolean> {
  if (!envMock()) {
    state.bridgeKnown = false;
    state.bridgeMock = false;
    return false;
  }
  if (typeof fetch === "undefined") return state.bridgeMock;
  try {
    const r = await fetch(`${devMockBaseURL()}/seed/config`, { cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    if (j && j.code === 200 && j.data) {
      state.bridgeMock = !!j.data.mock;
      state.bridgeKnown = true;
      state.lastUpdated = Date.now();
      return state.bridgeMock;
    }
  } catch {
    state.bridgeKnown = false;
  }
  return envMock();
}

export function applyBridgeEvent(name: string, data: { mode?: string; mock?: boolean }) {
  if (!envMock()) return;
  if (name === "mode" || name === "hello") {
    if (typeof data.mock === "boolean") {
      state.bridgeMock = data.mock;
      state.bridgeKnown = true;
      state.lastUpdated = Date.now();
    }
  }
}
