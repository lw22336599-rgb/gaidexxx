<template>
  <div class="discount">
    <div class="boxflex">
      <el-checkbox v-model="checked" label="原标题前加" />
      <el-input v-model="input" style="width: 150px; margin: 0 5px" />
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" label="批量加前缀" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="序号" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" label="批量加后缀" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="序号" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" label="批量删除前缀" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="序号" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" label="批量删除后缀" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="序号" />
      <el-input v-model="input" style="width: 80px; margin: 0 5px" placeholder="任意值" />
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" style="margin-right: 5px" label="替换关键词" />将
      <el-input v-model="input" style="width: 100px; margin: 0 5px" placeholder="任意值" />
      <div>替换为</div>
      <el-input v-model="input" style="width: 100px; margin: 0 5px" placeholder="任意值" />
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
::v-deep.boxflex {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .el-checkbox__inner {
    border-radius: 50%;
  }
}
.texttip {
  color: #ed8d82;
}
</style>
