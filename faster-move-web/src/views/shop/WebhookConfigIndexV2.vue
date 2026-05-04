<template>
  <div class="webhook-config-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>授权异常推送配置</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加 Webhook</el-button>
        </div>
      </template>

      <!-- 配置列表 -->
      <el-table v-loading="loading" :data="webhookList" style="width: 100%">
        <el-table-column prop="WebhookTypeName" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.WebhookType) as any">{{ row.WebhookTypeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Remark" label="备注名称" width="180" />
        <el-table-column prop="WebhookUrl" label="Webhook URL" show-overflow-tooltip />
        <el-table-column prop="Enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.Enabled" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="AddTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.AddTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleTest(row)">测试</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!loading && webhookList.length === 0" description="暂无配置，点击上方按钮添加">
        <el-button type="primary" @click="handleAdd">立即添加</el-button>
      </el-empty>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-form-item label="机器人类型" prop="webhookType">
          <el-select
            v-model="formData.webhookType"
            placeholder="请选择机器人类型"
            style="width: 100%"
            @change="handleTypeChange"
          >
            <el-option v-for="type in webhookTypes" :key="type.type" :label="type.name" :value="type.type" />
          </el-select>
        </el-form-item>

        <el-form-item label="Webhook URL" prop="webhookUrl">
          <el-input v-model="formData.webhookUrl" placeholder="请输入Webhook URL" clearable />
        </el-form-item>

        <!-- 帮助提示 -->
        <el-form-item v-if="formData.webhookType" label="">
          <el-alert :title="getWebhookTypeDesc" type="info" :closable="false" show-icon>
            <template #default>
              <p>{{ getWebhookTip }}</p>
              <el-link v-if="selectedTypeHelpUrl" :href="selectedTypeHelpUrl" target="_blank" type="primary">
                查看配置文档
              </el-link>
            </template>
          </el-alert>
        </el-form-item>

        <el-form-item label="备注名称" prop="remark">
          <el-input
            v-model="formData.remark"
            placeholder="请输入备注名称，如：技术运维群"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { WebhookConfigVo } from '@/TsModel/Alien/Controllers/Admin/WebhookConfigVo'
import { AddWebhookInput } from '@/TsModel/Alien/Controllers/Admin/AddWebhookInput'
import { UpdateWebhookInput } from '@/TsModel/Alien/Controllers/Admin/UpdateWebhookInput'
import { ToggleWebhookInput } from '@/TsModel/Alien/Controllers/Admin/ToggleWebhookInput'
import { TestWebhookInput } from '@/TsModel/Alien/Controllers/Admin/TestWebhookInput'

defineOptions({
  name: 'WebhookConfigIndex'
})

// 状态
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加 Webhook')
const isEdit = ref(false)

// 数据
const webhookList = ref<WebhookConfigVo[]>([])
const formRef = ref<FormInstance>()

// Webhook类型选项（硬编码，参考ChatType）
const webhookTypes = ref([
  {
    type: 4,
    name: '企业微信群机器人',
    description: '通过企业微信群机器人接收通知',
    helpUrl: 'https://developer.work.weixin.qq.com/document/path/91770'
  },
  {
    type: 5,
    name: '钉钉群机器人',
    description: '通过钉钉群机器人接收通知',
    helpUrl: 'https://open.dingtalk.com/document/dingstart/custom-bot-creation-and-installation'
  },
  {
    type: 6,
    name: '飞书群机器人',
    description: '通过飞书群机器人接收通知',
    helpUrl: 'https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot'
  }
])

// 表单数据
const formData = reactive({
  id: '',
  webhookType: undefined as number | undefined,
  webhookUrl: '',
  remark: '' as string | undefined
})

// 表单验证规则
const formRules: FormRules = {
  webhookType: [{ required: true, message: '请选择 Webhook 类型', trigger: 'change' }],
  webhookUrl: [
    { required: true, message: '请输入 Webhook URL', trigger: 'blur' },
    { max: 500, message: 'URL 长度不能超过 500 个字符', trigger: 'blur' }
  ],
  remark: [{ max: 100, message: '备注长度不能超过 100 个字符', trigger: 'blur' }]
}

// 计算属性：获取选中类型的帮助文档URL
const selectedTypeHelpUrl = computed(() => {
  if (!formData.webhookType) return ''
  const type = webhookTypes.value.find(t => t.type === formData.webhookType)
  return type?.helpUrl || ''
})

// 获取 Webhook 类型描述
const getWebhookTypeDesc = computed(() => {
  const type = webhookTypes.value.find(t => t.type === formData.webhookType)
  return type?.name || ''
})

// 获取 Webhook 提示
const getWebhookTip = computed(() => {
  switch (formData.webhookType) {
    case 4: // 企业微信
      return '请在企业微信群中添加机器人，并复制Webhook地址'
    case 5: // 钉钉
      return '请在钉钉群中添加自定义机器人，并复制Webhook地址'
    case 6: // 飞书
      return '请在飞书群中添加自定义机器人，并复制Webhook地址'
    default:
      return '请在相应平台的群聊中添加机器人，并复制Webhook地址'
  }
})

// 处理类型变化
const handleTypeChange = () => {
  // 类型改变时清空URL
  if (!isEdit.value) {
    formData.webhookUrl = ''
  }
}

// 获取类型标签样式
const getTypeTagType = (type: number) => {
  const typeMap: Record<number, 'success' | 'primary' | 'warning' | 'info'> = {
    4: 'success', // 企业微信
    5: 'primary', // 钉钉
    6: 'warning' // 飞书
  }
  return typeMap[type] || 'info'
}

// 格式化时间
const formatTime = (time: string): string => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 获取 Webhook 列表
const getWebhookList = async () => {
  loading.value = true
  try {
    webhookList.value = await apiManager.webhookConfigApi.GetMyWebhooks()
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加 Webhook'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: WebhookConfigVo) => {
  isEdit.value = true
  dialogTitle.value = '编辑 Webhook'
  formData.id = row.Id || ''
  formData.webhookType = row.WebhookType
  formData.webhookUrl = row.WebhookUrl || ''
  formData.remark = row.Remark || ''
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: WebhookConfigVo) => {
  ElMessageBox.confirm(`确定要删除 "${row.Remark || row.WebhookTypeName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await apiManager.webhookConfigApi.DeleteWebhook(row.Id)
        ElMessage.success('删除成功')
        getWebhookList()
      } catch (error: any) {
        ElMessage.error(error.message || '删除失败')
      }
    })
    .catch(() => {
      // 取消删除
    })
}

// 启用/禁用
const handleToggle = async (row: WebhookConfigVo) => {
  try {
    const input: ToggleWebhookInput = {
      Id: row.Id,
      Enabled: row.Enabled
    }
    await apiManager.webhookConfigApi.ToggleWebhook(input)
    ElMessage.success(row.Enabled ? '已启用' : '已禁用')
  } catch (error: any) {
    // 恢复开关状态
    row.Enabled = !row.Enabled
    ElMessage.error(error.message || '操作失败')
  }
}

// 测试
const handleTest = async (row: WebhookConfigVo) => {
  try {
    const input: TestWebhookInput = {
      Id: row.Id
    }
    const result = await apiManager.webhookConfigApi.TestWebhook(input)
    if (result.Success) {
      ElMessage.success(result.Message || '测试成功！消息已发送到您的群聊')
    } else {
      ElMessage.warning(result.Message || '测试失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '测试失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        // 编辑
        const input: UpdateWebhookInput = {
          Id: formData.id,
          WebhookType: formData.webhookType!,
          WebhookUrl: formData.webhookUrl,
          Remark: formData.remark
        }
        await apiManager.webhookConfigApi.UpdateWebhook(input)
        ElMessage.success('更新成功')
      } else {
        // 添加
        const input: AddWebhookInput = {
          WebhookType: formData.webhookType!,
          WebhookUrl: formData.webhookUrl,
          Remark: formData.remark
        }
        await apiManager.webhookConfigApi.AddWebhook(input)
        ElMessage.success('添加成功')
      }

      dialogVisible.value = false
      getWebhookList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = ''
  formData.webhookType = undefined
  formData.webhookUrl = ''
  formData.remark = ''
  formRef.value?.clearValidate()
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 初始化
onMounted(() => {
  getWebhookList()
})
</script>

<style lang="scss" scoped>
.webhook-config-container {
  padding: 20px;

  .box-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  :deep(.el-table) {
    margin-top: 20px;
  }

  :deep(.el-empty) {
    padding: 40px 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-alert__content) {
  p {
    margin: 8px 0;
    line-height: 1.6;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-link {
    margin-top: 8px;
  }
}
</style>
