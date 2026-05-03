<template>
  <div class="discount">

    <div class="boxflex">
      <el-checkbox v-model="checked" label="当前原价基础上" />
      <el-select
        v-model="value"
        style="width: 100px;margin-left:5px"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input v-model="input" style="width: 100px;margin:0 5px;" />
      <el-select
        v-model="value"
        style="width: 100px"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="boxflex">
      <el-checkbox v-model="checked" label="统一修改原价为"/>
      <el-input v-model="input" style="width: 150px;margin:0 5px;" />元
    </div>

  </div>
</template>

<script setup lang="ts">
const timeval=ref('')
const input=ref('')
const checked = ref(true)
const value = ref('')
const options = [
  {
    value: 'Option1',
    label: 'Option1',
  }
]
</script>

<style scoped lang="scss">
::v-deep.boxflex{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .el-checkbox__inner {
    border-radius: 50%;
  }
}
.texttip{
  color: #ed8d82;
}
</style>
