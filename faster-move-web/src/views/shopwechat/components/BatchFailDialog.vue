<template>
  <el-dialog v-model="visible" title="批量操作部分失败" width="640px">
    <div class="batch-fail-content">
      <el-alert type="warning" :closable="false" show-icon class="summary-alert">
        <template #title> 成功 {{ successCount }} 家，失败 {{ failedList.length }} 家 </template>
      </el-alert>
      <el-table :data="failedList" max-height="320" size="small" border>
        <el-table-column prop="OffId" label="门店ID" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.OffId ?? row.ShopId ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="ShopName" label="店铺名" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.ShopName ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="Reason" label="失败原因" min-width="180" show-overflow-tooltip />
      </el-table>
    </div>
    <template #footer>
      <el-button type="primary" @click="visible = false">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BatchOperationFailItem } from '@/TsModel/Alien/Entity/Function/BatchOperationResult'

const props = defineProps<{
  modelValue: boolean
  successCount: number
  failedList: BatchOperationFailItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
</script>

<style scoped lang="scss">
.batch-fail-content {
  .summary-alert {
    margin-bottom: 12px;
  }
}
</style>
