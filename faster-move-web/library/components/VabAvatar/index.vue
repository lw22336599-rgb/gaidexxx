<template>
  <el-popover v-model:visible="visible" class="vab-avatar" popper-class="vab-avatar-popper" width="188"
    @hide="handleShow" @show="handleHide">
    <template #reference>
      <div class="avatar-dropdown">
        <el-avatar class="user-avatar" :src="avatar" />
        <div class="username">
          <span class="hidden-xs-only" :class="{ 'blur-text': demoMode }">{{ username }}</span>
          <vab-icon class="vab-dropdown" :class="{ 'vab-dropdown-active': active }" icon="arrow-down-s-line" />
        </div>
      </div>
    </template>
    <template #default>
      <div class="avatar-dropdown" @click="handleCommand('personalCenter')">
        <el-avatar class="user-avatar" :src="avatar" />
        <div class="username">
          <div :class="{ 'blur-text': demoMode }">{{ username }}</div>
          <div class="personal-center">
            <el-text size="small" type="info">个人中心</el-text>
          </div>
        </div>
      </div>
      <el-divider />
      <ul class="el-dropdown-menu">
        <li class="el-dropdown-menu__item" @click="handleCommand('changeLog')">
          <vab-icon icon="file-word-line" />
          <span>{{ translate('更新日志') }}</span>
          <!--          <el-tag effect="dark" size="small" type="danger">99+</el-tag>-->
        </li>
        <li class="el-dropdown-menu__item" @click="handleCommand('openurl')">
          <vab-icon icon="download-cloud-fill" />
          <span>软件下载</span>
        </li>
        <li class="el-dropdown-menu__item" @click="handleCommand('book')">
          <vab-icon icon="vip-crown-2-line" />
          <span>商务洽谈</span>
        </li>
        <li class="el-dropdown-menu__item" @click="handleCommand('resetToken')">
          <vab-icon icon="lock-password-line" />
          <span>重置令牌</span>
        </li>
        <li class="el-dropdown-menu__item" @click="handleCommand('clearShopCache')">
          <vab-icon icon="delete-bin-line" />
          <span>清空店铺缓存</span>
        </li>

        <!--        <li class="el-dropdown-menu__item" @click="handleCommand('dataScreen')">-->
        <!--          <vab-icon icon="database-2-line" />-->
        <!--          <span>{{ translate('数据大屏') }}</span>-->
        <!--        </li>-->
        <!--        <li class="el-dropdown-menu__item" @click="handleCommand('portal')">-->
        <!--          <vab-icon icon="building-line" />-->
        <!--          <span>{{ translate('门户') }}</span>-->
        <!--        </li>-->
        <!--        <li class="el-dropdown-menu__item" @click="handleCommand('book')">-->
        <!--          <vab-icon icon="book-2-line" />-->
        <!--          <span>{{ translate('文档') }}</span>-->
        <!--        </li>-->
        <li class="el-dropdown-menu__item" @click="handleCommand('logout')">
          <vab-icon icon="logout-circle-r-line" />
          <span>{{ translate('退出登录') }}</span>
        </li>
      </ul>
    </template>
  </el-popover>
  <el-dialog v-model="userDialogState" :before-close="cancelUserDialog" title="个人信息" width="800">
    <div class="msg-container">
      <div class="msg-main">
        <div class="msg-left">
          <el-avatar :size="100" src="/@/assets/home_images/zdblogo.png" />
        </div>
        <div class="msg-right">
          <div class="msg-item">
            <div class="msg-item-title">密码</div>
            <div class="msg-item-main">{{ userInfo.admin.password }}<el-icon class="edit-psw" size="18"
                @click="openDialog">
                <edit />
              </el-icon></div>
          </div>
          <div class="msg-item msg-item-half">
            <div class="msg-item-title">手机号</div>
            <div class="msg-item-main">{{ userInfo.admin.phone }}</div>
          </div>
          <div class="msg-item msg-item-half">
            <div class="msg-item-title">剩余积分</div>
            <div class="msg-item-main">{{ formatBalance(userInfo.admin.balance) }}</div>
          </div>
          <div class="msg-item msg-item-half">
            <div class="msg-item-title">邀请码</div>
            <div class="msg-item-main">{{ userInfo.admin.code }}</div>
          </div>
          <div class="msg-item msg-item-half">
            <div class="msg-item-title">注册时间</div>
            <div class="msg-item-main">{{ userInfo.admin.crtim }}</div>
          </div>
          <div class="msg-item msg-item-half">
            <div class="msg-item-title">账号ID</div>
            <div class="msg-item-main">{{ userInfo.admin.code }}</div>
          </div>
          <div class="msg-item msg-item-half">
            <div class="msg-item-title">上次登录时间</div>
            <div class="msg-item-main">{{ userInfo.admin.uptim }}</div>
          </div>
        </div>
      </div>
      <div class="tipcon">
        <div>
          <span style="color: #666666;">登录IP：</span><span style="color: #333333;">{{ userInfo.admin.login_ip }}</span>
        </div>
        <div>
          <span style="color: #666666;">归属上级：</span><span style="color: #333333;">{{ userInfo.admin.parent_name ||
            'admin' }}</span>
        </div>
      </div>
      <div class="shoplist">
        <template v-for="(shop, index) in userInfo.count_shop_type" :key="index">
          <div class="shopnumiten">
            <div>{{ shop.ShopCount }}</div>
            <div>{{ shop.Title }}</div>
          </div>
        </template>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="dialogState" :before-close="cancelDialog" title="修改密码" width="600">
    <el-form ref="formRef" label-position="left" label-width="80" :model="form" :rules="rules" @submit.prevent>
      <el-form-item label="账号" prop="phone">
        <el-input v-model.trim="form.phone" clearable disabled maxlength="11" show-word-limit type="text">
          <template #prefix>
            <vab-icon icon="smartphone-line" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="密码" prop="p">
        <el-input v-model.trim="form.p" clearable :placeholder="translate('请输入新密码')" type="password">
          <template #prefix>
            <vab-icon icon="lock-line" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="p1">
        <el-input v-model.trim="form.p1" clearable :placeholder="translate('请确认新密码')" type="password">
          <template #prefix>
            <vab-icon icon="lock-line" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="phone_code" style="position: relative">
        <el-input v-model.trim="form.phone_code" :placeholder="translate('请输入手机验证码')" type="text">
          <template #prefix>
            <vab-icon icon="barcode-box-line" />
          </template>
        </el-input>
        <el-button class="phone-code" :disabled="isGetPhone" type="primary" @click="getPhoneCode">
          {{ translate(phoneCode) }}
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button :loading="loading" type="primary" @click="handleRegister">确认修改</el-button>
      </div>
    </template>
  </el-dialog>
  <el-drawer v-model="drawer" :direction="direction" title="更新记录">
    <div class="log-container">
      <div class="log-main">
        <div v-for="item in tableData" :key="item.id" class="log-item">
          <div class="item-title">{{ item.name }}</div>
          <div class="item-main" v-html='item.content'></div>
          <div class="item-time">{{ item.crtim }}</div>
        </div>
      </div>
      <vab-pagination :current-page="queryForm.pageindex" :page-size="queryForm.pagesize" :total="total"
        @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { translate } from '/@/i18n'
import { useSystemConfigStore } from '/@/store/modules/systemConfig'
import { useUserStore } from '/@/store/modules/user'
import { useSettingsStore } from '/@/store/modules/settings'
import { toLoginRoute } from '/@/utils/routes'
import { Edit } from '@element-plus/icons-vue'
import { isPassword, isPhone } from '/@/utils/validate.ts'
import type { DrawerProps, FormInstance, FormRules } from 'element-plus'
import { getUserBaseInfo, password } from '/@/api/user.ts'
import { gp } from '/@vab/plugins/vab.ts'
import { getListOrderByCtime } from '/@/api/feedback.ts'
import avatar from '/@/assets/home_images/zdblogo.png'
import { ElMessageBox, ElLoading } from 'element-plus'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import type { ResetGoogleAuthenticatorVo } from '/@/TsModel/Alien/Controllers/Admin/ResetGoogleAuthenticatorVo'

defineOptions({
  name: 'VabAvatar',
})

const drawer = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { username } = storeToRefs(userStore)
const { logout } = userStore
const systemConfigStore = useSystemConfigStore()
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)
const active = ref<boolean>(false)
const userDialogState = ref(false)
const visible = ref<boolean>(false)
const userInfoStr = localStorage.getItem('userInfo') as string
const userInfo = JSON.parse(userInfoStr)
const downloadUrl = computed(() => systemConfigStore.getDownloadUrl)
const businessContact = computed(() => systemConfigStore.getBusinessContact)
onMounted(() => {
  systemConfigStore.ensureConfig()
})

const cancelUserDialog = () => {
  userDialogState.value = false
}

const handleShow = () => {
  active.value = false
}

const handleHide = () => {
  active.value = true
}

const formatBalance = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  // 如果是整数，不显示小数位
  if (Number.isInteger(num)) {
    return num.toString()
  }
  // 否则保留一位小数
  return num.toFixed(1)
}

/**
 * 重置当前用户的谷歌验证码令牌
 * 清除当前用户的谷歌验证码密钥和启用状态，用户需要重新绑定
 */
const handleResetToken = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置您的谷歌验证码令牌吗？重置后您需要重新绑定谷歌验证器。',
      '重置令牌确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 获取当前用户ID
    const currentUserId = userInfo?.admin?.id
    if (!currentUserId) {
      throw new Error('无法获取当前用户信息')
    }

    const vo: ResetGoogleAuthenticatorVo = {
      UserId: currentUserId,
    }

    await apiManager.adminApi.ResetGoogleAuthenticator(vo)
    gp.$baseMessage('令牌重置成功，您需要重新绑定谷歌验证器', 'success', 'hey')
  } catch (error: any) {
    // 如果是用户取消操作，error 会是字符串 'cancel'，不需要提示
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '重置令牌失败', 'error', 'hey')
    }
  }
}

/**
 * 清空所有店铺的浏览器缓存
 */
const handleClearShopCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有店铺的浏览器缓存吗？清空后已打开的店铺窗口可能需要重新加载。',
      '清空缓存确认',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const electron = (globalThis as any).electron
    if (electron && typeof electron.clearAllShopCache === 'function') {
      // 显示进度条
      const loading = ElLoading.service({
        lock: true,
        text: '正在清空缓存...',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      let progressText = '正在清空缓存...'

      // 监听进度更新
      const unsubscribe = electron.onClearCacheProgress?.((data: any) => {
        if (data && data.total) {
          const percentage = Math.round((data.current / data.total) * 100)
          progressText = `正在清空缓存... (${data.current}/${data.total}) ${percentage}%`
          loading.setText(progressText)
        }
      })

      try {
        const result = await electron.clearAllShopCache()
        loading.setText(`清空完成：${result.message || '缓存清空成功'}`)
        setTimeout(() => {
          loading.close()
          gp.$baseMessage(result.message || '缓存清空成功', 'success', 'hey')
        }, 500)
      } catch (error: any) {
        loading.close()
        gp.$baseMessage(error?.message || '清空缓存失败', 'error', 'hey')
      } finally {
        // 取消监听
        if (unsubscribe) {
          unsubscribe()
        }
      }
    } else {
      gp.$baseMessage('当前环境不支持清空缓存功能', 'warning', 'hey')
    }
  } catch (error: any) {
    // 如果是用户取消操作，error 会是字符串 'cancel'，不需要提示
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '清空缓存失败', 'error', 'hey')
    }
  }
}

const handleCommand = async (command: any) => {
  switch (command) {
    case 'logout': {
      await logout()
      await router.push(toLoginRoute(route.fullPath))
      visible.value = false
      break
    }
    case 'personalCenter': {

      var baseInfo = await getUserBaseInfo();

      userInfo.admin = baseInfo.data
      console.log(baseInfo)
      userDialogState.value = true
      visible.value = false
      break
    }
    case 'changeLog': {
      getUpdate()
      visible.value = false
      break
    }
    case 'portal': {
      await window.open('#/portal')
      visible.value = false
      break
    }
    case 'dataScreen': {
      await window.open('#/dataScreen')
      visible.value = false
      break
    }
    case 'openurl': {
      const url = downloadUrl.value
      if (!url) throw new Error('未配置软件下载地址')
      if (globalThis.electron && typeof globalThis.electron.opennewurl === 'function') {
        globalThis.electron.opennewurl(url, '软件下载')
      } else {
        window.open(url, '_blank')
      }
      visible.value = false
      break;
    }
    case 'book': {
      const contact = businessContact.value
      if (!contact) throw new Error('未配置商务洽谈联系方式')
      const isUrl = contact.startsWith('http')
      if (isUrl) window.open(contact, '_blank')
      else $baseAlert(contact)
      visible.value = false
      break
    }
    case 'resetToken': {
      await handleResetToken()
      visible.value = false
      break
    }
    case 'clearShopCache': {
      await handleClearShopCache()
      visible.value = false
      break
    }
  }
}

const tableData = ref([])
const total = ref(0)
const handleSizeChange = (value: number) => {
  queryForm.pageindex = 1
  queryForm.pagesize = value
  getUpdate()
}

const handleCurrentChange = (value: number) => {
  queryForm.pageindex = value
  getUpdate()
}
const queryForm = reactive({
  pagesize: 20,
  pageindex: 1,
  type: 2,
  state: 0
})
const getUpdate = () => {
  getListOrderByCtime(queryForm).then(res => {
    if (res.code === 200) {
      tableData.value = res.data.rows.map(item => {
        item.content = item.content.replaceAll('\n', '<br>')
        return item;
      })
      total.value = res.data.total
      drawer.value = true
    }
  })
}

interface FormType {
  phone: string
  p: string
  p1: string
  phone_code?: string
}
const dialogState = ref(false)
const isGetPhone = ref<boolean>(false)
const form = reactive<FormType>({
  phone: userInfo.admin.phone,
  p: '',
  p1: '',
  phone_code: '',
})
const validatePassword = (rule: any, value: any, callback: any) => {
  if (isPassword(value)) {
    callback()
  } else {
    callback(new Error(translate('密码不能少于6位')))
  }
}

const validateAgainPassword = (rule: any, value: any, callback: any) => {
  if (isPassword(value)) {
    callback()
  } else if (value === form.p) {
    callback(new Error(translate('密码不能少于6位')))
  } else {
    callback(new Error('两次密码输入不一致'))
  }
}
const validatePhone = (rule: any, value: any, callback: any) => {
  if (isPhone(value)) {
    callback()
  } else {
    callback(new Error(translate('请输入正确的手机号')))
  }
}
const rules = reactive<FormRules<FormType>>({
  phone: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机号'),
    },
    { validator: validatePhone, trigger: 'blur' },
  ],
  p: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入新密码'),
    },
    { validator: validatePassword, trigger: 'blur' },
  ],
  p1: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请确认新密码'),
    },
    { validator: validateAgainPassword, trigger: 'blur' },
  ],
  phone_code: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机验证码'),
    },
  ],
})
const openDialog = () => {
  dialogState.value = true
}
const cancelDialog = () => {
  formRef.value?.resetFields()
  dialogState.value = false
}
const formRef = ref<FormInstance>()
const loading = ref<boolean>(false)
let timer: ReturnType<typeof setInterval>
const phoneCode = ref<any>(translate('获取验证码'))
const getPhoneCode = async () => {
  if (!isPhone(form?.phone)) {
    formRef.value?.validateField('phone')
    return
  }
  try {
    const { phone, p, p1 } = form
    await password({ phone, p, p1 }).then((res: any) => {
      if (res.data.ResultType === 4) {
        startGetPhoneCodeTimer()
        gp.$baseMessage('验证码发送成功', 'success', 'hey')
      }
    })
  } finally {
    loading.value = false
  }
}
const startGetPhoneCodeTimer = () => {
  isGetPhone.value = true;
  let n = 60;
  // 清除可能存在的旧定时器
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    console.log(phoneCode.value);
    if (n > 0) {
      n--;
      phoneCode.value = `${translate('获取验证码 ') + n}s`;
    } else {
      stopGetPhoneCodeTimer()
      isGetPhone.value = false;
    }
  }, 1000);
};
const stopGetPhoneCodeTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null; // 确保清除后将 timer 设置为 null
  }
  phoneCode.value = translate('获取验证码');
  isGetPhone.value = false;
};
const handleRegister = () => {
  formRef.value?.validate(async (valid: any) => {
    if (valid) {
      loading.value = true
      const { phone, p, p1, phone_code } = form
      await password({ phone, p, p1, phone_code }).then((res: any) => {
        if (res.code === 200 && (res.data.ResultType === 5 || res.data.ResultType === 0)) {
          gp.$baseMessage('修改成功', 'success', 'hey')
        }
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.avatar-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;

  .user-avatar {
    position: relative;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    padding: 8px;
    margin-left: 15px;
    cursor: pointer;
    border-radius: 50%;

    &::after {
      position: absolute;
      right: 3px;
      bottom: 3px;
      width: 7px;
      height: 7px;
      content: '';
      background: var(--el-color-success);
      border: 3px solid var(--el-color-white);
      border-radius: 50%;
    }
  }

  .username {
    position: relative;
    display: flex;
    align-content: center;
    align-items: center;
    width: max-content;
    height: 40px;
    margin-left: 6px;
    line-height: 40px;
    cursor: pointer;

    [class*='ri-'] {
      margin-left: 0 !important;
    }
  }
}

.msg-container {
  padding-bottom: 20px;

  .msg-main {
    display: flex;
    align-items: flex-start;

    .msg-left {
      margin-right: 20px;
    }

    .msg-right {
      width: calc(100% - 120px);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: space-between;

      .msg-item {
        width: 100%;
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .msg-item-title {
          width: 100px;
          line-height: 32px;
        }

        .msg-item-main {
          width: calc(100% - 100px);
          height: 34px;
          border-radius: 6px;
          border: 1px solid #DFDFDF;
          padding: 0 12px;
          box-sizing: border-box;
          color: #333333;
          font-size: 14px;
          line-height: 34px;
          display: flex;
          align-items: center;

          .edit-psw {
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }

      .msg-item-half {
        width: 48%;
      }
    }
  }
}

.phone-code {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.tipcon {
  width: 100%;
  height: 50px;
  background: #F8F8FC;
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-top: 10px;

  >div {
    flex: 1;
    height: 28px;
    line-height: 28px;
    text-align: center;
  }
}

.shoplist {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;

  .shopnumiten {
    width: 170px;
    height: 84px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 25px;
    margin-right: 10px;
    margin-bottom: 20px;
    color: #333333;
  }

  .shopnumiten:nth-of-type(1) {
    background-image: url('/@/assets/home_images/shop1.png');
  }

  .shopnumiten:nth-of-type(2) {
    background-image: url('/@/assets/home_images/shop2.png');
  }

  .shopnumiten:nth-of-type(3) {
    background-image: url('/@/assets/home_images/shop3.png');
  }

  .shopnumiten:nth-of-type(3) {
    background-image: url('/@/assets/home_images/shop4.png');
  }

  .shopnumiten:nth-of-type(4) {
    background-image: url('/@/assets/home_images/shop5.png');
  }

  .shopnumiten:nth-of-type(5) {
    background-image: url('/@/assets/home_images/shop6.png');
  }

  .shopnumiten:nth-of-type(6) {
    background-image: url('/@/assets/home_images/shop7.png');
  }

  .shopnumiten:nth-of-type(7) {
    background-image: url('/@/assets/home_images/shop1.png');
  }
}
</style>
<style lang="scss">
.vab-avatar-popper {
  padding: 0 !important;

  .avatar-dropdown {
    display: flex;
    flex: 1;
    justify-content: start !important;
    padding: calc(var(--el-padding) / 1.5);

    .user-avatar {
      margin-left: calc(var(--el-margin) / 2) calc(var(--el-margin) / 2) calc(var(--el-margin) / 2) 0 !important;
    }

    .username {
      display: flex;
      flex-wrap: wrap;
      line-height: 20px;

      .personal-center {
        width: 100%;
        font-size: var(--el-font-size-small);
        color: var(--el-color-grey);
      }
    }
  }

  .el-dropdown-menu {
    position: relative;
    padding: calc(var(--el-padding) / 2);

    &__item {
      .el-tag {
        position: absolute;
        right: 17.5px;
      }
    }

    &__item:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      border-radius: var(--el-border-radius-base);
    }
  }

  .el-divider--horizontal {
    margin: 0;
  }
}

.log-container {
  .log-main {
    height: calc(100vh - 200px);

    .log-item {
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #DFDFDF;

      .item-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .item-main {
        font-size: 14px;
        margin-bottom: 10px;
      }

      .item-time {
        font-size: 12px;
        text-align: right;
      }
    }
  }
}

.blur-text {
  filter: blur(4px);
  user-select: none;
}
</style>