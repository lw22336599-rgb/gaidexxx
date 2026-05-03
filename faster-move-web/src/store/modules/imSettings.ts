import { defineStore } from 'pinia'
import { getLocalStorage } from '/@/utils/localStorage'

interface ImSettingsState {
  alertSoundEnabled: boolean
}

const STORAGE_KEY = 'im-settings'

const readSettings = (): Partial<ImSettingsState> => {
  const stored = getLocalStorage(STORAGE_KEY)
  if (stored && typeof stored === 'object') {
    const rawValue = (stored as Record<string, unknown>).alertSoundEnabled
    if (typeof rawValue === 'boolean') {
      return { alertSoundEnabled: rawValue }
    }
  }
  return {}
}

export const useImSettingsStore = defineStore('imSettings', {
  state: (): ImSettingsState => ({
    alertSoundEnabled: readSettings().alertSoundEnabled ?? true,
  }),
  getters: {
    isAlertSoundEnabled: (state): boolean => state.alertSoundEnabled,
  },
  actions: {
    setAlertSoundEnabled(enabled: boolean): void {
      this.alertSoundEnabled = enabled
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ alertSoundEnabled: enabled }))
    },
  },
})
