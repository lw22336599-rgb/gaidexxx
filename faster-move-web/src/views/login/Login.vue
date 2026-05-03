<template>
  <login-container>
    <div class="login-form">
      <img alt="" class="left-img" :src="leftImg" />
      <div class="login-form-content">
        <!-- 标题区域 -->
        <div class="title">hello !</div>
        <div class="title-tips">{{ translate('欢迎使用') }} {{ title }}</div>
        <!-- 登录方式切换标签 -->
        <el-tabs v-model="loginType" class="login-tabs" @tab-change="handleLoginTypeChange">
          <el-tab-pane label="账号密码登录" name="password">
            <el-form ref="formRef" label-position="left" :model="form" :rules="rules" @submit.prevent>
              <el-form-item prop="phone">
                <el-autocomplete v-model.trim="form.phone" clearable :placeholder="translate('请输入用户名')"
                  :fetch-suggestions="queryAccountSuggestions" :trigger-on-focus="true" @select="handleAccountSelect"
                  style="width: 100%">
                  <template #prefix>
                    <vab-icon icon="user-line" />
                  </template>
                  <template #default="{ item }">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span>{{ item.value }}</span>
                      <el-tag v-if="item.hasSecret" type="success" size="small">自动登录</el-tag>
                    </div>
                  </template>
                </el-autocomplete>
              </el-form-item>
              <el-form-item prop="pwd">
                <el-input ref="passwordRef" v-model.trim="form.pwd" clearable :placeholder="translate('请输入密码')"
                  show-password :type="passwordType">
                  <template #prefix>
                    <vab-icon icon="lock-line" />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item v-if="isBindPhone" prop="bind_phone">
                <el-input v-model.trim="form.bind_phone" clearable maxlength="11" :placeholder="translate('请绑定手机号')"
                  show-word-limit type="text">
                  <template #prefix>
                    <vab-icon icon="smartphone-line" />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item v-if="isBindPhone" prop="bind_phone_code" style="position: relative">
                <el-input v-model.trim="form.bind_phone_code" :placeholder="translate('请输入手机验证码')" type="text">
                  <template #prefix>
                    <vab-icon icon="barcode-box-line" />
                  </template>
                </el-input>

                <el-button class="phone-code" :disabled="isGetPhone" type="primary" @click="getPhoneCode">
                  {{ phoneCode }}
                </el-button>
              </el-form-item>
              <el-form-item v-if="isRequireGaCode" prop="ga_code">
                <div class="ga-code-input-wrapper">
                  <el-input v-model.trim="form.ga_code" clearable maxlength="6" :placeholder="translate('请输入令牌验证码')"
                    type="text">
                    <template #prefix>
                      <vab-icon icon="shield-check-line" />
                    </template>
                  </el-input>
                  <span class="ga-code-tip-text" @click="openGaCodeTip('login')">怎么获取验证码?</span>
                </div>
              </el-form-item>
              <div class="checkboxtip">
                <el-checkbox style="margin-left: 10px" v-model="remember" label="记住密码" size="large" />
                <el-checkbox style="margin-left: 10px" v-model="voluntarilylogin" label="自动登录" size="large" />
              </div>
              <!-- 验证码验证逻辑需自行开发，如不需要验证码功能建议注释 -->
              <!--        <el-form-item prop="verificationCode">-->
              <!--          <el-input v-model.trim="form.verificationCode" :placeholder="translate('验证码') + previewText" type="text">-->
              <!--            <template #prefix>-->
              <!--              <vab-icon icon="barcode-box-line" />-->
              <!--            </template>-->
              <!--          </el-input>-->
              <!--          <img class="code" :src="codeUrl" @click="changeCode" />-->
              <!--        </el-form-item>-->
              <el-button v-throttle="handleLogin" class="login-btn" :loading="loading" type="primary">
                {{ translate('登录') }}
              </el-button>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="令牌快捷登录" name="gaCode">
            <el-form ref="gaCodeFormRef" label-position="left" :model="gaCodeForm" :rules="gaCodeRules" @submit.prevent>
              <el-form-item prop="phone">
                <el-autocomplete v-model.trim="gaCodeForm.phone" clearable :placeholder="translate('请输入手机号或用户名')"
                  :fetch-suggestions="queryAccountSuggestions" :trigger-on-focus="true"
                  @select="handleAccountSelectForGaCode" style="width: 100%">
                  <template #prefix>
                    <vab-icon icon="smartphone-line" />
                  </template>
                  <template #default="{ item }">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span>{{ item.value }}</span>
                      <el-tag v-if="item.hasSecret" type="success" size="small">自动登录</el-tag>
                    </div>
                  </template>
                </el-autocomplete>
              </el-form-item>
              <el-form-item prop="ga_code">
                <div class="ga-code-input-wrapper">
                  <el-input v-model.trim="gaCodeForm.ga_code" clearable maxlength="6"
                    :placeholder="translate('请输入令牌验证码')" type="text">
                    <template #prefix>
                      <vab-icon icon="shield-check-line" />
                    </template>
                  </el-input>
                  <span class="ga-code-tip-text" @click="openGaCodeTip('login')">怎么获取验证码?</span>
                </div>
              </el-form-item>
              <div class="checkboxtip">
                <el-checkbox style="margin-left: 10px" v-model="remember" label="记住密码" size="large" />
                <el-checkbox style="margin-left: 10px" v-model="voluntarilylogin" label="自动登录" size="large" />
              </div>
              <el-button v-throttle="handleGaCodeLogin" class="login-btn" :loading="gaCodeLoading" type="primary">
                {{ translate('登录') }}
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <div class="flexbutton">
          <div class="flexbutton-left">
            <router-link to="/register">
              <el-button type="primary">
                {{ translate('注册') }}
              </el-button>
            </router-link>
            <el-button type="primary" @click="openChat">
              <vab-icon icon="customer-service-2-fill" /><span style="margin-left: 4px">在线客服</span>
            </el-button>
          </div>
          <router-link to="/password">
            <el-button text type="primary">
              {{ translate('忘记密码?') }}
            </el-button>
          </router-link>
        </div>

        <el-button v-if="isBindPhone" style="margin-top: 20px" text type="primary" @click="backLogin">
          返回登录
        </el-button>
        <el-button v-if="isRequireGaCode && loginType === 'password'" style="margin-top: 20px" text type="primary"
          @click="backLogin">
          返回登录
        </el-button>
        <div class="user-agreement">已阅读并同意<span @click="openUserAgreement">《极狐用户服务协议》</span></div>
        <div class="line-list">
          <el-radio-group v-model="lineRadio" class="user-agreement-radio" @change="getNewLine">
            <el-radio value="acquiesce1">默认线路</el-radio>
            <el-radio value="acquiesce2">备用线路</el-radio>
            <el-radio value="standby">国际线路</el-radio>
            <el-radio value="custom">指定线路</el-radio>
          </el-radio-group>
          <vab-icon class="edit-box-line" icon="edit-box-line" @click="openCustom" />
        </div>
      </div>

      <!--        <div v-throttle="handleLogin" class="login-other hidden-xs-only">-->
      <!--          <vab-icon icon="wechat-fill" style="color: #08c25f" />-->
      <!--          <vab-icon icon="alipay-fill" style="color: #226bf3" />-->
      <!--          <vab-icon icon="dingding-fill" style="color: #007ef8" />-->
      <!--          <vab-icon icon="qq-fill" style="color: #009dff" />-->
      <!--          <vab-icon icon="tiktok-fill" style="color: #000000" />-->
      <!--          <vab-icon icon="weibo-fill" style="color: #df1e33" />-->
      <!--          <vab-icon icon="github-fill" style="color: #151515" />-->
      <!--        </div>-->

    </div>
    <el-dialog v-if="customState" v-model="customState" align-center title="自定义接口" width="30%">
      <el-form ref="formBaseUrlRef" label-position="left" :model="baseUrl" :rules="baseUrlRules" @submit.prevent>
        <el-form-item label="默认接口地址" prop="default">
          <el-input v-model.trim="baseUrl.default" placeholder="请输入默认接口地址" type="text">
            <template #prefix>
              <vab-icon icon="link" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="搬菜接口地址" prop="move">
          <el-input v-model.trim="baseUrl.move" placeholder="请输入搬菜接口地址" type="text">
            <template #prefix>
              <vab-icon icon="link" />
            </template>
          </el-input>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeInterface">取 消</el-button>
          <el-button type="primary" @click="confirmInterface"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 令牌验证码获取提示对话框 -->
    <el-dialog v-model="showGaCodeTip" align-center :title="gaCodeTipTitle" width="600" :close-on-click-modal="true">
      <div class="ga-code-tip-content">
        <div class="ga-code-step-item">
          <div class="step-number">步骤 {{ currentStepIndex + 1 }} / {{ totalSteps }}</div>
          <!-- 图片页 -->
          <template v-if="currentStepData.type === 'image'">
            <div class="step-description">
              {{ currentStepData.description || '' }}
            </div>
            <div class="step-image-wrapper">
              <div class="nav-button nav-button-left" @click="prevStep" v-if="currentStepIndex > 0">
                <vab-icon icon="arrow-left-s-line" />
              </div>
              <img :src="currentStepData.image" :alt="`步骤 ${currentStepIndex + 1}`" class="ga-code-tip-image" />
              <div class="nav-button nav-button-right" @click="nextStep" v-if="currentStepIndex < totalSteps - 1">
                <vab-icon icon="arrow-right-s-line" />
              </div>
            </div>
          </template>
          <!-- 文本提示页 -->
          <template v-else-if="currentStepData.type === 'text'">
            <div class="step-text-wrapper">
              <h3 class="warning-title">{{ currentStepData.title }}</h3>
              <p class="warning-content">{{ currentStepData.content }}</p>
            </div>
          </template>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="step-navigation">
            <el-button :disabled="currentStepIndex === 0" @click="prevStep">上一步</el-button>
            <span class="step-info">{{ currentStepIndex + 1 }} / {{ totalSteps }}</span>
            <el-button v-if="currentStepIndex < totalSteps - 1" type="primary" @click="nextStep">下一步</el-button>
            <el-button v-else type="primary" @click="showGaCodeTip = false">我知道了</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    <!-- 令牌验证器绑定对话框 -->
    <el-dialog v-model="gaBindDialogVisible" align-center title="绑定令牌验证器" width="400px" :close-on-click-modal="false">
      <div v-if="gaQrCodeData" class="ga-bind-content">
        <div class="ga-tips">
          <p>请使用 腾讯身份验证器小程序 或其他兼容应用扫描下方二维码</p>
          <p>如果无法扫描，请手动输入密钥：<strong>{{ gaQrCodeData.Secret }}</strong></p>
        </div>
        <div class="ga-qrcode">
          <img :src="gaQrCodeImage" alt="Google Authenticator QR Code" />
        </div>
        <el-form ref="gaBindFormRef" :model="gaBindForm" :rules="gaBindRules" label-width="100px">
          <el-form-item label="验证码" prop="code">
            <div class="ga-code-input-wrapper">
              <el-input v-model.trim="gaBindForm.code" maxlength="6" placeholder="请输入 6 位验证码" />
              <span class="ga-code-tip-text" @click="openGaCodeTip('bind')">怎么获取验证码?</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelGaBind">取 消</el-button>
          <el-button type="primary" :loading="gaBindLoading" @click="confirmGaBind">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </login-container>
</template>

<script lang="ts" setup>
import { computed, nextTick } from 'vue'
import { gp } from '/@vab/plugins/vab.ts'
import type { FormInstance, FormRules, InputInstance } from 'element-plus'
import leftImg from '/@/assets/login_images/left_img_1.png'
// 导入令牌验证码教程图片
import bangdingImg1 from '/@/icon/bangding/001.png'
import bangdingImg2 from '/@/icon/bangding/002.png'
import bangdingImg3 from '/@/icon/bangding/003.png'
import bangdingImg4 from '/@/icon/bangding/004.png'
import bangdingImg5 from '/@/icon/bangding/005.png'
import bangdingImg6 from '/@/icon/bangding/006.png'
import bangdingImg7 from '/@/icon/bangding/007.png'
import { translate } from '/@/i18n'
import { useSettingsStore } from '/@/store/modules/settings'
import { useUserStore } from '/@/store/modules/user'
import { isPassword, isPhone } from '/@/utils/validate'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { updateRequestBaseUrl } from '/@/utils/request'
import { triggerApiConfigChange } from '/@/utils/apiConfig'
import type { EnableGoogleAuthenticatorRes } from '/@/TsModel/Alien/Controllers/Admin/EnableGoogleAuthenticatorRes'
import { AdmiPhoneResultType } from '/@/TsModel/Alien/Entity/AdmiPhoneResultType'
import { tokenName } from '/@/config'
import { generateTOTP } from '/@/utils/googleAuthenticator'
import { getSavedAccounts, saveAccount, getAccountByUsername, type AccountInfo } from '/@/utils/accountStorage'
// import { onBeforeRouteUpdate } from 'vue-router';
defineOptions({
  name: 'Login'
})

interface FormType {
  phone: string
  pwd: string
  bind_phone?: string
  bind_phone_code?: string
  ga_code?: string
  // verificationCode: string
}

interface GaCodeLoginFormType {
  phone: string
  ga_code: string
}

interface GaBindFormType {
  code: string
}
interface BaseType {
  default: string
  move: string
  food_manage: string,
  type: string
}
const remember = ref<boolean>(true)
const voluntarilylogin = ref<boolean>(true)
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { title } = storeToRefs(settingsStore)
const login = (form: FormType, remember: boolean, vlogin: boolean) => userStore.login(form, remember, vlogin)
const loading = ref<boolean>(false)
const passwordType = ref<string>('password')
const redirect = ref<any>(undefined)
let timer: ReturnType<typeof setInterval> | null = null
// const codeUrl = ref<string>('https://www.oschina.net/action/user/captcha')
const previewText = ref<string>('')
const formRef = ref<FormInstance>()
const formBaseUrlRef = ref<FormInstance>()
const passwordRef = ref<InputInstance>()
const phoneCode = ref<any>(translate('获取验证码'))
const isGetPhone = ref<boolean>(false)
const lineRadio = ref('acquiesce1')
const loginType = ref<string>('password')
const gaCodeFormRef = ref<FormInstance>()
const gaCodeLoading = ref<boolean>(false)

const form = reactive<FormType>({
  phone: '',
  pwd: '',
  bind_phone: '',
  bind_phone_code: '',
  ga_code: ''
  // verificationCode: '',
})

// 令牌验证码登录表单数据
const gaCodeForm = reactive<GaCodeLoginFormType>({
  phone: '',
  ga_code: ''
})

// Google Authenticator 相关状态
const isRequireGaCode = ref<boolean>(false)
const gaBindDialogVisible = ref<boolean>(false)
const gaQrCodeData = ref<EnableGoogleAuthenticatorRes | null>(null)
const gaBindLoading = ref<boolean>(false)
const gaBindFormRef = ref<FormInstance>()
const gaBindForm = reactive<GaBindFormType>({
  code: ''
})
const showGaCodeTip = ref<boolean>(false)
// 令牌验证码提示类型：'bind' 注册并绑定, 'login_bind' 已注册登录绑定, 'login' 登录
const gaCodeTipType = ref<'bind' | 'login_bind' | 'login'>('bind')
// 当前步骤索引
const currentStepIndex = ref<number>(0)

// 账号自动完成相关
const savedAccounts = ref<AccountInfo[]>([])
const autoFillingGaCode = ref<boolean>(false)

// 格式化二维码图片 URL（添加 data URI 前缀）
const gaQrCodeImage = computed(() => {
  if (!gaQrCodeData.value?.QrCodeImage) {
    return ''
  }
  const imageData = gaQrCodeData.value.QrCodeImage
  // 如果已经是 data URI 格式，直接返回
  if (imageData.startsWith('data:')) {
    return imageData
  }
  // 否则添加 data URI 前缀
  return `data:image/png;base64,${imageData}`
})

// 令牌验证码教程步骤数据
interface StepData {
  type: 'image' | 'text'
  image?: string
  description?: string
  title?: string
  content?: string
}

const gaCodeTipSteps = computed<StepData[]>(() => {
  return [
    {
      type: 'image',
      image: bangdingImg1,
      description: '打开微信'
    },
    {
      type: 'image',
      image: bangdingImg2,
      description: '打开微信小程序'
    },
    {
      type: 'image',
      image: bangdingImg3,
      description: '点击搜索小程序'
    },
    {
      type: 'image',
      image: bangdingImg4,
      description: '输入"腾讯身份验证器"，找到第一个进入'
    },
    {
      type: 'image',
      image: bangdingImg5,
      description: '点击二维码激活扫描二维码'
    },
    {
      type: 'image',
      image: bangdingImg6,
      description: '输入令牌中的6位动态验证码'
    },
    {
      type: 'image',
      image: bangdingImg7
    }
  ]
})

// 总步骤数
const totalSteps = computed(() => gaCodeTipSteps.value.length)

// 当前步骤数据
const currentStepData = computed(() => gaCodeTipSteps.value[currentStepIndex.value])

// 根据不同场景返回对应的标题
const gaCodeTipTitle = computed(() => {
  switch (gaCodeTipType.value) {
    case 'bind':
      return '如何注册并绑定令牌验证器'
    case 'login_bind':
      return '如何绑定令牌验证器'
    case 'login':
      return '如何使用令牌验证码登录'
    default:
      return '如何获取令牌验证码'
  }
})
onMounted(async () => {
  // console.log(redirect.value, 'redirect.value')

  // 加载已保存的账号列表
  savedAccounts.value = await getSavedAccounts()
  // console.log('已加载保存的账号列表:', savedAccounts.value.length, '个账号')
  savedAccounts.value.forEach(account => {
    // console.log('- 账号:', account.username, '有密钥:', !!account.gaSecret)
  })

  // 检查是否从退出登录进入
  const fromLogout = localStorage.getItem('from_logout')
  if (fromLogout === '1') {
    // console.log('检测到从退出登录进入，切换到令牌验证码登录')
    loginType.value = 'gaCode'
    localStorage.removeItem('from_logout')

    // 如果有保存的账号，稍后自动聚焦输入框以显示账号列表
    if (savedAccounts.value.length > 0) {
      nextTick(() => {
        // 由于切换了 tab，需要等待 DOM 更新后再聚焦
        setTimeout(() => {
          // 使用 gaCodeFormRef 来确保获取正确的输入框
          if (gaCodeFormRef.value) {
            const phoneInput = gaCodeFormRef.value.$el.querySelector('.el-autocomplete input') as HTMLInputElement
            if (phoneInput) {
              phoneInput.focus()
              // 触发 focus 事件以显示下拉列表
              phoneInput.dispatchEvent(new Event('focus'))
              // console.log('自动聚焦到令牌验证码登录的手机号输入框')
            }
          }
        }, 200)
      })
    }
  }

  let user = localStorage.getItem('rememberuser')
  if (user) {
    form.pwd = JSON.parse(user).pwd
    form.phone = JSON.parse(user).phone
    let filexshow = sessionStorage.getItem('filexshow')
    let vlogin = localStorage.getItem('vlogin')
    // console.log(vlogin);

    if (vlogin == '1') {
      if (form.pwd) {
        if (filexshow === '1') {
          // console.log('you');
        } else {
          // console.log('2');
          handleLogin()
        }
      }
    } else {
      // console.log('3');
    }
  }
  const urlTypeStr = localStorage.getItem('urlType')
  var urlType = urlTypeStr ? JSON.parse(urlTypeStr) : null;
  // console.log("url模式：", urlType);
  lineRadio.value = urlType ?? "acquiesce1";
  getNewLine(urlType ?? "acquiesce1");
})
// onBeforeRouteUpdate((to, from, next) => {
//       console.log('路由更新', to, from);
//       next();
// });
const baseUrl = ref<BaseType>({
  default: '',
  move: '',
  food_manage: '',
  type: ''
})

// 使用导入的 AdmiPhoneResultType 枚举

const getResultDescription = (result: AdmiPhoneResultType): string => {
  switch (result) {
    case AdmiPhoneResultType.None: {
      return 'None'
    }
    case AdmiPhoneResultType.验证码已过期: {
      return '验证码已过期'
    }
    case AdmiPhoneResultType.验证码不正确: {
      return '验证码不正确'
    }
    case AdmiPhoneResultType.请输入验证码: {
      return '请输入验证码'
    }
    case AdmiPhoneResultType.验证成功: {
      return '验证成功'
    }
    case AdmiPhoneResultType.请填写手机号: {
      return '请绑定手机号'
    }
    case AdmiPhoneResultType.需要绑定GoogleAuthenticator: {
      return '需要绑定令牌验证器'
    }
    case AdmiPhoneResultType.请输入GoogleAuthenticator验证码: {
      return '请输入令牌验证码'
    }
    default: {
      return '未知的结果类型'
    }
  }
}

const validateUsername = (rule: any, value: any, callback: any) => {
  if ('' === value) callback(new Error(translate('用户名不能为空')))
  else callback()
}
const validatePassword = (rule: any, value: any, callback: any) => {
  if (isPassword(value)) {
    callback()
  } else {
    callback(new Error(translate('密码不能少于6位')))
  }
}
const validateBindPhone = (rule: any, value: any, callback: any) => {
  if (isPhone(value)) {
    callback()
  } else {
    callback(new Error(translate('请输入正确的手机号')))
  }
}

/**
 * 验证令牌验证码登录的手机号/用户名
 * 如果是数字则验证手机号格式，如果不是数字（管理员账号）则不验证格式
 */
const validateGaCodePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(translate('请输入手机号或用户名')))
    return
  }
  // 如果输入全是数字，则验证手机号格式
  if (/^\d+$/.test(value)) {
    if (isPhone(value)) {
      callback()
    } else {
      callback(new Error(translate('请输入正确的手机号')))
    }
  } else {
    // 如果不是数字（可能是管理员账号），只验证必填，不验证格式
    callback()
  }
}
const setBaseUrl = (url: Partial<BaseType>) => {
  const fullUrl: BaseType = {
    default: url.default || '',
    move: url.move || '',
    food_manage: url.food_manage || '',
    type: url.type || ''
  }
  localStorage.setItem('baseUrl', JSON.stringify(fullUrl))

  // 立即更新所有 axios 实例的 baseURL，确保所有 API 请求都使用新线路
  if (fullUrl.default) {
    // 更新新的 apiManager
    apiManager.updateBaseUrl(fullUrl.default)
    // 更新旧的 request axios 实例
    updateRequestBaseUrl(fullUrl.default)
    // 触发 API 配置变更事件，通知 SignalR 等服务重新连接
    triggerApiConfigChange()
  }
}
const getNewLine = (label: string | number | boolean | undefined) => {
  localStorage.setItem('urlType', JSON.stringify(label))
  let newBaseUrl: Partial<BaseType> = {}

  switch (label) {
    case 'acquiesce1': {
      newBaseUrl = {
        default: 'http://admin.aliensaas.com',
        move: 'http://fdmv.aliensaas.com',
        type: label,
        food_manage: 'http://fdmv.aliensaas.com'
      }
      setBaseUrl(newBaseUrl)
      break
    }
    case 'acquiesce2': {
      newBaseUrl = {
        default: 'http://alien-admin-zjvgqiiejz.cn-shenzhen.fcapp.run',
        move: 'http://alien-admintest-fzskxpriek.cn-shenzhen.fcapp.run',
        type: label,
        food_manage: 'http://alien-admintest-fzskxpriek.cn-shenzhen.fcapp.run'
      }
      setBaseUrl(newBaseUrl)
      break
    }
    case 'standby': {
      newBaseUrl = {
        default: 'http://alien.wmzdb.shop',
        move: 'http://fdmvapi.wmzdb.shop',
        type: label,
        food_manage: 'http://fdmvapi.wmzdb.shop'
      }
      setBaseUrl(newBaseUrl)
      break
    }
    case 'custom': {
      const localBaseUrl = localStorage.getItem('customUrl')
      if (localBaseUrl) {
        baseUrl.value = JSON.parse(localBaseUrl)
        newBaseUrl = JSON.parse(localBaseUrl)
        setBaseUrl(newBaseUrl)
      } else {
        // 如果没有保存过自定义 URL，则打开自定义对话框
        openCustom();
      }
      break
    }
  }
}
const customState = ref(false)
const openCustom = () => {
  // 加载已保存的自定义 URL 到表单
  const localBaseUrl = localStorage.getItem('customUrl')
  if (localBaseUrl) {
    baseUrl.value = JSON.parse(localBaseUrl)
  }

  // 设置为自定义线路并打开对话框
  if (lineRadio.value !== 'custom') {
    lineRadio.value = 'custom'
  }
  customState.value = true
}
const closeInterface = () => {
  customState.value = false
}
//自定义线路确定
const confirmInterface = () => {
  if (formBaseUrlRef.value)
    formBaseUrlRef.value?.validate(async (valid: any) => {
      if (valid) {
        baseUrl.value.type = 'custom'
        setBaseUrl(baseUrl.value)
        localStorage.setItem("customUrl", JSON.stringify(baseUrl.value))
        closeInterface()
      }
    })
}
const rules = reactive<FormRules<FormType>>({
  phone: [
    {
      required: true,
      trigger: 'blur',
      validator: validateUsername
    }
  ],
  pwd: [
    {
      required: true,
      trigger: 'blur',
      validator: validatePassword
    }
  ],
  bind_phone: [
    {
      required: true,
      trigger: 'blur',
      validator: validateBindPhone
    }
  ],
  bind_phone_code: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机验证码')
    }
  ],
  ga_code: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入令牌验证码'),
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length !== 6 || !/^\d{6}$/.test(value)) {
          callback(new Error(translate('请输入 6 位数字验证码')))
        } else {
          callback()
        }
      }
    }
  ]
})

// Google Authenticator 绑定表单验证规则
const gaBindRules = reactive<FormRules<GaBindFormType>>({
  code: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入验证码'),
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length !== 6 || !/^\d{6}$/.test(value)) {
          callback(new Error(translate('请输入 6 位数字验证码')))
        } else {
          callback()
        }
      }
    }
  ]
})

// 令牌验证码登录表单验证规则
const gaCodeRules = reactive<FormRules<GaCodeLoginFormType>>({
  phone: [
    {
      required: true,
      trigger: 'blur',
      validator: validateGaCodePhone
    }
  ],
  ga_code: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入令牌验证码'),
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length !== 6 || !/^\d{6}$/.test(value)) {
          callback(new Error(translate('请输入 6 位数字验证码')))
        } else {
          callback()
        }
      }
    }
  ]
})
const baseUrlRules = reactive<FormRules<BaseType>>({
  default: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入默认接口地址')
    }
  ],
  move: [
    {

      trigger: 'blur',
      message: translate('请输入搬菜接口地址\n')
    }
  ]
})

const handleRoute = () => {
  return redirect.value === '/404' || redirect.value === '/403' ? '/' : redirect.value
}
const receiveResultType = ref<number>(0)
const isBindPhone = ref<boolean>(false)
/**
 * 切换登录方式
 */
const handleLoginTypeChange = (name: string | number) => {
  // 切换时同步账号输入框内容
  if (name === 'gaCode') {
    // 切换到令牌验证码登录时，同步账号密码登录的账号到令牌验证码登录的手机号
    if (form.phone) {
      gaCodeForm.phone = form.phone
    }
  } else if (name === 'password') {
    // 切换到账号密码登录时，同步令牌验证码登录的手机号到账号密码登录的账号
    if (gaCodeForm.phone) {
      form.phone = gaCodeForm.phone
    }
  }

  // 切换时清空表单状态（但保留账号/手机号）
  isBindPhone.value = false
  isRequireGaCode.value = false
  form.bind_phone = ''
  form.bind_phone_code = ''
  form.ga_code = ''
  gaCodeForm.ga_code = ''
  stopGetPhoneCodeTimer()
}

const openChat = () => {
  // console.log(123);
  if (typeof (globalThis as any).electron !== 'undefined' && (globalThis as any).electron?.openNewWindowUrl) {
    (globalThis as any).electron.openNewWindowUrl('https://chatbot.aliyuncs.com/intl/index.htm?locale=zh-CN&from=yvdyPWy4f3')
  }
}
const handleLogin = async () => {
  if (formRef.value)
    formRef.value?.validate(async (valid: any) => {
      if (valid)
        try {
          loading.value = true
          const { phone, pwd, bind_phone, bind_phone_code, ga_code } = form
          let loginParams: any = { phone, pwd }

          if (isBindPhone.value) {
            loginParams.bind_phone = bind_phone
            loginParams.bind_phone_code = bind_phone_code
          }

          if (isRequireGaCode.value && ga_code) {
            loginParams.ga_code = ga_code
          }

          if (lineRadio.value === 'acquiesce') {
            setBaseUrl({
              default: 'http://localhost:5265/',
              move: 'http://fz.kuocaih.cn/',
              food_manage: 'http://fz.kuocaih.cn/',
              type: 'acquiesce'
            })
          }
          await login(loginParams, remember.value == true, voluntarilylogin.value == true)
            .then(async (res: any) => {
              receiveResultType.value = res.ResultType

              // 处理手机号绑定
              if (res.ResultType === AdmiPhoneResultType.请填写手机号) {
                isBindPhone.value = true
                isRequireGaCode.value = false
                gp.$baseMessage(getResultDescription(res.ResultType), 'error', 'hey')
                return
              }

              // 处理需要绑定 Google Authenticator
              if (res.ResultType === AdmiPhoneResultType.需要绑定GoogleAuthenticator) {
                isRequireGaCode.value = false
                isBindPhone.value = false
                openGaBindDialog()
                return
              }

              // 处理需要输入 Google Authenticator 验证码
              if (res.ResultType === AdmiPhoneResultType.请输入GoogleAuthenticator验证码 || res.RequireGoogleAuthenticator) {
                isRequireGaCode.value = true
                isBindPhone.value = false
                gp.$baseMessage(getResultDescription(res.ResultType), 'warning', 'hey')
                return
              }

              // 登录成功
              if (res.ResultType === AdmiPhoneResultType.验证成功 || res.ResultType === AdmiPhoneResultType.None) {
                isRequireGaCode.value = false
                isBindPhone.value = false
                form.ga_code = ''

                // 登录成功后获取并保存 Google Authenticator 密钥
                try {
                  const secretRes = await apiManager.adminApi.GetMyGoogleAuthenticatorSecret()
                  if (secretRes && secretRes.Secret) {
                    await saveAccount(form.phone, secretRes.Secret)
                    // 更新账号列表
                    savedAccounts.value = await getSavedAccounts()
                    // console.log('已保存 Google Authenticator 密钥')
                  }
                } catch (error) {
                  // console.error('获取 Google Authenticator 密钥失败:', error)
                  // 即使获取密钥失败，也继续登录流程，只保存用户名
                  await saveAccount(form.phone)
                  savedAccounts.value = await getSavedAccounts()
                }

                router.push('/index').then(() => { })
                return
              }

              // 其他错误情况
              const resultDescription = getResultDescription(res.ResultType)
              gp.$baseMessage(resultDescription, 'error', 'hey')
            })
            .catch(() => {
              loading.value = false
            })
        } finally {
          loading.value = false
        }
    })
}
/**
 * 通过手机号和令牌验证码登录
 */
const handleGaCodeLogin = async () => {
  if (!gaCodeFormRef.value) return

  gaCodeFormRef.value.validate(async (valid: any) => {
    if (!valid) return

    gaCodeLoading.value = true

    // 获取 baseUrl 并更新 apiManager
    const localBaseUrl = localStorage.getItem('baseUrl')
    if (localBaseUrl) {
      const localBaseUrlObj = JSON.parse(localBaseUrl)
      if (localBaseUrlObj && localBaseUrlObj.default) {
        apiManager.updateBaseUrl(localBaseUrlObj.default)
      }
    }

    const { phone, ga_code } = gaCodeForm

    apiManager.adminApi.AgencyLoginByPhoneAndGaCode({
      phone,
      ga_code
    })
      .then(async (res: any) => {
        // 登录成功处理
        if (res.ResultType === AdmiPhoneResultType.验证成功 || res.ResultType === AdmiPhoneResultType.None) {
          // 处理记住手机号和自动登录（令牌验证码登录没有密码，只保存手机号）
          if (remember.value) {
            localStorage.setItem('rememberuser', JSON.stringify({ phone, pwd: '' }))
          } else {
            localStorage.setItem('rememberuser', JSON.stringify({ phone, pwd: '' }))
          }
          if (voluntarilylogin.value) {
            localStorage.setItem('vlogin', '1')
          } else {
            localStorage.setItem('vlogin', '0')
          }

          await userStore.afterLogin(res.Token, tokenName)

          // 登录成功后获取并保存 Google Authenticator 密钥
          try {
            const secretRes = await apiManager.adminApi.GetMyGoogleAuthenticatorSecret()
            if (secretRes && secretRes.Secret) {
              await saveAccount(phone, secretRes.Secret)
              // 更新账号列表
              savedAccounts.value = await getSavedAccounts()
              // console.log('已保存 Google Authenticator 密钥')
            }
          } catch (error) {
            // console.error('获取 Google Authenticator 密钥失败:', error)
            // 即使获取密钥失败，也继续登录流程，只保存用户名
            await saveAccount(phone)
            savedAccounts.value = await getSavedAccounts()
          }

          router.push('/index').then(() => { })
        } else {
          // 其他错误情况
          const resultDescription = getResultDescription(res.ResultType)
          gp.$baseMessage(resultDescription, 'error', 'hey')
        }
      })
      .catch((err) => {
        gp.$baseMessage('登录失败，请检查手机号和验证码', 'error', 'hey')
        // console.error('令牌验证码登录失败:', err)
      })
      .finally(() => {
        gaCodeLoading.value = false
      })
  })
}

const backLogin = () => {
  isBindPhone.value = false
  isRequireGaCode.value = false
  form.bind_phone = ''
  form.bind_phone_code = ''
  form.ga_code = ''
  stopGetPhoneCodeTimer()
}

/**
 * 处理账号选择（用户名自动完成）
 * @param item - 选中的项目对象
 */
const handleAccountSelect = async (item: any) => {
  // 从对象中提取 value
  const username = typeof item === 'string' ? item : item.value

  if (!username) return

  // console.log('选择账号:', username)

  // 填充用户名
  form.phone = username

  // 查找该账号信息
  const account = await getAccountByUsername(username)
  // console.log('账号信息:', account)

  if (!account || !account.gaSecret) {
    // console.log('没有找到账号或没有密钥')
    return
  }

  // 如果有保存的密钥，提示用户可以使用快速登录
  try {
    autoFillingGaCode.value = true
    // console.log('开始生成验证码，密钥:', account.gaSecret)
    const gaCode = await generateTOTP(account.gaSecret)
    // console.log('生成的验证码:', gaCode)

    // 如果当前需要输入验证码，则自动填充
    if (isRequireGaCode.value) {
      form.ga_code = gaCode
      gp.$baseMessage('已自动填充令牌验证码', 'success', 'hey')
    } else {
      // 即使当前不需要验证码，也先填充上，以便后续需要时直接使用
      form.ga_code = gaCode
      // console.log('预填充验证码（当前不需要显示）:', gaCode)
      // 提示用户可以使用快速登录
      gp.$baseMessage('该账号支持快速登录，可切换到"令牌验证码登录"标签快速登录', 'info', 'hey', 3000)
    }
  } catch (error) {
    // console.error('自动生成验证码失败:', error)
    gp.$baseMessage('自动生成验证码失败，请手动输入', 'error', 'hey')
  } finally {
    autoFillingGaCode.value = false
  }
}

/**
 * 用于 el-autocomplete 的查询建议方法
 * @param queryString - 查询字符串
 * @param callback - 回调函数
 */
const queryAccountSuggestions = (queryString: string, callback: any) => {
  // console.log('查询建议，输入:', queryString, '已保存账号数:', savedAccounts.value.length)

  // 过滤并映射账号列表
  const suggestions = savedAccounts.value
    .filter(account => {
      // 如果没有输入查询字符串，显示所有账号
      if (!queryString || queryString.trim() === '') {
        return true
      }
      // 否则按用户名过滤
      return account.username.toLowerCase().includes(queryString.toLowerCase())
    })
    .map(account => ({
      value: account.username,
      label: account.username,
      hasSecret: !!account.gaSecret
    }))

  // console.log('返回的建议数量:', suggestions.length)
  callback(suggestions)
}

/**
 * 处理令牌验证码登录的账号选择
 * @param item - 选中的项目对象
 */
const handleAccountSelectForGaCode = async (item: any) => {
  // 从对象中提取 value
  const username = typeof item === 'string' ? item : item.value

  if (!username) return

  // console.log('令牌验证码登录 - 选择账号:', username)

  // 填充用户名/手机号
  gaCodeForm.phone = username

  // 查找该账号信息
  const account = await getAccountByUsername(username)
  // console.log('令牌验证码登录 - 账号信息:', account)

  if (!account || !account.gaSecret) {
    // console.log('令牌验证码登录 - 没有找到账号或没有密钥')
    return
  }

  // 如果有保存的密钥，自动生成验证码并登录
  try {
    autoFillingGaCode.value = true
    // console.log('令牌验证码登录 - 开始生成验证码')
    const gaCode = await generateTOTP(account.gaSecret)
    // console.log('令牌验证码登录 - 生成的验证码:', gaCode)
    gaCodeForm.ga_code = gaCode

    // 显示提示并自动登录


    // 等待一小段时间让用户看到提示，然后自动登录
    setTimeout(() => {

      handleGaCodeLogin()
    }, 500)
  } catch (error) {

    gp.$baseMessage('验证失败，请手动输入', 'error', 'hey')
  } finally {
    autoFillingGaCode.value = false
  }
}

/**
 * 监听用户名输入变化，如果选择了已保存的账号，自动填充验证码
 */
watch(() => form.phone, async (newPhone, oldPhone) => {
  // 避免重复触发
  if (!newPhone || autoFillingGaCode.value || newPhone === oldPhone) return

  // console.log('监听到用户名变化:', newPhone)

  const account = await getAccountByUsername(newPhone)
  if (!account || !account.gaSecret) {
    // console.log('watch: 没有找到账号或没有密钥')
    return
  }

  // 如果需要验证码且当前验证码为空，自动填充
  if (isRequireGaCode.value && !form.ga_code) {
    try {
      // console.log('watch: 自动填充验证码')
      const gaCode = await generateTOTP(account.gaSecret)
      form.ga_code = gaCode
    } catch (error) {
      // console.error('watch: 自动填充验证码失败:', error)
    }
  }
})

/**
 * 监听令牌验证码登录的手机号输入变化
 * 注意：此 watch 主要用于手动输入时的自动补全
 * 选择下拉选项时由 handleAccountSelectForGaCode 处理
 */
watch(() => gaCodeForm.phone, async (newPhone, oldPhone) => {
  // 避免重复触发和在自动填充时触发
  if (!newPhone || autoFillingGaCode.value || newPhone === oldPhone) return

  // console.log('令牌验证码登录 - 监听到手机号变化:', newPhone)

  const account = await getAccountByUsername(newPhone)
  if (!account || !account.gaSecret) {
    // console.log('令牌验证码登录 watch: 没有找到账号或没有密钥')
    return
  }

  // 自动填充验证码（但不自动登录，让用户确认）
  if (!gaCodeForm.ga_code) {
    try {
      // console.log('令牌验证码登录 watch: 自动填充验证码')
      const gaCode = await generateTOTP(account.gaSecret)
      gaCodeForm.ga_code = gaCode
    } catch (error) {
      // console.error('令牌验证码登录 watch: 自动填充验证码失败:', error)
    }
  }
})

const getPhoneCode = async () => {
  if (!form.bind_phone || !isPhone(form.bind_phone)) {
    formRef.value?.validateField('bind_phone')
    return
  }
  try {
    const { phone, pwd, bind_phone } = form
    await login({ phone, pwd, bind_phone }, remember.value == true, voluntarilylogin.value == true).then((res: any) => {
      if (res.ResultType === 4) {
        startGetPhoneCodeTimer()
        gp.$baseMessage('验证码发送成功', 'success', 'hey')
      }
    })
    router.push(handleRoute()).then(() => { })
  } finally {
    loading.value = false
  }
}
const startGetPhoneCodeTimer = () => {
  isGetPhone.value = true
  let n = 60
  // 清除可能存在的旧定时器
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    // console.log(phoneCode.value)
    if (n > 0) {
      n--
      phoneCode.value = `${translate('获取验证码 ') + n}s`
    } else {
      stopGetPhoneCodeTimer()
      isGetPhone.value = false
    }
  }, 1000)
}
const stopGetPhoneCodeTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  phoneCode.value = translate('获取验证码')
  isGetPhone.value = false
}

const openUserAgreement = () => {
  const targetRoute = router.resolve({ name: 'UserAgreement' })
  window.open(targetRoute.href, '_blank')
}
// const changeCode = () => {
//   codeUrl.value = `https://www.oschina.net/action/user/captcha?timestamp=${Date.now()}`
// }

onBeforeMount(() => {
  // form.phone = '335405' // 15021122222 15021122211
  // form.pwd = '112233H'
  // 为了演示效果，会在官网演示页自动登录到首页，正式开发可删除
  if (location.hostname.includes('vuejs-core')) {
    previewText.value = '（演示地址验证码可不填）'
    setTimeout(() => {
      handleLogin()
    }, 1000 * 10)
  }
  const localBaseUrl = localStorage.getItem('baseUrl')
  if (localBaseUrl) {
    baseUrl.value = JSON.parse(localBaseUrl)
    lineRadio.value = baseUrl.value.type
  }
})

watchEffect(() => {
  redirect.value = (route.query && route.query.redirect) || '/'
})

onBeforeRouteLeave((to, from, next) => {
  try {
    if (timer) clearTimeout(timer)
  } catch {
    /* empty */
  }
  next()
})
// Google Authenticator 绑定相关方法
const openGaBindDialog = async () => {
  gaBindDialogVisible.value = true
  gaBindForm.code = ''
  gaQrCodeData.value = null

  // 获取 baseUrl 并更新 apiManager
  const localBaseUrl = localStorage.getItem('baseUrl')
  if (localBaseUrl) {
    try {
      const localBaseUrlObj = JSON.parse(localBaseUrl)
      if (localBaseUrlObj && localBaseUrlObj.default) {
        apiManager.updateBaseUrl(localBaseUrlObj.default)
      }
    } catch (error) {
      // console.warn('解析 localStorage.baseUrl 失败:', error)
    }
  }

  // 使用已定义的 apiManager.adminApi，它会自动处理响应拦截
  const { phone, pwd } = form
  apiManager.adminApi.BindGoogleAuthenticatorOnLogin({ phone, pwd })
    .then((res) => {
      gaQrCodeData.value = res
    })
    .catch((err) => {
      gp.$baseMessage('获取二维码失败，请重试', 'error', 'hey')
      // console.error('获取令牌验证器二维码失败:', err)
    })
}

const confirmGaBind = async () => {
  if (!gaBindFormRef.value) return

  gaBindFormRef.value.validate(async (valid: any) => {
    if (!valid) return

    gaBindLoading.value = true

    // 使用匿名接口，传入用户名、密码和验证码
    const { phone, pwd } = form
    apiManager.adminApi.VerifyGoogleAuthenticatorSetupOnLogin({
      phone,
      pwd,
      Code: gaBindForm.code
    })
      .then(async (res) => {
        // 验证成功，返回的是登录结果
        if (res.ResultType === AdmiPhoneResultType.验证成功 || res.ResultType === AdmiPhoneResultType.None) {
          gp.$baseMessage('绑定成功', 'success', 'hey')
          gaBindDialogVisible.value = false
          gaBindForm.code = ''
          // 绑定成功后，直接完成登录
          await userStore.afterLogin(res.Token, tokenName)
          router.push('/index').then(() => { })
        } else {
          // 如果还需要其他验证，显示相应提示
          const resultDescription = getResultDescription(res.ResultType)
          gp.$baseMessage(resultDescription, 'warning', 'hey')
          if (res.ResultType === AdmiPhoneResultType.请输入GoogleAuthenticator验证码 || res.RequireGoogleAuthenticator) {
            isRequireGaCode.value = true
            form.ga_code = ''
          }
        }
      })
      .catch((err) => {
        gp.$baseMessage('验证码错误，请重试', 'error', 'hey')
        // console.error('验证令牌验证码失败:', err)
      })
      .finally(() => {
        gaBindLoading.value = false
      })
  })
}

const cancelGaBind = () => {
  gaBindDialogVisible.value = false
  gaBindForm.code = ''
  gaQrCodeData.value = null
}

/**
 * 打开令牌验证码教程对话框
 * @param type - 教程类型：'bind' 注册并绑定, 'login_bind' 已注册登录绑定, 'login' 登录
 */
const openGaCodeTip = (type: 'bind' | 'login_bind' | 'login') => {
  gaCodeTipType.value = type
  currentStepIndex.value = 0 // 重置到第一步
  showGaCodeTip.value = true
}

// 上一步
const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStepIndex.value < totalSteps.value - 1) {
    currentStepIndex.value++
  }
}

onUnmounted(() => {
  stopGetPhoneCodeTimer()
})
</script>

<style lang="scss" scoped>
.login-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;

  .title {
    font-size: 54px;
    font-weight: 500;
    color: var(--el-color-grey);
    margin-bottom: 10px;
  }

  .title-tips {
    margin-top: 29px;
    margin-bottom: 30px;
    font-size: 26px;
    font-weight: 400;
    color: var(--el-color-grey);
  }
}

:deep(.login-form) {
  .left-img {
    width: 40% !important;
    flex-shrink: 0;
  }
}

.login-tabs {
  width: 100%;

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    padding: 0 20px;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
  }

  :deep(.el-tabs__content) {
    padding-top: 0;
    width: 100%;
  }

  :deep(.el-tab-pane) {
    width: 100%;
  }

  :deep(.el-form) {
    width: 100% !important;
    max-width: 100% !important;
  }

  :deep(.el-form--default) {
    width: 100% !important;
    max-width: 100% !important;
  }

  :deep(.el-form-item) {
    width: 100%;
  }

  :deep(.el-input) {
    width: 100%;
  }
}

.login-other {
  position: absolute;
  right: 0;
  display: inline-block;
  height: 32px;
  margin-top: var(--el-margin);
  margin-right: 4.5vh;
  line-height: 32px;

  :deep() {
    [class*='ri-'] {
      margin-left: calc(var(--el-margin) / 2);
      font-size: var(--el-font-size-large);
    }
  }
}

.user-agreement {
  font-size: 12px;
  width: 100%;
  text-align: center;
  margin-top: 20px;

  span {
    color: #3a8ee6;
    cursor: pointer;
  }
}

.user-agreement-radio {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.line-list {
  margin-top: 20px;
  display: flex;
  align-items: center;

  .edit-box-line {
    margin-left: 4px;
  }
}

.flexbutton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  .flexbutton-left {
    display: flex;
    align-items: center;
  }
}

::v-deep.checkboxtip {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .el-checkbox--large {
    height: 30px;
  }
}

::v-deep .login-form {
  width: auto;

  .el-form-item {
    margin: 15px 0;
  }

}

.ga-bind-content {
  text-align: center;

  .ga-tips {
    margin-bottom: 20px;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;

    p {
      margin: 8px 0;

      strong {
        color: #409eff;
        font-family: monospace;
        font-size: 16px;
        word-break: break-all;
      }
    }
  }

  .ga-qrcode {
    margin: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 200px;
      max-height: 200px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 10px;
      background: #fff;
    }
  }
}

.ga-code-tip-icon {
  cursor: pointer;
  color: #909399;
  font-size: 18px;
  transition: color 0.3s;

  &:hover {
    color: #409eff;
  }
}

.ga-code-tip-content {
  padding: 20px 0;
  height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;

  .ga-code-step-item {
    width: 100%;
    text-align: center;

    .step-number {
      font-size: 16px;
      font-weight: 600;
      color: #409eff;
      margin-bottom: 20px;
    }

    .step-description {
      font-size: 18px;
      color: #f56c6c;
      font-weight: 500;
      margin-bottom: 15px;
      text-align: center;
      line-height: 1.6;
      min-height: 28.8px;
    }

    .step-image-wrapper {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 540px;
      width: 100%;
      height: 580px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;

      .ga-code-tip-image {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        display: block;
        object-fit: contain;
        transition: transform 0.3s ease;
        cursor: zoom-in;
      }

      &:hover {
        .ga-code-tip-image {
          transform: scale(1.1);
        }
      }

      .nav-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
        color: #fff;
        font-size: 20px;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: translateY(-50%) scale(1.1);
        }

        &.nav-button-left {
          left: 10px;
        }

        &.nav-button-right {
          right: 10px;
        }
      }
    }

    .step-text-wrapper {
      padding: 40px 20px;
      text-align: center;

      .warning-title {
        color: #f56c6c;
        font-weight: bold;
        font-size: 20px;
        margin: 0 0 20px 0;
      }

      .warning-content {
        color: #606266;
        font-size: 15px;
        line-height: 1.8;
        margin: 0;
        text-align: left;
        padding: 0 20px;
      }
    }
  }
}

.dialog-footer {
  .step-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;

    .step-info {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
}

.ga-code-input-wrapper {
  display: flex;
  align-items: center;

  .ga-code-tip-text {
    margin-left: 8px;
    font-size: 13px;
    color: #409eff;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>