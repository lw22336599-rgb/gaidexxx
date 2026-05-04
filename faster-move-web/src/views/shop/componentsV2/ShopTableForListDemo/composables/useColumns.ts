// composables/useColumns.ts
import { ref, computed } from 'vue'
import type { ColumnConfig } from '../types'

const initialColumns: ColumnConfig[] = [
  {
    label: '账号',
    sortable: false,
    checked: true,
    minWidth: 200,
    align: 'left',
    fixed: 'left',
    disableCheck: true
  }
  // 其他列配置...
]

export const useColumns = () => {
  const columns = ref<ColumnConfig[]>(initialColumns)
  const checkList = ref<string[]>([])

  const visibleColumns = computed(() => columns.value.filter(col => checkList.value.includes(col.label)))

  const getColumnComponent = (label: string) => {
    const componentMap: Record<string, string> = {
      账号: 'AccountColumn',
      操作: 'OperationColumn'
      // 其他列组件映射...
    }
    return componentMap[label] || 'div'
  }

  return {
    columns,
    checkList,
    visibleColumns,
    getColumnComponent
  }
}
