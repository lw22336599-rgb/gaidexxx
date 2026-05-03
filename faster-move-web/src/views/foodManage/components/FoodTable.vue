<template>
  <div class="food-table">
    <el-table ref="tableRef" :data="foods" :loading="loading" @selection-change="handleSelectionChange" row-key="id"
      :expand-row-keys="expandedRows" @row-click="handleRowClick">

      <el-table-column type="selection" width="30" />
      <el-table-column type="expand" width="40">
        <!-- SKU子表 -->
        <template #default="{ row }">
          <el-table :data="row.SkuList" border
            @selection-change="(selection) => handleSkuSelectionChange(row, selection)">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="SkuPath" label="规格名称" />
            <el-table-column prop="Price" label="原价" width="120">
              <template #default="{ row: sku }">
                <div v-if="editingSkuCell?.skuId === sku.SkuId && editingSkuCell.field === 'Price'" class="cell-edit">
                  <el-input-number v-model="sku.Price" :min="0" :precision="2" :step="0.1" controls-position="right"
                    size="small" class="auto-width-input" @change="(val) => handleSkuPriceChange(row, sku, val)"
                    @blur="() => handleSkuPriceBlur(row, sku)" />
                </div>
                <div v-else class="cell-content" @click="startEditSkuCell(sku, 'Price')">
                  {{ sku.Price }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="ActPrice" label="活动价" width="120">
              <template #default="{ row: sku }">
                <div v-if="editingSkuCell?.skuId === sku.SkuId && editingSkuCell.field === 'ActPrice'"
                  class="cell-edit">
                  <el-input-number :model-value="getZheKouField(sku, 'ActPrice')"
                    @change="(val) => handleSkuActPriceChange(row, sku, val)"
                    @blur="() => handleSkuActPriceBlur(row, sku)" :min="0" :max="sku.Price" :precision="2" :step="0.1"
                    controls-position="right" size="small" class="auto-width-input" />
                </div>
                <div v-else class="cell-content" @click="startEditSkuCell(sku, 'ActPrice')">
                  {{ getZheKouField(sku, 'ActPrice') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="Stock" label="库存" width="120">
              <template #default="{ row: sku }">
                <div v-if="editingSkuCell?.skuId === sku.SkuId && editingSkuCell.field === 'Stock'" class="cell-edit">
                  <el-input-number v-model="sku.Stock" :min="0" :precision="0" :step="1" controls-position="right"
                    size="small" class="auto-width-input" @change="(val) => handleSkuStockChange(row, sku, val)"
                    @blur="() => handleSkuStockBlur(row, sku)" />
                </div>
                <div v-else class="cell-content" @click="startEditSkuCell(sku, 'Stock')">
                  {{ sku.Stock }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="MinBuy" label="起购" width="120">
              <template #default="{ row: sku }">
                <div v-if="editingSkuCell?.skuId === sku.SkuId && editingSkuCell.field === 'MinBuy'" class="cell-edit">
                  <el-input-number v-model="sku.MinBuy" :min="1" :precision="0" :step="1" controls-position="right"
                    size="small" class="auto-width-input" @change="(val) => handleSkuMinBuyChange(row, sku, val)"
                    @blur="() => handleSkuMinBuyBlur(row, sku)" />
                </div>
                <div v-else class="cell-content" @click="startEditSkuCell(sku, 'MinBuy')">
                  {{ sku.MinBuy }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="Discount" label="折扣" width="120">
              <template #default="{ row: sku }">
                <span>{{ getZheKouField(sku, 'Discount') }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="OrderLimit" label="每单限购" width="100">
              <template #default="{ row: sku }">
                <div
                  v-if="editingSkuCell?.skuId === sku.SkuId && editingSkuCell.field === 'OrderLimit' && sku.Discount?.FoodItems"
                  class="cell-edit">
                  <el-input-number
                    :model-value="sku.Discount?.FoodItems?.find((i: ActivityType_ZheKou_Item) => i.SkuId === sku.SkuId)?.OrderLimit || 0"
                    @change="(val) => handleSkuOrderLimitChange(row, sku, val)"
                    @blur="() => handleSkuOrderLimitBlur(row, sku)" :min="0" :precision="0" :step="1"
                    controls-position="right" size="small" class="auto-width-input" />
                </div>
                <div v-else class="cell-content"
                  @click="sku.Discount?.FoodItems ? startEditSkuCell(sku, 'OrderLimit') : null">
                  {{ getZheKouField(sku, 'OrderLimit') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="DayLimit" label="每日库存" width="100">
              <template #default="{ row: sku }">
                <div
                  v-if="editingSkuCell?.skuId === sku.SkuId && editingSkuCell.field === 'DayLimit' && sku.Discount?.FoodItems"
                  class="cell-edit">
                  <el-input-number
                    :model-value="sku.Discount?.FoodItems?.find((i: ActivityType_ZheKou_Item) => i.SkuId === sku.SkuId)?.DayLimit || 0"
                    @change="(val) => handleSkuDayLimitChange(row, sku, val)"
                    @blur="() => handleSkuDayLimitBlur(row, sku)" :min="0" :precision="0" :step="1"
                    controls-position="right" size="small" class="auto-width-input" />
                </div>
                <div v-else class="cell-content"
                  @click="sku.Discount?.FoodItems ? startEditSkuCell(sku, 'DayLimit') : null">
                  {{ getZheKouField(sku, 'DayLimit') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="ActivityDate" label="活动时间" width="180">
              <template #default="{ row: sku }">
                <span>
                  {{ getZheKouActivityDate(sku) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="Status" label="状态" width="150">
              <template #default="{ row }">
                <el-select v-model="row.Status" @change="(val) => handleStatusChange(row, val)">
                  <el-option :value="FoodManageApi.FoodStatusType.已上架" label="上架" />
                  <el-option :value="FoodManageApi.FoodStatusType.已下架" label="下架" />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="商品图片" width="100">
        <template #default="{ row }">
          <el-image :src="row.ImageUrls?.find((img: ImageUrlItem) => img.IsMaster)?.Img || row.ImageUrls?.[0]?.Img"
            :preview-src-list="row.ImageUrls?.map((img: ImageUrlItem) => img.Img)" fit="cover" class="food-image"
            :initial-index="0" :preview-teleported="true">
            <template #error>
              <div class="image-error">
                <el-icon>
                  <Picture />
                </el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="Name" label="商品名称" min-width="200">
        <template #default="{ row }">
          <div v-if="editingCell?.rowId === row.id && editingCell.field === 'Name'" class="cell-edit">
            <el-input v-model="row.Name" @change="handleNameChange(row)" @blur="handleNameBlur(row)" />

          </div>
          <div v-else class="cell-content" @click="startEditCell(row, 'Name')">
            <div>{{ row.Name }}</div>

          </div>
          <div v-if="row.Msg" class="error-message">{{ row.Msg }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="Price" label="价格" width="100">
        <template #default="{ row }">
          <div class="cell-content">
            {{ getPriceRange(row) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="Discount" label="折扣" width="80">
        <template #default="{ row }">
          <div class="cell-content">
            {{ getDiscountRange(row) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="Stock" label="库存" width="110">
        <template #default="{ row }">
          <div class="cell-content">
            {{ getTotalStock(row) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="MinBuyCount" label="起购" width="100">
        <template #default="{ row }">
          <div v-if="editingCell?.rowId === row.id && editingCell.field === 'MinBuyCount'" class="cell-edit">
            <el-input-number v-model="row.MinBuyCount" :min="1" :precision="0" :step="1" controls-position="right"
              size="small" class="auto-width-input" @change="(val) => handleMinBuyChange(row, val)"
              @blur="handleMinBuyBlur(row)" />
          </div>
          <div v-else class="cell-content" @click="startEditCell(row, 'MinBuyCount')">
            {{ row.MinBuyCount }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="Status" label="状态" width="150">
        <template #default="{ row }">
          <el-select v-model="row.Status" @change="(val) => handleStatusChange(row, val)">
            <el-option :value="FoodManageApi.FoodStatusType.已上架" label="上架" />
            <el-option :value="FoodManageApi.FoodStatusType.已下架" label="下架" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <template v-if="props.tabType === 'batch-price'">

              <el-button type="primary" link @click="handleOfflineDiscount(row)"
                :disabled="!row.SkuList?.some((sku: FoodManageApi.FoodSkuItem) => sku.Discount)">
                下线折扣
              </el-button>
              <el-button type="primary" link @click="handleDelete(row)">
                删除
              </el-button>
            </template>
            <template v-else-if="props.tabType === 'updat-foodimg'">
              <el-button type="primary" link @click="handleUpdateImage(row)"
                :disabled="!row.ImageUrls?.length">主图框</el-button>



            </template>
            <el-button type="primary" link @click="handleRecover(row)">
              恢复
            </el-button>
            <!-- <el-button type="primary" link @click="handleViewDetail(row)">
              商品详情
            </el-button> -->
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { FoodManageApi } from '../types/api'
import { ActivityType_ZheKou_Item, ActivityType_ZheKou_SetType } from '/@/types/activity/ActivityType_ZheKou'
import { PickType } from '~/src/types/activity/PickType'

interface ImageUrlItem {
  Img: string
  IsMaster: boolean
  Index: number
  OtherValues: any
}

// 与后端UpdateSpuInSkuItem保持一致的数据结构
interface SelectedSku {
  Spu: string
  SkuIds: string[]
}

const props = defineProps<{
  foods: FoodManageApi.FoodItemVo[]
  loading: boolean
  selectedFoods: string[]
  selectedFoodIds: string[]
  taskId: string
  shopId: string
  syncSite: boolean
  tabType?: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedFoods', value: string[]): void
  (e: 'update:selectedFoodIds', value: string[]): void
  (e: 'update'): void
  (e: 'offline-discount', params: FoodManageApi.BatchOfflineDiscountParams): void
  (e: 'delete', food: FoodManageApi.FoodItemVo): void
  (e: 'update-image', food: FoodManageApi.FoodItemVo): void
  (e: 'view-detail', food: FoodManageApi.FoodItemVo): void
  (e: 'update:selectedSkus', value: SelectedSku[]): void
  (e: 'single-delete', food: FoodManageApi.FoodItemVo): void
  (e: 'update-price', params: FoodManageApi.UpdateFoodPriceParms): void
  (e: 'update-stock', params: FoodManageApi.BatchUpdateStockParams): void
  (e: 'update-discount', params: FoodManageApi.BatchUpdateDiscountParams): void
  (e: 'update-minbuy', params: FoodManageApi.BatchUpdateMinBuyParams): void
  (e: 'update-name', params: FoodManageApi.UpdateFoodNameParms): void
  (e: 'update-status', params: FoodManageApi.BatchUpdateStatusParams): void
  (e: 'recover', food: FoodManageApi.FoodItemVo): void
  (e: 'delete-image', food: FoodManageApi.FoodItemVo): void
}>()

const tableRef = ref()
const editingCell = ref<{ rowId: string; field: string } | null>(null)
const editingSkuCell = ref<{ skuId: string; field: string } | null>(null)
const expandedRows = ref<string[]>([])
const selectedSkus = ref<SelectedSku[]>([])

// 开始编辑单元格
const startEditCell = (row: FoodManageApi.FoodItemVo, field: string) => {
  editingCell.value = { rowId: row.id, field }
}

// 开始编辑SKU单元格
const startEditSkuCell = (sku: FoodManageApi.FoodSkuItem, field: string) => {
  editingSkuCell.value = { skuId: sku.SkuId, field }
}

// 处理SKU选择变化
const handleSkuSelectionChange = (food: FoodManageApi.FoodItemVo, selection: FoodManageApi.FoodSkuItem[]) => {
  selectedSkus.value = selectedSkus.value.filter(sku => sku.Spu !== food.SpuId)
  if (selection.length > 0) {
    selectedSkus.value.push({
      Spu: food.SpuId,
      SkuIds: selection.map(sku => sku.SkuId)
    })
  }
  emit('update:selectedSkus', selectedSkus.value)
}

// 处理选中状态变化
const handleSelectionChange = (selection: FoodManageApi.FoodItemVo[]) => {
  emit('update:selectedFoods', selection.map(item => item.SpuId))
  emit('update:selectedFoodIds', selection.map(item => item.id))
}

// 处理商品名称变化
const handleNameChange = (row: FoodManageApi.FoodItemVo) => {
  editingCell.value = null
  emit('update-name', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    FoodIds: [row.id],
    Mode: FoodManageApi.UpdateFoodNameMode.重命名,
    ReplacementText: row.Name
  })
}

// 处理商品名称失焦
const handleNameBlur = (row: FoodManageApi.FoodItemVo) => {
  editingCell.value = null
}

// 处理商品价格变化
const handlePriceChange = (row: FoodManageApi.FoodItemVo, value: number | undefined) => {
  editingCell.value = null
}

// 处理商品库存变化
const handleStockChange = (row: FoodManageApi.FoodItemVo, value: number | undefined) => {
  editingCell.value = null
}

// 处理商品折扣变化
const handleDiscountChange = (row: FoodManageApi.FoodItemVo, value: number | undefined) => {
  editingCell.value = null
}

// 处理商品起购变化
const handleMinBuyChange = (row: FoodManageApi.FoodItemVo, value: number | undefined) => {
  editingCell.value = null
  emit('update-minbuy', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: row.SpuId,
      SkuIds: row.SkuList?.map(sku => sku.SkuId) || []
    }],
    AdjustType: FoodManageApi.AdjustTypeEnum.一口价,
    AdjustMinBuy: row.MinBuyCount
  })
}

// 处理商品起购失焦
const handleMinBuyBlur = (row: FoodManageApi.FoodItemVo) => {
  editingCell.value = null
}

// 处理商品状态变化
const handleStatusChange = (row: FoodManageApi.FoodItemVo, value: number | string | boolean) => {
  if (!row.id) {
    ElMessage.error('商品ID不能为空')
    return
  }
  // 更新选中的商品ID
  emit('update:selectedFoodIds', [row.id])
  emit('update:selectedFoods', [row.SpuId])
  // 发送状态更新事件
  emit('update-status', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    FoodIds: [row.id],
    IsOnSale: value as FoodManageApi.FoodStatusType
  })
}

// 处理SKU价格变化
const handleSkuPriceChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  if (!value || value <= 0) {
    ElMessage.error('价格必须大于0');
    return;
  }

  // 验证必要的参数
  if (!food?.SpuId) {
    ElMessage.error('商品ID不能为空');
    return;
  }

  if (!sku?.SkuId) {
    ElMessage.error('SKU ID不能为空');
    return;
  }

  editingSkuCell.value = null;
  emit('update-price', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    ChangeType: FoodManageApi.ChangePriceTypeEnum.固定价格,
    Value: value
  });
}

// 处理SKU价格失焦
const handleSkuPriceBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null
}

// 处理SKU库存变化
const handleSkuStockChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  if (typeof sku.Stock !== 'number' || sku.Stock < 0) {
    ElMessage.error('库存数量无效')
    return
  }

  editingSkuCell.value = null
  emit('update-stock', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    AdjustType: FoodManageApi.AdjustTypeEnumStock.固定数量,
    AdjustStock: sku.Stock
  })
}

// 处理SKU库存失焦
const handleSkuStockBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null
}

// 处理SKU折扣变化
const handleSkuDiscountChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  // 只记录变化,不触发更新
}

// 处理SKU折扣失焦
const handleSkuDiscountBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null
  // 调用更新折扣接口
  const discount = sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId)?.Discount || 0;
  const dailyStockLimitType = sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId)?.DayLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;
  const orderLimitType = sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId)?.OrderLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;
  emit('update-discount', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    DiscountType: FoodManageApi.DiscountTypeEnum.折扣率,
    AdjustType: FoodManageApi.AdjustTypeEnum.一口价,
    DiscountRate: discount,
    DiscountPrice: sku.Price * (discount / 10),
    DailyStockLimitType: dailyStockLimitType,
    DailyStockLimitCount: sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId)?.DayLimit || 0,
    OrderLimitType: orderLimitType,
    OrderLimitCount: sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId)?.OrderLimit || 0,
    ActivityName: '折扣活动',
    StartTime: new Date().toISOString(),
    EndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    RoundType: FoodManageApi.RoundTypeEnum.不改变
  } as FoodManageApi.BatchUpdateDiscountParams);

  // 更新本地折扣对象
  if (!sku.Discount) {
    sku.Discount = {
      ActType: 1,
      ForUserType: 1,
      TimeScope: {
        Start: new Date(),
        End: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      AuToMonth: true,
      OverConf: true,
      PickType: PickType.DeliveryAndSelfPickup,
      FoodItems: []
    };
  }

  // 确保FoodItems数组存在
  if (!sku.Discount.FoodItems) {
    sku.Discount.FoodItems = [];
  }

  // 查找或创建对应的FoodItem
  let foodItem = sku.Discount.FoodItems.find(i => i.SkuId === sku.SkuId);
  if (!foodItem) {
    foodItem = {
      SpuId: food.SpuId,
      SkuId: sku.SkuId,
      SettingType: ActivityType_ZheKou_SetType.按折扣,
      OrderLimit: 0,
      DayLimit: 0,
      Discount: discount,
      OriginPrice: sku.Price,
      SkuName: sku.SkuPath,
      SpecPath: sku.ForSpec.map(s => s.OptionName)
    };
    sku.Discount.FoodItems.push(foodItem);
  }
}

// 处理SKU起购变化
const handleSkuMinBuyChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  editingSkuCell.value = null
  emit('update-minbuy', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    AdjustType: FoodManageApi.AdjustTypeEnum.一口价,
    AdjustMinBuy: sku.MinBuy
  })
}

// 处理SKU起购失焦
const handleSkuMinBuyBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null
}

// 处理SKU状态变化
const handleSkuStatusChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | string | boolean) => {
  emit('update-status', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    FoodIds: [food.id],
    IsOnSale: value ? FoodManageApi.FoodStatusType.已上架 : FoodManageApi.FoodStatusType.已下架
  })
}

// 处理SKU每单限购变化
const handleSkuOrderLimitChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  if (!sku.Discount || !sku.Discount.FoodItems) {
    sku.Discount = {
      ActType: 1,
      ForUserType: 1,
      TimeScope: {
        Start: new Date().toISOString(),
        End: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      AuToMonth: true,
      OverConf: true,
      PickType: 0,
      FoodItems: []
    };
  }

  let foodItem = sku.Discount.FoodItems.find(i => i.SkuId === sku.SkuId);
  if (!foodItem) {
    foodItem = {
      SpuId: food.SpuId,
      SkuId: sku.SkuId,
      SettingType: ActivityType_ZheKou_SetType.按折扣,
      OrderLimit: 0,
      DayLimit: 0,
      Discount: 1,
      OriginPrice: sku.Price,
      SkuName: sku.SkuPath,
      SpecPath: sku.ForSpec.map(s => s.OptionName)
    };
    sku.Discount.FoodItems.push(foodItem);
  }

  // 设置每单限购数量
  foodItem.OrderLimit = value || 0;
}

// 处理SKU每日库存变化
const handleSkuDayLimitChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  if (!sku.Discount || !sku.Discount.FoodItems) {
    sku.Discount = {
      ActType: 1,
      ForUserType: 1,
      TimeScope: {
        Start: new Date().toISOString(),
        End: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      AuToMonth: true,
      OverConf: true,
      PickType: 0,
      FoodItems: []
    };
  }

  let foodItem = sku.Discount.FoodItems.find(i => i.SkuId === sku.SkuId);
  if (!foodItem) {
    foodItem = {
      SpuId: food.SpuId,
      SkuId: sku.SkuId,
      SettingType: ActivityType_ZheKou_SetType.按折扣,
      OrderLimit: 0,
      DayLimit: 0,
      Discount: 1,
      OriginPrice: sku.Price,
      SkuName: sku.SkuPath,
      SpecPath: sku.ForSpec.map(s => s.OptionName)
    };
    sku.Discount.FoodItems.push(foodItem);
  }

  foodItem.DayLimit = value || 0;
}

// 处理SKU每单限购失焦
const handleSkuOrderLimitBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null;

  // 获取当前SKU的折扣项
  const foodItem = sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId);
  if (!foodItem) {
    ElMessage.error('未找到对应的折扣信息');
    return;
  }

  // 根据OrderLimit值判断是否限购
  const orderLimitType = foodItem.OrderLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;

  // 调用更新折扣接口
  emit('update-discount', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    DiscountType: FoodManageApi.DiscountTypeEnum.折扣率,
    AdjustType: FoodManageApi.AdjustTypeEnum.一口价,
    DiscountRate: foodItem.Discount,
    DailyStockLimitType: FoodManageApi.LimitTypeEnum.不限,
    OrderLimitType: orderLimitType,
    OrderLimitCount: foodItem.OrderLimit,
    ActivityName: '折扣活动',
    StartTime: new Date().toISOString(),
    EndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    RoundType: FoodManageApi.RoundTypeEnum.不改变
  });
}

// 处理SKU每日库存失焦
const handleSkuDayLimitBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null;

  // 获取当前SKU的折扣项
  const foodItem = sku.Discount?.FoodItems?.find(i => i.SkuId === sku.SkuId);
  if (!foodItem) {
    ElMessage.error('未找到对应的折扣信息');
    return;
  }

  // 根据DayLimit值判断是否限购
  const dailyStockLimitType = foodItem.DayLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;

  // 根据OrderLimit值判断是否限购
  const orderLimitType = foodItem.OrderLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;

  // 调用更新折扣接口
  emit('update-discount', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    DiscountType: FoodManageApi.DiscountTypeEnum.折扣率,
    AdjustType: FoodManageApi.AdjustTypeEnum.一口价,
    DiscountRate: foodItem.Discount,
    DiscountPrice: sku.Price * (foodItem.Discount / 10),
    DailyStockLimitType: dailyStockLimitType,
    DailyStockLimitCount: foodItem.DayLimit || 0,
    OrderLimitType: orderLimitType,
    OrderLimitCount: foodItem.OrderLimit || 0,
    ActivityName: '折扣活动',
    StartTime: new Date().toISOString(),
    EndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    RoundType: FoodManageApi.RoundTypeEnum.不改变
  } as FoodManageApi.BatchUpdateDiscountParams);
}

// 处理下线折扣
const handleOfflineDiscount = (row: FoodManageApi.FoodItemVo) => {
  // 将选中的商品ID设置为当前行
  emit('update:selectedFoods', [row.SpuId])
  emit('update:selectedFoodIds', [row.id])
  // 构建 Targets
  const targets = [{
    Spu: row.SpuId,
    SkuIds: row.SkuList?.filter(sku => sku.Discount)?.map(sku => sku.SkuId) || []
  }]
  // 触发下线折扣事件
  emit('offline-discount', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: targets
  })
}

// 处理删除
const handleDelete = (row: FoodManageApi.FoodItemVo) => {
  // 将选中的商品ID设置为当前行
  emit('update:selectedFoods', [row.SpuId])
  emit('update:selectedFoodIds', [row.id])
  // 触发单个商品删除操作
  emit('single-delete', row)
}

// 处理主图框
const handleUpdateImage = (row: FoodManageApi.FoodItemVo) => {
  // 将选中的商品ID设置为当前行
  emit('update:selectedFoods', [row.SpuId])
  emit('update:selectedFoodIds', [row.id])
  // 触发父组件的批量主图框操作
  emit('update')
}

// 处理查看详情
const handleViewDetail = (row: FoodManageApi.FoodItemVo) => {
  emit('view-detail', row)
}

// 处理行点击（用于强制折叠时清空编辑状态）
const handleRowClick = (row: FoodManageApi.FoodItemVo, column: any, event: MouseEvent) => {
  // 只在点击展开列时才处理折叠逻辑
  if (column && column.type === 'expand') {
    // 先清空编辑状态
    editingSkuCell.value = null
    // 切换折叠状态
    if (expandedRows.value.includes(row.id)) {
      expandedRows.value = []
    } else {
      expandedRows.value = [row.id]
    }
  }
}

// 获取折扣活动字段
function getZheKouField(sku: FoodManageApi.FoodSkuItem, field: string, formatSettingType = false) {

  const discount = sku.Discount;
  if (!discount || !discount.FoodItems) return '-';
  const item = discount.FoodItems.find(i => i.SkuId === sku.SkuId);
  if (!item) return '-';

  if (field === 'Discount') {
    // 显示折扣率
    return item.Discount ? `${item.Discount}折` : '-';
  }

  if (field === 'SettingType' && formatSettingType) {
    switch (item.SettingType) {
      case ActivityType_ZheKou_SetType.按折扣: return '按折扣';
      case ActivityType_ZheKou_SetType.按折后价: return '按折后价';
      default: return '无';
    }
  }

  // 只允许有效字段
  const validFields: (keyof ActivityType_ZheKou_Item)[] = [
    'ActPrice', 'OrderLimit', 'DayLimit', 'SettingType', 'OriginPrice',
    'SpuId', 'SkuId', 'Stock', 'Discount', 'PoiCharge', 'SkuName', 'SpecPath', 'OtherValues'
  ];
  if (validFields.includes(field as keyof ActivityType_ZheKou_Item)) {
    return (item as any)[field] ?? '-';
  }
  return '-';
}

function getZheKouActivityDate(sku: FoodManageApi.FoodSkuItem) {
  // 优先取 Discount.OtherValues.ActivityDate
  const discount = sku.Discount;
  if (discount && discount.OtherValues && discount.OtherValues.ActivityDate) {
    return discount.OtherValues.ActivityDate;
  }
  // 也可尝试从 FoodItems 里找
  const item = discount?.FoodItems?.find(i => i.SkuId === sku.SkuId);
  if (item && item.OtherValues && item.OtherValues.ActivityDate) {
    return item.OtherValues.ActivityDate;
  }
  return '-';
}

/**
 * 获取商品的价格范围
 * @param row 商品行数据
 * @returns 价格范围字符串，如 "10~100"
 */
function getPriceRange(row: FoodManageApi.FoodItemVo) {
  if (!row.SkuList?.length) return '-';
  const prices = row.SkuList.map(sku => sku.Price).filter(price => price !== undefined);
  if (prices.length === 0) return '-';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? min.toFixed(2) : `${min.toFixed(2)}~${max.toFixed(2)}`;
}

/**
 * 获取商品的总库存
 * @param row 商品行数据
 * @returns 总库存数量
 */
function getTotalStock(row: FoodManageApi.FoodItemVo) {
  if (!row.SkuList?.length) return 0;
  return row.SkuList.reduce((sum, sku) => sum + (sku.Stock || 0), 0);
}

/**
 * 获取商品的活动价范围
 * @param row 商品行数据
 * @returns 活动价范围字符串，如 "8~80"
 */
function getDiscountRange(row: FoodManageApi.FoodItemVo) {
  if (!row.SkuList?.length) return '-';
  const actPrices: number[] = [];

  row.SkuList.forEach(sku => {
    if (sku.Discount?.FoodItems) {
      const item = sku.Discount.FoodItems.find(i => i.SkuId === sku.SkuId);
      if (item?.ActPrice) {
        actPrices.push(item.ActPrice);
      }
    }
  });

  if (actPrices.length === 0) return '-';
  const min = Math.min(...actPrices);
  const max = Math.max(...actPrices);
  return min === max ? min.toFixed(2) : `${min.toFixed(2)}~${max.toFixed(2)}`;
}

// 处理SKU活动价变化
const handleSkuActPriceChange = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem, value: number | undefined) => {
  if (!value || value <= 0) {
    ElMessage.error('活动价必须大于0');
    return;
  }

  if (value >= sku.Price) {
    ElMessage.error('活动价必须小于原价');
    return;
  }

  // 初始化折扣对象
  if (!sku.Discount) {
    sku.Discount = {
      ActType: 1,
      ForUserType: 1,
      TimeScope: {
        Start: new Date(),
        End: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      AuToMonth: true,
      OverConf: true,
      PickType: PickType.DeliveryAndSelfPickup,
      FoodItems: []
    };
  }

  // 确保FoodItems数组存在
  if (!sku.Discount.FoodItems) {
    sku.Discount.FoodItems = [];
  }

  // 查找或创建对应的FoodItem
  let foodItem = sku.Discount.FoodItems.find(i => i.SkuId === sku.SkuId);
  if (!foodItem) {
    foodItem = {
      SpuId: food.SpuId,
      SkuId: sku.SkuId,
      SettingType: ActivityType_ZheKou_SetType.按折扣,
      OrderLimit: 0,
      DayLimit: 0,
      Discount: 1,
      OriginPrice: sku.Price,
      SkuName: sku.SkuPath,
      SpecPath: sku.ForSpec.map(s => s.OptionName)
    };
    sku.Discount.FoodItems.push(foodItem);
  }

  // 设置活动价
  foodItem.ActPrice = Number(value.toFixed(2));

  // 计算折扣率
  // 折扣率范围：0-10
  // 10 = 原价（不打折）
  // 5 = 5折
  // 1 = 1折
  const discount = Number(((foodItem.ActPrice / sku.Price) * 10).toFixed(2));

  // 验证折扣率是否在有效范围内
  if (discount < 0 || discount > 10) {
    ElMessage.error('折扣率计算错误，请检查活动价设置');
    return;
  }

  foodItem.Discount = discount;

  editingSkuCell.value = null;

  // 根据DayLimit值判断是否限购
  const dailyStockLimitType = foodItem.DayLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;

  // 根据OrderLimit值判断是否限购
  const orderLimitType = foodItem.OrderLimit > 0
    ? FoodManageApi.LimitTypeEnum.限购
    : FoodManageApi.LimitTypeEnum.不限;

  // 调用更新折扣接口
  emit('update-discount', {
    TaskId: props.taskId,
    ShopId: props.shopId,
    SyncSite: props.syncSite,
    GroupOffids: null,
    Targets: [{
      Spu: food.SpuId,
      SkuIds: [sku.SkuId]
    }],
    DiscountType: FoodManageApi.DiscountTypeEnum.折扣率,
    AdjustType: FoodManageApi.AdjustTypeEnum.一口价,
    DiscountRate: discount,
    DiscountPrice: sku.Price * (discount / 10),
    DailyStockLimitType: dailyStockLimitType,
    DailyStockLimitCount: foodItem?.DayLimit ?? 0,
    OrderLimitType: orderLimitType,
    OrderLimitCount: foodItem?.OrderLimit ?? 0,
    ActivityName: '折扣活动',
    StartTime: new Date().toISOString(),
    EndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    RoundType: FoodManageApi.RoundTypeEnum.不改变
  } as FoodManageApi.BatchUpdateDiscountParams);
}

// 处理SKU活动价失焦
const handleSkuActPriceBlur = (food: FoodManageApi.FoodItemVo, sku: FoodManageApi.FoodSkuItem) => {
  editingSkuCell.value = null
}

// 处理恢复
const handleRecover = (row: FoodManageApi.FoodItemVo) => {
  // 将选中的商品ID设置为当前行
  emit('update:selectedFoods', [row.SpuId])
  emit('update:selectedFoodIds', [row.id])
  // 触发单个商品恢复操作
  emit('recover', row)
}
</script>

<style lang="scss" scoped>
.food-table {
  flex: 1;
  overflow: auto;

  :deep(.el-input-number) {
    &.auto-width-input {
      width: 100%;
    }
  }

  // 紧凑化复选框和展开按钮
  :deep(.el-table__expand-icon),
  :deep(.el-checkbox) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  :deep(.el-table__cell) {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }

  .food-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
  }

  .image-error {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 4px;
  }

  .cell-content {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .cell-edit {
    padding: 4px;
    display: flex;
    justify-content: center;
  }

  .error-message {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 4px;
  }
}
</style>