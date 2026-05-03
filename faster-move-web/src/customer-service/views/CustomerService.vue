<template>
  <div class="customer-service-page">
    <customer-service-chat />
  </div>
</template>

<script setup lang="ts">
import CustomerServiceChat from '/@/customer-service/components/CustomerServiceChat.vue'

defineOptions({
  name: 'CustomerService',
  components: {
    CustomerServiceChat
  }
})
</script>

<style lang="scss" scoped>
.customer-service-page {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--el-bg-color);
}
</style>