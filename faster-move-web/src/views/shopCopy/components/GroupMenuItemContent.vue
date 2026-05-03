<!-- 内容组件 -->
<template>
  <div class="menu-item-content" @click.stop>
    <el-checkbox v-model="props.item.Group.check" :indeterminate="indeterminate" @change="handleCheckboxChange" />
    <div class="menu-item-info">
      <div :class="['menu-title', { 'error-text': !props.item.id }]">
        {{ props.item.Group.Name }}
        <el-tooltip v-if="showTips(props.item.Group.OfficeId)" :content="showTips(props.item.Group.OfficeId)"
          placement="right" effect="light">
          <el-icon class="warning-icon">
            <Warning />
          </el-icon>
        </el-tooltip>
      </div>
      <div :class="['menu-subtitle', { 'error-text': !props.item.id }]">
        商品（{{ props.item.spu_count }}/{{ props.item.Group.FoodCount }}）
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'

interface GroupMenuItem {
  id: string,
  spu_count: number,
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
  foodGroupDataList: any[]
}>()

const emit = defineEmits<{
  (e: 'checkbox-change', item: GroupMenuItem, checked: boolean): void
}>()

const foodGroupDataList = ref<any>([])

/**
 * 计算半选状态（indeterminate）
 * 优先使用 Group.indeterminate，如果没有则自己计算
 */
const indeterminate = computed(() => {
  // 如果 Group 对象有 indeterminate 属性，优先使用
  if (props.item.Group.hasOwnProperty('indeterminate')) {
    return Boolean(props.item.Group.indeterminate)
  }

  // 如果没有子分类，不需要半选状态
  if (!props.item.Children || props.item.Children.length === 0) {
    return false
  }

  // 检查是否有部分子分类被选中
  const checkedCount = props.item.Children.filter((child: GroupMenuItem) => {
    return Boolean(child.Group?.check) === true
  }).length

  const totalCount = props.item.Children.length

  // 如果部分被选中（不是全部也不是0），则显示半选状态
  return checkedCount > 0 && checkedCount < totalCount
})

/**
 * 递归选中所有子分类
 * @param children 子分类数组
 */
const checkAllChildren = (children?: GroupMenuItem[]) => {
  if (!children || children.length === 0) return

  children.forEach((child: GroupMenuItem) => {
    if (child.Group) {
      child.Group.check = true
    }
    // 递归处理子分类的子分类
    if (child.Children && child.Children.length > 0) {
      checkAllChildren(child.Children)
    }
  })
}

/**
 * 递归取消所有子分类的选中状态
 * @param children 子分类数组
 */
const uncheckAllChildren = (children?: GroupMenuItem[]) => {
  if (!children || children.length === 0) return

  children.forEach((child: GroupMenuItem) => {
    if (child.Group) {
      child.Group.check = false
    }
    // 递归处理子分类的子分类
    if (child.Children && child.Children.length > 0) {
      uncheckAllChildren(child.Children)
    }
  })
}

/**
 * 处理 checkbox 变化
 * @param checked 是否选中
 */
const handleCheckboxChange = (checked: boolean | string | number) => {
  const isChecked = Boolean(checked)

  // 如果是一级分类（有子分类）
  if (props.item.Children && props.item.Children.length > 0) {
    // 清除半选状态
    if (props.item.Group.hasOwnProperty('indeterminate')) {
      props.item.Group.indeterminate = false
    }

    if (isChecked) {
      // 一级分类选中 → 选中所有二级分类
      checkAllChildren(props.item.Children)
    } else {
      // 一级分类取消 → 取消所有二级分类
      uncheckAllChildren(props.item.Children)
    }

    // 等待子分类状态更新完成后再通知父组件
    nextTick(() => {
      emit('checkbox-change', props.item, isChecked)
    })
  } else {
    // 二级分类变化，立即通知父组件
    // 因为 v-model 已经更新了 props.item.Group.check，所以可以直接传递
    emit('checkbox-change', props.item, isChecked)
  }
}

const showTips = (group_offid: string) => {
  let num1 = 0
  let num2 = 0
  let num3 = 0
  let list = props.foodGroupDataList.find((item: any) => item.group_offid === group_offid)?.FoodDataState
  if (!list) return ''
  for (let key in list) {
    const states = list[key].states
    states.forEach((state: any) => {
      switch (state) {
        case 0: {
          num1++
          break
        }
        case 1: {
          num2++
          break
        }
        case 2: {
          num3++
          break
        }
      }
    })
  }
  return (
    (num2 ? `有${num2}个商品需点击选择规格补全多规格信息` : '') +
    (num3 ? `有${num3}个套餐商品需点击选择套餐补全套餐信息` : '')
  )
}
</script>
<style scoped lang="scss">
.menu-title {
  display: flex;
  align-items: center;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.menu-subtitle {
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  line-height: 1.2;
  margin-top: 4px;
}

.menu-item-content,
.menu-item-info {
  width: 100%;
}

.menu-item-content {
  display: flex;
}

.menu-item-info {
  margin-left: 6px;
}

.warning-icon {
  color: #ff4d4f;
  margin-left: 4px;
  font-size: 14px;
  vertical-align: middle;
}
</style>