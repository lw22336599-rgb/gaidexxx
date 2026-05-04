<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加机器人"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="机器人类型">
        <el-select v-model="form.chatType" placeholder="请选择机器人类型" @change="handleChatTypeChange">
          <el-option
            v-for="option in chatTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <!-- WechatPc 类型 -->
      <template v-if="form.chatType === ChatType.WechatPc">
        <el-form-item label="">
          <el-alert title="微信PC版机器人" type="info" :closable="false" show-icon>
            <template #default>
              <p>点击下方"连接微信"按钮，系统将自动启动微信客户端。</p>
              <p>请使用手机微信扫码登录，登录成功后即可使用。</p>
            </template>
          </el-alert>
        </el-form-item>
      </template>

      <!-- Webhook 类型 -->
      <template v-else-if="isWebhookType">
        <el-form-item label="Webhook URL">
          <el-input v-model="form.webhookUrl" placeholder="请输入Webhook URL" clearable />
        </el-form-item>

        <el-form-item label="">
          <el-alert :title="getWebhookTypeDesc" type="info" :closable="false" show-icon>
            <template #default>
              <p>{{ getWebhookTip }}</p>
              <el-link v-if="getWebhookDocUrl" :href="getWebhookDocUrl" target="_blank" type="primary">
                查看配置文档
              </el-link>
            </template>
          </el-alert>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="form.chatType === ChatType.WechatPc"
          type="primary"
          :loading="connecting"
          @click="handleConnectWechat"
        >
          连接微信
        </el-button>
        <el-button
          v-else-if="isWebhookType"
          type="primary"
          :disabled="!form.webhookUrl"
          :loading="saving"
          @click="handleSaveWebhook"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 连接进度对话框 -->
  <ConnectProgressDialog
    v-model:visible="progressDialogVisible"
    @cancel="handleCancelConnect"
    @retry="handleRetryConnect"
    @complete="handleConnectComplete"
    @confirm-login="handleConfirmLogin"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { useWechatRobotStore } from '@/store/modules/wechatRobot'
import { useUserStore } from '@/store/modules/user'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { md5 } from '@/utils/md5'
import ConnectProgressDialog from './ConnectProgressDialog.vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', robot: t_chat_push_list): void
  (e: 'connect', chatType: ChatType): void
  (e: 'cancel'): void
  (e: 'confirm-login'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const wechatRobotStore = useWechatRobotStore()
const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})

// 表单数据
const form = ref({
  chatType: ChatType.WechatPc,
  webhookUrl: ''
})

// 状态
const connecting = ref(false)
const saving = ref(false)
const progressDialogVisible = ref(false)

// ChatType 选项
const chatTypeOptions = [
  { label: '微信PC版', value: ChatType.WechatPc },
  { label: '企业微信群机器人', value: ChatType.WechatWebHook },
  { label: '钉钉群机器人', value: ChatType.DingdingWebHook },
  { label: '飞书群机器人', value: ChatType.FeishuWebHook }
]

// 是否是 Webhook 类型
const isWebhookType = computed(() => {
  return [ChatType.WechatWebHook, ChatType.DingdingWebHook, ChatType.FeishuWebHook].includes(form.value.chatType)
})

// 获取 Webhook 类型描述
const getWebhookTypeDesc = computed(() => {
  switch (form.value.chatType) {
    case ChatType.WechatWebHook:
      return '企业微信群机器人'
    case ChatType.DingdingWebHook:
      return '钉钉群机器人'
    case ChatType.FeishuWebHook:
      return '飞书群机器人'
    default:
      return ''
  }
})

// 获取 Webhook 提示
const getWebhookTip = computed(() => {
  switch (form.value.chatType) {
    case ChatType.WechatWebHook:
      return '请在企业微信群中添加机器人，并复制Webhook地址'
    case ChatType.DingdingWebHook:
      return '请在钉钉群中添加机器人，并复制Webhook地址'
    case ChatType.FeishuWebHook:
      return '请在飞书群中添加机器人，并复制Webhook地址'
    default:
      return ''
  }
})

// 获取 Webhook 文档链接
const getWebhookDocUrl = computed(() => {
  switch (form.value.chatType) {
    case ChatType.WechatWebHook:
      return 'https://cloud.tencent.com/document/product/1263/71731#webhook'
    case ChatType.DingdingWebHook:
      return 'https://open.dingtalk.com/document/dingstart/custom-bot-creation-and-installation'
    case ChatType.FeishuWebHook:
      return 'https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot'
    default:
      return ''
  }
})

// 处理 ChatType 变化
const handleChatTypeChange = () => {
  form.value.webhookUrl = ''
}

// 处理连接微信
const handleConnectWechat = async () => {
  try {
    connecting.value = true
    progressDialogVisible.value = true

    // 触发连接事件，由父组件处理实际的连接逻辑
    emit('connect', form.value.chatType)
  } catch (error) {
    console.error('连接微信失败:', error)
    ElMessage.error('连接微信失败')
  } finally {
    connecting.value = false
  }
}

// 获取 Webhook 类型的名称
const getWebhookTypeName = (chatType: ChatType): string => {
  switch (chatType) {
    case ChatType.WechatWebHook:
      return '企业微信群机器人'
    case ChatType.DingdingWebHook:
      return '钉钉群机器人'
    case ChatType.FeishuWebHook:
      return '飞书群机器人'
    default:
      return 'Webhook机器人'
  }
}

// 处理保存 Webhook
const handleSaveWebhook = async () => {
  if (!form.value.webhookUrl) {
    ElMessage.warning('请输入Webhook URL')
    return
  }

  try {
    saving.value = true

    // 将 URL 编码成 MD5 作为 offid
    const offid = md5(form.value.webhookUrl)

    // 构造机器人数据
    const robotData: t_chat_push_list = {
      id: '', // 新建时为空，后端会自动生成
      admin: userStore.username || userStore.userId || '', // 当前用户
      chat_type: form.value.chatType,
      host: form.value.webhookUrl, // Webhook URL 存储在 host 字段
      head_img: '', // Webhook 类型没有头像
      name: getWebhookTypeName(form.value.chatType), // 使用类型名称
      offid: offid, // URL 的 MD5 作为 offid
      on_line: true, // Webhook 类型默认在线
      key: '', // 后端会生成
      MannagerOffIds: [],
      OtherValues: {
        mobile: '',
        account: '',
        city: '',
        country: '',
        province: '',
        signature: ''
      },
      avtag: true, // 可用状态
      notes: `${getWebhookTypeName(form.value.chatType)} - ${form.value.webhookUrl}`, // 备注
      ExTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 过期时间：1年后
      crtim: new Date(), // 创建时间
      uptim: new Date() // 更新时间
    }

    // 调用 API 保存
    const robot = await apiManager.chatMgApi.UpdateChatInfo(robotData)

    // 添加到 store
    wechatRobotStore.addRobot(robot)

    ElMessage.success('保存成功')
    dialogVisible.value = false

    emit('success', robot)
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 处理取消连接
const handleCancelConnect = () => {
  progressDialogVisible.value = false
  connecting.value = false

  // 通知父组件取消连接
  emit('cancel')
}

// 处理重试连接
const handleRetryConnect = () => {
  handleConnectWechat()
}

// 处理连接完成
const handleConnectComplete = () => {
  progressDialogVisible.value = false
  connecting.value = false
  dialogVisible.value = false

  ElMessage.success('机器人连接成功')

  // TODO: 获取连接成功的机器人信息并触发 success 事件
  // emit('success', robot)
}

// 处理用户确认登录
const handleConfirmLogin = () => {
  // 转发事件给父组件
  emit('confirm-login')
}

// 处理关闭
const handleClose = () => {
  form.value = {
    chatType: ChatType.WechatPc,
    webhookUrl: ''
  }
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
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
}
</style>
