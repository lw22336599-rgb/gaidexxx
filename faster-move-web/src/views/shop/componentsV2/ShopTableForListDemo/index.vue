<template>
  <div class="shop-table">
    <!-- 首页表格 -->
    <el-table
      v-if="isHomeTab"
      ref="tableRef"
      v-loading="props.listLoading"
      :data="props.shopList"
      :height="tableHeight"
      border
      stripe
    >
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.label"
        :align="column.align"
        :fixed="column.fixed"
        :label="column.label"
        :min-width="column.minWidth"
        show-overflow-tooltip
      >
        <!-- 自定义表头 -->
        <template v-if="column.label === '操作'" #header>
          <ColumnHeader :check-list="checkList" :columns="columns" />
        </template>

        <!-- 自定义列内容 -->
        <template #default="{ row }">
          <component :is="getColumnComponent(column.label)" :row="row" @action="handleColumnAction" />
        </template>
      </el-table-column>

      <template #empty>
        <el-empty class="vab-data-empty" description="暂无数据" />
      </template>
    </el-table>

    <!-- 分页 -->
    <vab-pagination
      :current-page="props.page"
      :page-size="props.pageSize"
      :total="props.total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 弹窗组件 -->
    <PayDialog v-model="showPayDialog" :shop-data="selectedShop" />
    <EditDialog v-model="showEditDialog" :shop-data="selectedShop" />
    <SetOnlyBind v-model="showBindDialog" :shop-data="bindShopData" />
  </div>
</template>

<script setup lang="tsx">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { TableInstance } from 'element-plus'
import { gp } from '/@vab/plugins/vab'
import { ShopTypeMap, type ShopData, type ColumnConfig } from './types.ts'
import { useWebview, useColumns, useShopActions } from './composables/index'
// import ColumnHeader from './ColumnHeader.vue'
import AccountColumn from './columns/AccountColumn.vue'
import OperationColumn from './columns/OperationColumn.vue'
// 其他列组件...

// Props
const props = defineProps({
  shopType: Number,
  listLoading: Boolean,
  shopList: Array<ShopData>,
  total: Number,
  page: Number,
  pageSize: Number
})

// Emits
const emit = defineEmits(['update:page', 'update:pageSize', 'refresh'])

// 组合式API封装
const { activeTab, tabList, activeWebviews, showWebviewArea, setWebviewRef, getWebviewUrl, removeTab } = useWebview()

const { columns, checkList, visibleColumns, getColumnComponent } = useColumns()

const {
  selectedShop,
  showPayDialog,
  showEditDialog,
  showBindDialog,
  bindShopData,
  handleColumnAction,
  handleBindCode,
  copyShopInfo,
  toggleShopTop
} = useShopActions(emit)

// 计算属性
const isHomeTab = computed(() => activeTab.value === 'home')
const tableHeight = computed(() => `calc(100vh - 360px)`)

// 分页处理
const handlePageChange = (page: number) => emit('update:page', page)
const handleSizeChange = (size: number) => emit('update:pageSize', size)

// 标签页标签渲染
const renderTabLabel = (item: any) => {}
// 初始化
onMounted(() => {
  checkList.value = columns.value.filter(col => col.checked).map(col => col.label)
})
</script>

<style lang="scss">
.shop-table {
  :deep(.el-table__cell) {
    overflow: visible;
  }

  .webview-container {
    width: 100%;
    height: calc(100vh - 360px);

    .custom-webview {
      width: 100%;
      height: 100%;
      border: none;
    }
  }

  .top-up-img {
    position: absolute;
    top: -10px;
    left: -12px;
    width: 40px;
    height: 40px;
    z-index: 1;
  }
}

// 其他样式...
</style>
