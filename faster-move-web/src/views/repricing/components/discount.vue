<template>
  <div class="discount">
    <div class="boxflex">
      <div style="width: 80px">活动时间：</div>
      <el-date-picker
        v-model="timeval"
        type="daterange"
        range-separator="To"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      />
    </div>
    <div class="texttip">选择日期时，息标点击第一个日期选择开始时间 点击第二个日期选择结束时间</div>
    <div class="boxflex">自动延期：<el-checkbox v-model="checked" label="活动到期后自动延期30天" /></div>
    <div class="boxflex boxflex1">
      <el-checkbox v-model="checked" label="按折扣价" />
      打<el-input v-model="input" style="width: 50px; margin: 0 5px" />折
      <div class="texttip">(低于3折按3折处理)</div>
    </div>
    <div class="boxflex boxflex1">
      <el-checkbox v-model="checked" label="按活动价" style="margin-right: 5px" />
      <el-input v-model="input" style="width: 50px; margin-right: 5px" />元
      <div class="texttip" style="margin-left: 5px">(低于原价的30%按3折外理)</div>
    </div>
    <div class="boxflex boxflex1">
      <el-checkbox v-model="checked" label="当前活动基础上" style="margin-right: 5px" />
      <el-input v-model="input" style="width: 50px; margin-right: 5px" />元
      <el-select v-model="value" style="width: 100px; margin: 5px">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <div class="texttip">(新创建折扣商品，增加会设置失败)</div>
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" label="不限购" />
      <el-checkbox v-model="checked" label="限购" />
      <el-input v-model="input" style="width: 50px; margin: 0 5px" />份
    </div>
  </div>
</template>

<script setup lang="ts">
const timeval = ref('')
const input = ref('')
const checked = ref(true)
const value = ref('')
const options = [
  {
    value: 'Option1',
    label: 'Option1'
  }
]
</script>

<style scoped lang="scss">
.boxflex {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
::v-deep.boxflex1 {
  .el-checkbox__inner {
    border-radius: 50%;
  }
}
.texttip {
  color: #ed8d82;
}
</style>
