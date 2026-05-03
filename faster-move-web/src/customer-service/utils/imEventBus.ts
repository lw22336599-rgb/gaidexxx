import type { ImMessage } from '@/TsModel/Alien/Entity/Messages/ImMessage'
import type { SessionEvent } from '/@/customer-service/utils/signalRManager'

type MessageListener = (message: ImMessage) => void
type SessionEventListener = (event: SessionEvent) => void

const messageListeners = new Set<MessageListener>()
const sessionEventListeners = new Set<SessionEventListener>()

export const imEventBus = {
  onMessage(listener: MessageListener): () => void {
    messageListeners.add(listener)
    return () => {
      messageListeners.delete(listener)
    }
  },

  emitMessage(message: ImMessage): void {
    messageListeners.forEach((listener) => {
      try {
        listener(message)
      } catch (error) {
        // 忽略监听器内部错误，避免阻塞其他监听器
      }
    })
  },

  onSessionEvent(listener: SessionEventListener): () => void {
    sessionEventListeners.add(listener)
    return () => {
      sessionEventListeners.delete(listener)
    }
  },

  emitSessionEvent(event: SessionEvent): void {
    sessionEventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        // 忽略监听器内部错误
      }
    })
  },
}
