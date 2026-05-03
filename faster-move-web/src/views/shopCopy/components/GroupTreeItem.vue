<template>
  <div class="group-tree-item">
    <div class="group-item">
      <el-checkbox :label="group.id">
        <div class="group-info">
          <span class="group-name">{{ group.Name }}</span>
          <span class="group-count">商品数：{{ group.FoodCount }}</span>
        </div>
      </el-checkbox>
    </div>
    <!-- 递归显示子分组 -->
    <div v-if="group.Children && group.Children.length > 0" class="group-children">
      <GroupTreeItem v-for="child in group.Children" :key="child.id" :group="child" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FoodGroupItem } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'

defineProps<{
  group: FoodGroupItem
}>()
</script>

<style scoped lang="scss">
.group-tree-item {
  .group-item {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .group-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .group-name {
    font-size: 14px;
    color: #333;
  }

  .group-count {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
  }

  .group-children {
    margin-left: 24px;
    padding-left: 12px;
    border-left: 2px solid #e0e0e0;
  }
}
</style>