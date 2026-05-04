<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column type="index" label="序号" width="80" />
    <el-table-column prop="num" align="center" label="商品图片" width="100">
      <template #default>
        <div class="imgbox" />
      </template>
    </el-table-column>
    <el-table-column prop="num" align="center" label="一级分类" width="150" />
    <!--    <el-table-column prop="num" align="center" label="二级分类" width="150"> </el-table-column>-->
    <el-table-column prop="num" align="center" label="商品名称" width="150" />
    <el-table-column prop="num" align="center" label="规格" width="150" />
    <!--    <el-table-column prop="num" align="center" label="条形码" width="250"> </el-table-column>-->
    <el-table-column prop="num" align="center" label="活动价" width="150">
      <template #default="scope">
        <div>￥{{ scope.row.num }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="num" align="center" label="原价" width="150">
      <template #default="scope">
        <div>￥{{ scope.row.num }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="num" align="center" label="月销" width="150" />
    <el-table-column prop="num" align="center" label="现库存" width="150" />
    <el-table-column prop="num" align="center" label="日库存" width="150" />
    <el-table-column prop="num" align="center" label="收藏数" width="150" />
    <el-table-column prop="num" align="center" label="好评数" width="150" />
    <el-table-column prop="num" align="center" label="好评率" width="150" />
    <el-table-column prop="num" align="center" label="单/购买数" width="150" />
  </el-table>
</template>

<script setup lang="ts">
const tableData = ref([
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    num: 1,
    wechathao: true,
    wechatqun: true
  }
])
</script>

<style scoped lang="scss">
.imgbox {
  margin: auto;
  width: 40px;
  height: 40px;
  background: #dfdfdf;
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
