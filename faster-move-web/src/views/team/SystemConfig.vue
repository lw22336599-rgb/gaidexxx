<template>
  <div class="system-config">
    <vab-card>
      <div class="header">
        <div class="title">系统设置</div>
        <div class="actions">
          <el-button size="small" :loading="loading" @click="loadConfig">
            重新获取
          </el-button>
          <el-button size="small" type="warning" :loading="initLoading" @click="handleInitDefault">
            初始化默认配置
          </el-button>
          <el-button type="primary" size="small" :loading="saving" @click="handleSave">
            保存配置
          </el-button>
        </div>
      </div>

      <el-alert title="系统配置仅管理员可编辑，修改后会影响全局菜单与联系入口展示。" type="info" :closable="false" show-icon class="tip" />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="left"
        v-loading="loading || saving" class="config-form">
        <el-form-item label="在线客服地址" prop="CustomerServiceUrl">
          <el-input v-model.trim="form.CustomerServiceUrl" placeholder="请输入在线客服链接，如客服中心或工单入口" />
        </el-form-item>
        <el-form-item label="软件下载地址" prop="DownloadUrl">
          <el-input v-model.trim="form.DownloadUrl" placeholder="请输入客户端下载或更新包地址" />
        </el-form-item>
        <el-form-item label="商务洽谈联系方式" prop="BusinessContact">
          <el-input v-model.trim="form.BusinessContact" placeholder="请输入商务对接方式，如企微、电话" />
        </el-form-item>

        <el-divider content-position="left">教程链接配置</el-divider>

        <el-form-item label="IM客服教程连接">
          <el-input v-model.trim="tutorialLinks.ImServiceTutorialUrl" placeholder="请输入IM客服使用教程连接" />
        </el-form-item>
        <el-form-item label="门店推送教程连接">
          <el-input v-model.trim="tutorialLinks.ShopPushTutorialUrl" placeholder="请输入门店推送使用教程连接" />
        </el-form-item>

        <el-divider content-position="left">菜单展示平台</el-divider>

        <el-form-item label="门店管理显示平台" prop="ShopManagePlatforms">
          <el-select v-model="form.ShopManagePlatforms" multiple filterable placeholder="请选择在门店管理中展示的平台">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="店铺复制显示平台" prop="ShopCopyPlatforms">
          <el-select v-model="form.ShopCopyPlatforms" multiple filterable placeholder="请选择在店铺复制中展示的平台">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="店铺调研显示平台" prop="ShopResearchPlatforms">
          <el-select v-model="form.ShopResearchPlatforms" multiple filterable placeholder="请选择在店铺调研中展示的平台">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </vab-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { SystemConfigAllDto } from '@/TsModel/Alien/Entity/Function/SystemConfig/SystemConfigAllDto'
import { useSystemConfigStore } from '@/store/modules/systemConfig'

defineOptions({
  name: 'SystemConfig',
})

interface ShopTypeOption {
  label: string
  value: ShopType
}

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const initLoading = ref(false)
const systemConfigStore = useSystemConfigStore()

const form = reactive<SystemConfigAllDto>({
  CustomerServiceUrl: '',
  DownloadUrl: '',
  BusinessContact: '',
  ShopManagePlatforms: [],
  ShopCopyPlatforms: [],
  ShopResearchPlatforms: [],
})

// 教程链接独立配置（使用独立的 key 存储）
const tutorialLinks = reactive({
  ImServiceTutorialUrl: '',
  ShopPushTutorialUrl: '',
})

const shopTypeOptions: ShopTypeOption[] = [
  { label: '美团外卖', value: ShopType.美团 },
  { label: '饿了么外卖', value: ShopType.饿了么 },
  { label: '美团闪购', value: ShopType.美团闪购 },
  { label: '美团医药', value: ShopType.美团医药 },
  { label: '饿百零售', value: ShopType.饿百零售 },
  { label: '京东到家', value: ShopType.京东到家 },
  { label: '抖店即时零售', value: ShopType.抖店即时零售 },
  { label: '饿了么官方', value: ShopType.饿了么官方 },
  { label: '美团团购', value: ShopType.美团团购 },
  { label: '京东团购', value: ShopType.京东团购 },
]

const rules: FormRules = {
  CustomerServiceUrl: [{ required: true, message: '请输入在线客服地址', trigger: 'blur' }],
  DownloadUrl: [{ required: true, message: '请输入软件下载地址', trigger: 'blur' }],
  BusinessContact: [{ required: true, message: '请输入商务洽谈联系方式', trigger: 'blur' }],
  ShopManagePlatforms: [{ required: true, type: 'array', message: '请选择门店管理显示平台', trigger: 'change' }],
  ShopCopyPlatforms: [{ required: true, type: 'array', message: '请选择店铺复制显示平台', trigger: 'change' }],
  ShopResearchPlatforms: [{ required: true, type: 'array', message: '请选择店铺调研显示平台', trigger: 'change' }],
}

const normalizePlatforms = (list: ShopType[] | null | undefined): ShopType[] => {
  if (!Array.isArray(list)) return []
  return [...list]
}

const applyConfig = (config: SystemConfigAllDto) => {
  form.CustomerServiceUrl = config.CustomerServiceUrl || ''
  form.DownloadUrl = config.DownloadUrl || ''
  form.BusinessContact = config.BusinessContact || ''
  form.ShopManagePlatforms = normalizePlatforms(config.ShopManagePlatforms)
  form.ShopCopyPlatforms = normalizePlatforms(config.ShopCopyPlatforms)
  form.ShopResearchPlatforms = normalizePlatforms(config.ShopResearchPlatforms)
}

// 加载教程链接配置
const loadTutorialLinks = async () => {
  try {
    const [imUrl, shopPushUrl] = await Promise.all([
      apiManager.systemconfigApi.GetConfigByKey('ImServiceTutorialUrl'),
      apiManager.systemconfigApi.GetConfigByKey('ShopPushTutorialUrl'),
    ])
    tutorialLinks.ImServiceTutorialUrl = imUrl || ''
    tutorialLinks.ShopPushTutorialUrl = shopPushUrl || ''
  } catch (error) {
    // 配置不存在时不报错
    console.log('教程链接配置未设置')
  }
}

const loadConfig = async () => {
  loading.value = true
  try {
    const result = await systemConfigStore.ensureConfig()
    if (!result) {
      throw new Error('未获取到系统配置')
    }
    applyConfig(result)
    await loadTutorialLinks()
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // 保存主配置
    const payload: SystemConfigAllDto = {
      CustomerServiceUrl: form.CustomerServiceUrl,
      DownloadUrl: form.DownloadUrl,
      BusinessContact: form.BusinessContact,
      ShopManagePlatforms: normalizePlatforms(form.ShopManagePlatforms),
      ShopCopyPlatforms: normalizePlatforms(form.ShopCopyPlatforms),
      ShopResearchPlatforms: normalizePlatforms(form.ShopResearchPlatforms),
    }

    await apiManager.systemconfigApi.UpdateAllConfig(payload)
    systemConfigStore.updateConfigCache(payload)

    // 保存教程链接配置（使用独立的 key）
    await Promise.all([
      apiManager.systemconfigApi.UpdateConfigByKey('ImServiceTutorialUrl', {
        ConfigValue: tutorialLinks.ImServiceTutorialUrl,
        Description: 'IM客服使用教程连接',
      }),
      apiManager.systemconfigApi.UpdateConfigByKey('ShopPushTutorialUrl', {
        ConfigValue: tutorialLinks.ShopPushTutorialUrl,
        Description: '门店推送使用教程连接',
      }),
    ])

    ElMessage.success('保存成功')
    await loadConfig()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleInitDefault = async () => {
  initLoading.value = true
  await apiManager.systemconfigApi.InitDefaultConfigs().finally(() => {
    initLoading.value = false
  })
  const refreshed = await systemConfigStore.ensureConfig(true)
  applyConfig(refreshed)
  ElMessage.success('已初始化为默认配置')
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.system-config {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .title {
      font-size: 16px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 8px;
    }
  }

  .tip {
    margin-bottom: 14px;
  }

  .config-form {
    max-width: 720px;
  }
}
</style>