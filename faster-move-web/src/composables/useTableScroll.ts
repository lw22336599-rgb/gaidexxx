import { ref, watch, nextTick, type Ref } from 'vue'
import type { TableInstance } from 'element-plus'

/**
 * 表格滚动位置管理组合式函数
 * 用于保存和恢复表格滚动位置，支持标签页切换
 */

interface UseTableScrollOptions {
  /** 表格引用 */
  tableRef: Ref<TableInstance | undefined>
  /** 当前激活的标签页 */
  activeTab: Ref<string>
  /** 是否正在加载 */
  isLoading: Ref<boolean>
  /** 表格数据列表 */
  dataList: Ref<any[] | undefined>
  /** 首页标签值 */
  homeTabValue?: string
}

export function useTableScroll(options: UseTableScrollOptions) {
  const { tableRef, activeTab, isLoading, dataList, homeTabValue = '1' } = options

  // 保存的滚动位置
  const savedScrollPosition = ref(0)
  // 滚动监听器引用
  let scrollListener: ((e: Event) => void) | null = null
  // 滚动容器引用（缓存以提高性能）
  let cachedScrollContainer: HTMLElement | null = null
  // 恢复中标志（防止重复恢复）
  let isRestoring = false
  // 节流定时器
  let scrollThrottleTimer: ReturnType<typeof setTimeout> | null = null
  // 是否已经有保存的滚动位置需要恢复
  let hasPendingRestore = false
  // 是否正在恢复滚动（用于 UI 隐藏）- 响应式变量
  const isRestoringUI = ref(false)

  /**
   * 查找真正的滚动容器
   * 优先使用缓存的容器，如果不存在则重新查找
   */
  const findScrollContainer = (): HTMLElement | null => {
    if (!tableRef.value?.$el) {
      return null
    }

    // 如果已缓存且容器仍然有效，直接返回
    if (cachedScrollContainer && document.contains(cachedScrollContainer)) {
      return cachedScrollContainer
    }

    const tableEl = tableRef.value.$el
    const possibleContainers = [
      tableEl?.querySelector('.el-scrollbar__wrap'),
      tableEl?.querySelector('.el-table__body-wrapper'),
      tableEl?.querySelector('.el-table__body'),
      tableEl
    ].filter(Boolean) as HTMLElement[]

    // 找到可滚动高度最大的容器（这才是真正的滚动容器）
    let maxScrollableContainer: HTMLElement | null = null
    let maxScrollHeight = 0

    possibleContainers.forEach(container => {
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const canScroll = scrollHeight > clientHeight

      if (canScroll && scrollHeight > maxScrollHeight) {
        maxScrollHeight = scrollHeight
        maxScrollableContainer = container
      }
    })

    // 优先使用可滚动的容器
    cachedScrollContainer = maxScrollableContainer || possibleContainers[0] || null
    return cachedScrollContainer
  }

  /**
   * 保存当前滚动位置
   * 使用节流优化性能
   */
  const saveScrollPosition = () => {
    const scrollContainer = findScrollContainer()
    if (!scrollContainer) return

    const currentScrollTop = scrollContainer.scrollTop
    savedScrollPosition.value = currentScrollTop
  }

  /**
   * 节流版本的保存滚动位置
   */
  const throttledSaveScrollPosition = () => {
    if (scrollThrottleTimer) return

    saveScrollPosition()
    scrollThrottleTimer = setTimeout(() => {
      scrollThrottleTimer = null
    }, 100) // 100ms 节流
  }

  /**
   * 设置滚动监听器
   */
  const setupScrollListener = () => {
    // 移除旧的监听器
    removeScrollListener()

    // 只有在首页且表格已挂载时才添加监听器
    if (activeTab.value !== homeTabValue || !tableRef.value) {
      return
    }

    const scrollContainer = findScrollContainer()
    if (!scrollContainer) {
      return
    }

    scrollListener = () => {
      // 在恢复期间或有待恢复的位置时，不保存当前位置
      if (isRestoring || hasPendingRestore) {
        return
      }
      throttledSaveScrollPosition()
    }

    scrollContainer.addEventListener('scroll', scrollListener, { passive: true })
  }

  /**
   * 移除滚动监听器
   */
  const removeScrollListener = () => {
    if (scrollListener && cachedScrollContainer) {
      cachedScrollContainer.removeEventListener('scroll', scrollListener)
      scrollListener = null
    }
  }

  /**
   * 恢复滚动位置
   * @returns 是否恢复成功
   */
  const restoreScrollPosition = (): boolean => {
    const scrollContainer = findScrollContainer()
    if (!scrollContainer) {
      return false
    }

    // 确保表格已经有数据且已经渲染完成，并且有可滚动的高度
    if (
      scrollContainer.scrollHeight <= scrollContainer.clientHeight ||
      !dataList.value ||
      dataList.value.length === 0
    ) {
      return false
    }

    const targetScrollTop = savedScrollPosition.value

    // 使用 requestAnimationFrame 确保在浏览器下一帧渲染前设置滚动位置
    // 这样可以避免用户看到从顶部滚动的过程
    requestAnimationFrame(() => {
      scrollContainer.scrollTop = targetScrollTop
    })

    // 立即验证是否可以恢复（允许5px的误差）
    return scrollContainer.scrollHeight - scrollContainer.clientHeight >= targetScrollTop - 5
  }

  /**
   * 尝试恢复滚动位置（带重试机制）
   * @param maxRetries 最大重试次数
   * @param initialDelay 初始延迟（毫秒）
   */
  const tryRestoreScrollPosition = (maxRetries = 10, initialDelay = 100) => {
    // 防止重复恢复
    if (isRestoring) {
      return
    }

    // 检查保存的滚动位置（注意：0也是有效值，不要排除）
    if (savedScrollPosition.value === undefined || savedScrollPosition.value === null) {
      return
    }

    // 如果还在加载中，等待加载完成
    if (isLoading.value) {
      const unwatch = watch(isLoading, loading => {
        if (!loading) {
          unwatch()
          setTimeout(() => tryRestoreScrollPosition(maxRetries, initialDelay), 100)
        }
      })
      return
    }

    // 确保在首页才恢复
    if (activeTab.value !== homeTabValue) {
      return
    }

    isRestoring = true
    isRestoringUI.value = true // 标记正在恢复，触发 UI 隐藏

    let retryCount = 0
    const attemptRestore = () => {
      // 再次检查条件
      if (activeTab.value !== homeTabValue || isLoading.value) {
        isRestoring = false
        return
      }

      if (restoreScrollPosition()) {
        // 恢复成功，极短延迟后显示 UI（确保渲染完成）
        setTimeout(() => {
          isRestoringUI.value = false // 恢复 UI 显示
        }, 20) // 仅 20ms 延迟，更快显示
        isRestoring = false
        hasPendingRestore = false // 清除待恢复标志
        return
      }

      retryCount++
      if (retryCount < maxRetries) {
        // 使用递增延迟，后续重试间隔更长
        const delay = initialDelay + retryCount * 30
        setTimeout(attemptRestore, delay)
      } else {
        isRestoring = false
        hasPendingRestore = false // 即使失败也清除标志
        isRestoringUI.value = false // 恢复 UI 显示
      }
    }

    // 使用 nextTick 确保 DOM 已完全更新
    nextTick(() => {
      nextTick(() => {
        setTimeout(() => {
          attemptRestore()
        }, initialDelay)
      })
    })
  }

  /**
   * 手动保存滚动位置（用于外部调用）
   * 不检查当前标签页，直接保存
   */
  const manualSaveScrollPosition = () => {
    if (!tableRef.value) return

    const scrollContainer = findScrollContainer()
    if (!scrollContainer) return

    const currentScrollTop = scrollContainer.scrollTop
    savedScrollPosition.value = currentScrollTop
  }

  /**
   * 清理资源
   */
  const cleanup = () => {
    removeScrollListener()
    if (scrollThrottleTimer) {
      clearTimeout(scrollThrottleTimer)
      scrollThrottleTimer = null
    }
    cachedScrollContainer = null
    isRestoring = false
  }

  // 监听表格挂载和标签页切换，设置滚动监听器
  watch(
    [tableRef, activeTab],
    () => {
      if (tableRef.value && activeTab.value === homeTabValue) {
        // 使用 nextTick 确保 DOM 已渲染
        nextTick(() => {
          nextTick(() => {
            setupScrollListener()
            // 如果有待恢复的位置，在设置监听器后立即尝试恢复
            // 这样可以减少闪现
            if (hasPendingRestore && savedScrollPosition.value > 0) {
              // 使用极短的延迟，让表格有时间完成渲染
              setTimeout(() => {
                tryRestoreScrollPosition(10, 30)
              }, 30)
            }
          })
        })
      } else {
        removeScrollListener()
      }
    },
    { immediate: true }
  )

  // 监听标签页切换
  watch(activeTab, (newVal, oldVal) => {
    if (oldVal === homeTabValue && newVal !== homeTabValue) {
      // 离开首页前，立即保存当前滚动位置
      // 注意：此时还能访问到旧的表格DOM
      const scrollContainer = findScrollContainer()
      if (scrollContainer && tableRef.value) {
        const currentScrollTop = scrollContainer.scrollTop
        savedScrollPosition.value = currentScrollTop
        hasPendingRestore = true // 标记有待恢复的位置
      }
    } else if (newVal === homeTabValue && oldVal !== homeTabValue) {
      // 切换回首页，立即尝试恢复滚动位置（减少延迟，避免闪现）
      // 使用最小延迟，让 DOM 有时间渲染，但又不会让用户看到闪现
      tryRestoreScrollPosition(15, 50) // 最多重试15次，初始延迟50ms
    }
  })

  // 监听数据加载完成
  watch(isLoading, (loading, wasLoading) => {
    // 从加载中变为加载完成，且在首页，且有保存的位置（包括0）
    // 只有在标签页切换回来时才恢复滚动位置，而不是在筛选/搜索时
    if (!loading && wasLoading && activeTab.value === homeTabValue) {
      // 只有在有 pending restore 标志时才恢复（表示是从其他标签页切换回来的）
      if (hasPendingRestore && savedScrollPosition.value !== undefined && savedScrollPosition.value !== null) {
        setTimeout(() => {
          tryRestoreScrollPosition()
          hasPendingRestore = false // 恢复后清除标志
        }, 150)
      }
    }
  })

  // 监听表格数据变化（仅在首页且有保存位置时）
  watch(
    dataList,
    (newList, oldList) => {
      // 在首页且有数据变化
      if (activeTab.value === homeTabValue) {
        // 数据从空变为有数据
        if ((!oldList || oldList.length === 0) && newList && newList.length > 0) {
          // 只有在有 pending restore 标志时才恢复（表示是从其他标签页切换回来的）
          if (hasPendingRestore && savedScrollPosition.value !== undefined && savedScrollPosition.value !== null) {
            tryRestoreScrollPosition(5, 100)
            hasPendingRestore = false // 恢复后清除标志
          }
        }
      }
    },
    { deep: false }
  )

  return {
    /** 保存的滚动位置 */
    savedScrollPosition,
    /** 手动保存滚动位置 */
    saveScrollPosition: manualSaveScrollPosition,
    /** 手动恢复滚动位置 */
    restoreScrollPosition: tryRestoreScrollPosition,
    /** 是否正在恢复（用于 UI 控制）*/
    isRestoringUI,
    /** 清理资源 */
    cleanup
  }
}
