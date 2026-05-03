<template>
  <div class="food-group-tree">
    <el-tree ref="treeRef" :data="treeData" :props="defaultProps" show-checkbox node-key="office_id"
      :default-expanded-keys="expandedKeys" :check-strictly="false" :check-on-click-node="false"
      :check-on-click-leaf="false" :disabled="isNodeDisabled" @check="handleCheck" @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextMenu" />

    <!-- 右键菜单 -->
    <div v-show="contextMenu.visible" :style="contextMenu.style" class="context-menu">
      <div class="context-menu-item" @click="handleExpandAll">全部展开</div>
      <div class="context-menu-item" @click="handleCollapseAll">全部折叠</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { FoodManageApi } from '../types/api'

const props = defineProps<{
  groups: FoodManageApi.FoodGroupVoItem[]
  selectedGroups: string[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedGroups', value: string[]): void
  (e: 'group-click', group: FoodManageApi.FoodGroupVoItem): void
  (e: 'load-group-foods', groupId: string): void
}>()

const treeRef = ref()

// 默认展开的节点
const expandedKeys = computed(() => {
  // 获取所有分组的office_id
  const keys: string[] = ['root']
  const processGroup = (group: FoodManageApi.FoodGroupVoItem) => {
    if (group.office_id) {
      keys.push(group.office_id)
    }
    if (group.Group?.Children && Array.isArray(group.Group.Children)) {
      group.Group.Children.forEach((child: any) => {
        if (child.office_id || child.Group?.OfficeId) {
          keys.push(child.office_id || child.Group.OfficeId)
        }
      })
    }
  }
  props.groups.forEach(processGroup)
  return keys
})

const defaultProps = {
  children: 'children',
  label: (data: any) => {
    if (data.id === 'root') return data.name

    // 计算子分组商品数量之和
    const calculateTotalCount = (group: any): number => {
      if (group.Children && group.Children.length > 0) {
        return group.Children.reduce((sum: number, child: any) => sum + (child.spu_count || 0), 0)
      }
      return group.spu_count || 0
    }

    const name = data.Group?.Name || data.name
    const count = calculateTotalCount(data)
    return `${name} (${count})`
  }
}

// 构建树形数据
const treeData = computed(() => {
  const root: FoodManageApi.FoodGroupVoItem = {
    id: 'root',
    name: '全部分组',
    parentId: null,
    children: [],
  }

  // 递归处理分组数据
  const processGroup = (group: FoodManageApi.FoodGroupVoItem): FoodManageApi.FoodGroupVoItem => {
    const node: FoodManageApi.FoodGroupVoItem = {
      ...group,
      children: []
    }

    // 如果有子分组，递归处理
    if (group.Children && Array.isArray(group.Children)) {
      node.children = group.Children.map(child => processGroup(child))
    }

    return node
  }

  // 处理所有顶级分组
  root.children = props.groups.map(group => processGroup(group))

  console.log('树形数据:', root) // 添加日志
  return [root]
})

// 监听选中分组变化
watch(
  () => props.selectedGroups,
  (newVal) => {
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(newVal)
    }
  },
  { immediate: true }
)

// 判断节点是否禁用
const isNodeDisabled = (data: FoodManageApi.FoodGroupVoItem) => {
  // 如果是根节点，禁用
  if (data.id === 'root') return true
  // 如果有子分组，禁用
  if (data.Children && data.Children.length > 0) return true
  return false
}

// 处理选中状态变化
const handleCheck = (data: FoodManageApi.FoodGroupVoItem, checked: { checkedKeys: string[], checkedNodes: FoodManageApi.FoodGroupVoItem[] }) => {
  // 过滤掉根节点
  const validKeys = checked.checkedKeys.filter(key => key !== 'root')
  emit('update:selectedGroups', validKeys)
}

// 根据 office_id 查找节点
const findNodeByOfficeId = (officeId: string): FoodManageApi.FoodGroupVoItem | null => {
  const findInTree = (nodes: FoodManageApi.FoodGroupVoItem[]): FoodManageApi.FoodGroupVoItem | null => {
    for (const node of nodes) {
      if (node.office_id === officeId) return node
      if (node.children) {
        const found = findInTree(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findInTree(treeData.value)
}

// 处理节点点击
const handleNodeClick = (data: FoodManageApi.FoodGroupVoItem) => {
  emit('group-click', data)
  // 触发加载当前分组商品的事件，使用office_id
  emit('load-group-foods', data.office_id || '')
}

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  style: {
    left: '0px',
    top: '0px'
  }
})

// 处理右键菜单
const handleNodeContextMenu = (event: MouseEvent, data: FoodManageApi.FoodGroupVoItem) => {
  // 只有根节点才显示右键菜单
  if (data.id !== 'root') return

  event.preventDefault()
  contextMenu.value.visible = true
  contextMenu.value.style = {
    left: event.clientX + 'px',
    top: event.clientY + 'px'
  }

  // 点击其他地方关闭菜单
  const closeMenu = () => {
    contextMenu.value.visible = false
    document.removeEventListener('click', closeMenu)
  }
  document.addEventListener('click', closeMenu)
}

// 全部展开
const handleExpandAll = () => {
  if (!treeRef.value) return
  // 获取所有节点的 key
  const allKeys = getAllNodeKeys(treeData.value)
  // 使用 nextTick 确保在 DOM 更新后执行
  nextTick(() => {
    const tree = treeRef.value
    if (tree) {
      allKeys.forEach(key => {
        tree.store.nodesMap[key].expanded = true
      })
    }
  })
  contextMenu.value.visible = false
}

// 全部折叠
const handleCollapseAll = () => {
  if (!treeRef.value) return
  // 使用 nextTick 确保在 DOM 更新后执行
  nextTick(() => {
    const tree = treeRef.value
    if (tree) {
      Object.values(tree.store.nodesMap).forEach((node: any) => {
        node.expanded = false
      })
    }
  })
  contextMenu.value.visible = false
}

// 获取所有节点的 key
const getAllNodeKeys = (nodes: FoodManageApi.FoodGroupVoItem[]): string[] => {
  const keys: string[] = []
  const traverse = (node: FoodManageApi.FoodGroupVoItem) => {
    if (node.office_id) {
      keys.push(node.office_id)
    }
    if (node.children) {
      node.children.forEach(traverse)
    }
  }
  nodes.forEach(traverse)
  return keys
}
</script>

<style lang="scss" scoped>
.food-group-tree {
  height: 100%;
  overflow: auto;
  position: relative;
}

// 自定义树节点选中状态样式
:deep(.el-tree) {
  .el-tree-node__content {
    &:hover {
      background-color: #f0f9ff;
    }

    &.is-current {
      background-color: #409eff !important;
      color: #ffffff !important;

      .el-tree-node__label {
        color: #ffffff !important;
      }
    }

    &.is-checked {
      background-color: #e6f7ff !important;
      color: #1890ff !important;

      .el-tree-node__label {
        color: #1890ff !important;
      }
    }
  }

  // 选中且当前节点的样式
  .el-tree-node.is-current>.el-tree-node__content {
    background-color: #409eff !important;
    color: #ffffff !important;

    .el-tree-node__label {
      color: #ffffff !important;
    }
  }

  // 复选框选中的节点样式
  .el-tree-node.is-checked>.el-tree-node__content {
    background-color: #e6f7ff !important;
    color: #1890ff !important;

    .el-tree-node__label {
      color: #1890ff !important;
    }
  }
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 3000;
  padding: 4px 0;

  &-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>