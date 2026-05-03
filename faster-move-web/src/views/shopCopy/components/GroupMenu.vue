<template>
  <el-menu class="group-menu" :default-active="currentGroupId" @select="handleMenuSelect">
    <group-menu-item-tem v-for="item in props.foodGroups" :key="item.id" :current-id="props.currentGroupId" :item="item"
      :food-group-data-list="foodGroupDataList"
      @item-click="(payload) => emit('item-click', payload)"
      @checkbox-change="(item, checked) => emit('checkbox-change', item, checked)" />
  </el-menu>
</template>

<script lang="ts" setup>
import GroupMenuItemTem from './GroupMenuItem.vue'

interface Group {
  id: string
  Name: string
  FoodCount: number
  check?: boolean
  // 其他字段根据需要补充
}

export interface GroupMenuItem {
  id: string
  spu_count: number
  Children?: GroupMenuItem[]
  Group: Group
  // 其他字段根据需要补充
}

const props = defineProps<{
  foodGroups: GroupMenuItem[]
  currentGroupId?: string
  foodGroupDataList: any[]
}>()

console.log(props.foodGroups, 'foodGroups')

const emit = defineEmits<{
  (e: 'item-click', item: GroupMenuItem): void
  (e: 'checkbox-change', item: GroupMenuItem, checked: boolean): void
}>()

const handleMenuSelect = (index: string) => {
  // 处理菜单选择逻辑
}
</script>

<style scoped>
/* 保持原有样式 */
.group-menu {
  border-right: none;
}

.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.menu-item-info {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
}

.menu-title {
  color: #999;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.menu-subtitle {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.error-text {
  color: #ff4d4f !important;
}

.el-menu-item.is-active,
:deep(.el-sub-menu.is-active) .el-sub-menu__title {
  background-color: var(--el-color-primary-light-7) !important;
}
</style>