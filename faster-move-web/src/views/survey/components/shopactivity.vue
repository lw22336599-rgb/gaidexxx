<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column type="index" label="序号" width="80" />
    <el-table-column prop="num" align="center" label="活动类型" width="150"> </el-table-column>
    <el-table-column prop="num" label="活动详情" :show-overflow-tooltip="true"> </el-table-column>
    <el-table-column prop="num" align="center" label="活动发布时间" width="200"> </el-table-column>
  </el-table>
</template>

<script setup lang="ts">

const tableData = ref([
  {
    date: "2016-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    num: 1,
    wechathao:true,
    wechatqun:true,
  },

])
</script>

<style scoped lang="scss">


</style>
