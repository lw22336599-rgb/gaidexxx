<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column type="selection" width="55" />
    <el-table-column prop="num" label="商品图片" width="100">
      <template #default>
        <div class="imgbox" />
      </template>
    </el-table-column>
    <el-table-column prop="num" label="商品名称" width="150">
      <template #default="scope">
        <div v-if="scope.row.nameshow" class="nametext">
          <div>1111</div>
          <el-icon @click="setshow(scope.row, false)"><Edit /></el-icon>
        </div>
        <div v-if="!scope.row.nameshow" class="nametext">
          <el-input v-model="input" style="flex: 1" />
          <el-icon @click="setshow(scope.row, true)"><Close /></el-icon>
          <el-icon @click="setshow(scope.row, true)"><Check /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="状态" :show-overflow-tooltip="true">
      <template #default>
        <div class="nametext">
          <div>1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="原价" width="150">
      <template #default>
        <div class="nametext">
          <div>1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="库存" width="150">
      <template #default>
        <div class="nametext">
          <div class="green">1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="折扣" width="150">
      <template #default>
        <div class="nametext">
          <div>1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="活动价" width="150">
      <template #default>
        <div class="nametext">
          <div class="red">￥1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="修改状态" width="150">
      <template #default>
        <div class="nametext">
          <div class="green">1111</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="月售" width="150" />
    <el-table-column prop="num" label="现库存" width="150">
      <template #default>
        <div class="nametext">
          <div>1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="商品排序" width="150">
      <template #default>
        <div class="nametext">
          <div>1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="num" label="活动剩余时间" width="150">
      <template #default>
        <div class="nametext">
          <div>1111</div>
          <el-icon><Edit /></el-icon>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { Edit, Close, Check } from '@element-plus/icons-vue'
const tableData = ref([
  {
    id: '14',
    date: '2016-05-03',
    name: 'Tom',
    nameshow: true,
    address: 'No. 189, Grove St, Los Angeles',
    num: 1,
    wechathao: true,
    wechatqun: true,
    input: ''
  }
])
const setshow = (row: any, val: boolean) => {
  tableData.value = tableData.value.map(item => {
    if (item.id == row.id) {
      item.nameshow = val
    }
    return item
  })
}
</script>

<style scoped lang="scss">
.imgbox {
  width: 100px;
  height: 100px;
  background: #eee;
}
.nametext {
  display: flex;
  align-items: center;
}
.green {
  color: #29aa59;
}
.red {
  color: #f16363;
}
.yell {
  color: #d4a137;
}
</style>
