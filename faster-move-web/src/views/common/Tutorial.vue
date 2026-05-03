<template>
  <div class="tutorial-page-container">
    <div v-if="!loading && tutorialUrl" class="tutorial-content">
      <iframe 
        :src="tutorialUrl" 
        frameborder="0" 
        class="tutorial-iframe"
        @load="handleIframeLoad"
      ></iframe>
    </div>
    <div v-else-if="!loading && !tutorialUrl" class="tutorial-empty">
      <el-empty description="暂未配置教程连接，请联系管理员配置" />
    </div>
    <div v-if="loading" class="tutorial-loading" v-loading="loading" element-loading-text="正在加载教程...">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'Tutorial',
})

const route = useRoute()
const loading = ref(true)
const tutorialUrl = ref('')

// 根据路由 meta 获取配置 key
const getTutorialConfigKey = (): string => {
  const tutorialType = route.meta?.tutorialType as string
  return tutorialType || 'ImServiceTutorialUrl'
}

// 加载教程链接
const loadTutorialUrl = async () => {
  loading.value = true
  try {
    const configKey = getTutorialConfigKey()
    const url = await apiManager.systemconfigApi.GetConfigByKey(configKey)
    
    if (url) {
      tutorialUrl.value = url
    } else {
      ElMessage.warning('暂未配置教程连接')
    }
  } catch (error) {
    console.error('获取教程连接失败:', error)
    ElMessage.error('获取教程连接失败')
  } finally {
    loading.value = false
  }
}

const handleIframeLoad = () => {
  console.log('教程页面加载完成')
}

onMounted(() => {
  loadTutorialUrl()
})
</script>

<style scoped lang="scss">
.tutorial-page-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #fff;
}

.tutorial-content {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.tutorial-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.tutorial-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
