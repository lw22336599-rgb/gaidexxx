<template>
  <div class="customer-service-management-container no-background-container">
    <div class="page-header">
      <h1>客服管理</h1>
    </div>
    <div class="page-content">
      <el-card>
        <p>客服管理功能正在开发中...</p>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'CustomerServiceManagement',
})
</script>

<style lang="scss" scoped>
.customer-service-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .page-content {
    border-radius: 8px;
    overflow: hidden;
    
    .el-card {
      padding: 20px;
      border-radius: 8px;
    }
  }
}
</style>

