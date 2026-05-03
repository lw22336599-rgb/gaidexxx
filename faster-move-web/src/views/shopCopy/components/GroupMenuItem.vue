<template>
  <el-sub-menu v-if="hasChildren" :class="['nested-menu', { 'is-active': currentId === item.id }]" :index="item.id">
    <template #title>
      <menu-item-content-tem :item="item" :food-group-data-list="foodGroupDataList"
        @click="handleItemClick"
        @checkbox-change="handleChildCheckboxChange" />
    </template>
    <group-menu-item v-for="child in item.Children" :key="child.id" :current-id="currentId" :item="child"
      :food-group-data-list="foodGroupDataList"
      @item-click="(payload) => emit('item-click', payload)"
      @checkbox-change="handleChildCheckboxChange" />
  </el-sub-menu>

  <el-menu-item v-else :class="{ 'is-active-last': currentId === item.id }" :index="item.id">
    <menu-item-content-tem :item="item" :food-group-data-list="foodGroupDataList"
      @click="handleItemClick"
      @checkbox-change="handleChildCheckboxChange" />
  </el-menu-item>
</template>

<script lang="ts" setup>
import { computed, watch, nextTick } from 'vue'
import MenuItemContentTem from './GroupMenuItemContent.vue'

interface GroupMenuItem {
  id: string
  spu_count: number
  Children?: GroupMenuItem[]
  Group: {
    id: string
    Name: string
    FoodCount: number
    check?: boolean,
    indeterminate?: boolean,
    OfficeId: string
  }
}

const props = defineProps<{
  item: GroupMenuItem
  currentId?: string
  foodGroupDataList: any[]
}>()

const emit = defineEmits<{
  (e: 'item-click', item: GroupMenuItem): void
  (e: 'checkbox-change', item: GroupMenuItem, checked: boolean): void
}>()

const hasChildren = computed(
  () => props.item.Children && props.item.Children.length > 0
)

/**
 * 检查所有子分类是否都被选中
 */
const areAllChildrenChecked = (): boolean => {
  if (!props.item.Children || props.item.Children.length === 0) return false

  // 检查每个子分类是否都被选中
  // 使用 === true 精确比较，确保能正确处理 undefined、null、false 等情况
  const allChecked = props.item.Children.every((child: GroupMenuItem) => {
    return child.Group?.check === true
  })

  return allChecked
}

/**
 * 检查是否有部分子分类被选中
 */
const hasSomeChildrenChecked = (): boolean => {
  if (!props.item.Children || props.item.Children.length === 0) return false

  // 检查是否有至少一个子分类被选中
  // 使用 === true 精确比较
  const someChecked = props.item.Children.some((child: GroupMenuItem) => {
    return child.Group?.check === true
  })

  return someChecked
}

/**
 * 更新父分类状态（根据子分类状态）
 * 支持三种状态：全选、半选、未选
 */
const updateParentCheckState = () => {
  if (hasChildren.value && props.item.Group && props.item.Children) {
    // 检查所有子分类是否都被选中
    const allChecked = areAllChildrenChecked()
    // 检查是否有部分子分类被选中
    const someChecked = hasSomeChildrenChecked()

    // 确定父分类的状态：
    // - 如果所有子分类都被选中：check = true, indeterminate = false
    // - 如果部分子分类被选中：check = false, indeterminate = true
    // - 如果没有子分类被选中：check = false, indeterminate = false

    const shouldBeChecked = allChecked
    const shouldBeIndeterminate = someChecked && !allChecked

    // 确保 indeterminate 属性存在
    if (!props.item.Group.hasOwnProperty('indeterminate')) {
      Object.defineProperty(props.item.Group, 'indeterminate', {
        value: false,
        writable: true,
        enumerable: true,
        configurable: true
      })
    }

    // 强制更新状态，确保状态正确
    // 移除条件判断，因为我们需要确保状态始终正确
    props.item.Group.check = shouldBeChecked
    props.item.Group.indeterminate = shouldBeIndeterminate
  }
}

/**
 * 处理子分类 checkbox 变化
 * 当二级分类状态变化时，更新一级分类的状态
 */
const handleChildCheckboxChange = (childItem: GroupMenuItem, checked: boolean) => {
  // 如果当前项有子分类（是一级分类），需要检查并更新状态
  if (hasChildren.value && props.item.Children && props.item.Group) {
    // 找到对应的子分类并更新状态（使用传递的 checked 参数）
    const childIndex = props.item.Children.findIndex(child => child.id === childItem.id)
    if (childIndex !== -1 && props.item.Children[childIndex].Group) {
      // 直接使用传递的 checked 值更新状态
      props.item.Children[childIndex].Group.check = checked
    }

    // 立即读取所有子分类的最新状态（包括刚刚更新的）
    const allChecked = props.item.Children.every((child: GroupMenuItem) => {
      return child.Group?.check === true
    })
    const someChecked = props.item.Children.some((child: GroupMenuItem) => {
      return child.Group?.check === true
    })

    // 确保 indeterminate 属性存在
    if (!props.item.Group.hasOwnProperty('indeterminate')) {
      Object.defineProperty(props.item.Group, 'indeterminate', {
        value: false,
        writable: true,
        enumerable: true,
        configurable: true
      })
    }

    // 确定应该的状态
    const shouldBeChecked = allChecked
    const shouldBeIndeterminate = someChecked && !allChecked

    // 强制更新状态，确保状态正确
    props.item.Group.check = shouldBeChecked
    props.item.Group.indeterminate = shouldBeIndeterminate
  }

  // 使用 nextTick 再次确保状态正确（双重保障）
  nextTick(() => {
    // 如果当前项有子分类，再次更新状态
    if (hasChildren.value) {
      updateParentCheckState()
    }

    // 继续向上传递事件，让父组件也能更新状态
    emit('checkbox-change', props.item, checked)
  })
}


/**
 * 监听子分类的选中状态变化
 * 创建一个计算属性来追踪子分类的选中状态
 */
const childrenCheckStates = computed(() => {
  if (!props.item.Children || props.item.Children.length === 0) return ''
  // 返回所有子分类选中状态的字符串，用于 watch 检测变化
  // 使用精确的 true/false 字符串，确保能正确检测变化
  return props.item.Children.map(child => `${child.id}:${child.Group?.check === true ? 'true' : 'false'}`).join(',')
})

watch(
  childrenCheckStates,
  (newVal, oldVal) => {
    // 只有当值真正变化时才更新
    if (newVal !== oldVal && oldVal !== undefined) {
      // 当子分类状态变化时，立即更新父分类状态
      // 使用 setTimeout 确保状态已经完全更新
      setTimeout(() => {
        updateParentCheckState()
      }, 0)
    }
  },
  { immediate: false, deep: true }
)

const handleItemClick = () => {
  console.log(111)
  emit('item-click', props.item)
}
</script>
<style scoped lang="scss">
.is-active.is-active-last {
  background-color: var(--el-color-primary-light-9) !important;
}
</style>