<template>
  <div class="discount">
    <div class="boxflex">
      <el-checkbox v-model="checked" label="在原库存基础上" style="margin-right: 5px" />

      <el-select v-model="value" style="width: 100px; margin: 5px">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input v-model="input" style="width: 80px; margin-right: 5px" />
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
.discount {
  display: flex;
  justify-content: center;
  align-items: center;
}
.boxflex {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.texttip {
  color: #ed8d82;
}
</style>
