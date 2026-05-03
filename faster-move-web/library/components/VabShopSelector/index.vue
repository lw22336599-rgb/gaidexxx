<template>
  <vab-dialog
    v-model="dialogVisible"
    :title="computedTitle"
    width="1000px"
    :loading="loading"
    destroy-on-close
  >
    <div class="shop-selector-container">
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索店铺名称或官方ID"
          clearable
          style="width: 240px"
          @change="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-select
          v-model="authStatus"
          placeholder="授权状态"
          clearable
          style="width: 150px; margin-left: 12px"
          @change="handleSearch"
        >
          <el-option label="授权正常" :value="true" />
          <el-option label="授权异常" :value="false" />
        </el-select>
        <el-select
          v-model="selectedCities"
          placeholder="选择城市"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          style="width: 200px; margin-left: 12px"
          @change="handleSearch"
        >
          <el-option v-for="city in cityOptions" :key="city" :label="city" :value="city" />
        </el-select>
      </div>

      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="shopList"
          height="450px"
          @selection-change="handleSelectionChange"
        >
          <el-table-column v-if="props.multiple" type="selection" width="55" />
          <el-table-column label="店铺名称" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <vab-shop-info :shop-type="row.shop_type" :shop-name="row.name" :icon-size="14" />
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="office_id" width="180" show-overflow-tooltip />
          <el-table-column label="城市" width="120">
            <template #default="{ row }">
              {{ row.city || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="授权状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getAuthStatusType(row)">
                {{ getAuthStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.EndTime) }}
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无店铺数据" />
          </template>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :disabled="selectedShops.length === 0" @click="handleConfirm">
        确定{{ selectedShops.length > 0 ? `(${selectedShops.length})` : '' }}
      </el-button>
    </template>
  </vab-dialog>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { ElTable } from 'element-plus'
import type { ShopList_ResulItem } from '/@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem'
import type { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { ShopState } from '/@/TsModel/Alien/Entity/Enums/ShopState'
import type { Get_ShopList_parm } from '/@/TsModel/Alien/Controllers/Shop/Get_ShopList_parm'
import { OrderDirection } from '/@/TsModel/Alien/Controllers/Shop/OrderDirection'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import dayjs from 'dayjs'

defineOptions({
  name: 'VabShopSelector',
})

interface Props {
  modelValue: boolean
  shopType: ShopType
  title?: string
  multiple?: boolean
  defaultSelectedIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择店铺',
  multiple: true,
  defaultSelectedIds: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [shopIds: string[], shops: ShopList_ResulItem[]]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const computedTitle = computed(() => {
  if (selectedShops.value.length > 0) {
    return `${props.title} (已选 ${selectedShops.value.length} 个店铺)`
  }
  return props.title
})

const loading = ref(false)
const searchKeyword = ref('')
const authStatus = ref<boolean | undefined>(undefined)
const selectedCities = ref<string[]>([])
const cityOptions = ref<string[]>([])

const shopList = ref<ShopList_ResulItem[]>([])
const selectedShops = ref<ShopList_ResulItem[]>([])
const tableRef = ref<InstanceType<typeof ElTable>>()

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const getAuthStatusType = (row: ShopList_ResulItem) => {
  if (row.state === ShopState.店铺已掉线) return 'danger'
  if (row.state === ShopState.店铺已登陆) return 'success'
  return 'info'
}

const getAuthStatusText = (row: ShopList_ResulItem) => {
  if (row.state === ShopState.店铺已掉线) return '授权异常'
  if (row.state === ShopState.店铺已登陆) return '正常'
  return '未知'
}

const formatDate = (date: Date | string | null) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchShopList = async () => {
  loading.value = true
  try {
    const params: Get_ShopList_parm = {
      page: currentPage.value,
      pageSize: pageSize.value,
      order_direction: OrderDirection.Desc,
      filter: {
        shopType: props.shopType,
        word: searchKeyword.value || undefined,
        ck_online: authStatus.value,
        citys: selectedCities.value.length > 0 ? selectedCities.value : undefined,
      },
    }

    const result = await apiManager.shopmgApi.GetShopListAll(params)
    shopList.value = result?.rows || []
    total.value = result?.total || 0

    const cities = new Set<string>()
    shopList.value.forEach((shop: ShopList_ResulItem) => {
      if (shop.city) {
        cities.add(shop.city)
      }
    })
    cityOptions.value = Array.from(cities).sort()

    await nextTick()
    if (props.defaultSelectedIds.length > 0 && tableRef.value) {
      shopList.value.forEach((shop) => {
        if (props.defaultSelectedIds.includes(shop.id)) {
          tableRef.value?.toggleRowSelection(shop, true)
        }
      })
    }
  } catch (error: any) {
    console.error('获取店铺列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchShopList()
}

const handlePageChange = () => {
  fetchShopList()
}

const handleSizeChange = () => {
  currentPage.value = 1
  fetchShopList()
}

const handleSelectionChange = (selection: ShopList_ResulItem[]) => {
  selectedShops.value = selection
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  const shopIds = selectedShops.value.map((shop) => shop.id)
  emit('confirm', shopIds, selectedShops.value)
  dialogVisible.value = false
}

watch(
  () => props.modelValue,
  (newVal) => {
  if (newVal) {
    currentPage.value = 1
    searchKeyword.value = ''
    authStatus.value = undefined
    selectedCities.value = []
    selectedShops.value = []
    fetchShopList()
  }
  }
)
</script>

<style lang="scss" scoped>
.shop-selector-container {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .filter-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .table-container {
    flex: 1;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
  }
}
</style>
