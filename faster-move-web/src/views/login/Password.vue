<template>
  <login-container>
    <div class="login-form">
      <img alt="" class="left-img" :src="leftImg" />
      <el-form ref="formRef" label-position="left" :model="form" :rules="rules" @submit.prevent>
        <div class="title">hello !</div>
        <div class="title-tips">{{ title }} {{ translate('忘记密码') }}</div>
        <el-form-item prop="phone">
          <el-input v-model.trim="form.phone" clearable maxlength="11" :placeholder="translate('请输入手机号')"
            show-word-limit type="text">
            <template #prefix>
              <vab-icon icon="smartphone-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="p">
          <el-input v-model.trim="form.p" clearable :placeholder="translate('请输入新密码')" type="password">
            <template #prefix>
              <vab-icon icon="lock-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="p1">
          <el-input v-model.trim="form.p1" clearable :placeholder="translate('请确认新密码')" type="password">
            <template #prefix>
              <vab-icon icon="lock-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="ga_code">
          <div class="ga-code-input-wrapper">
            <el-input v-model.trim="form.ga_code" clearable maxlength="6" :placeholder="translate('请输入令牌验证码')"
              type="text">
              <template #prefix>
                <vab-icon icon="shield-check-line" />
              </template>
            </el-input>
            <span class="ga-code-tip-text" @click="showGaCodeTip = true">怎么获取验证码?</span>
          </div>
        </el-form-item>
        <el-button v-throttle="handleRegister" class="login-btn" :loading="loading" native-type="submit" type="primary">
          {{ translate('修改密码') }}
        </el-button>
        <router-link to="/login">
          <el-button style="margin-top: 20px; margin-left: -10px" type="primary">
            {{ translate('登录') }}
          </el-button>
        </router-link>
        <router-link to="/register">
          <el-button style="margin-top: 20px" text type="primary">
            {{ translate('注册') }}
          </el-button>
        </router-link>
      </el-form>
    </div>
    <!-- 令牌验证码获取提示对话框 -->
    <el-dialog v-model="showGaCodeTip" align-center title="如何使用令牌验证码" width="600" :close-on-click-modal="true">
      <div class="ga-code-tip-content">
        <div class="ga-code-step-item">
          <div class="step-number">步骤 {{ currentStepIndex + 1 }} / {{ totalSteps }}</div>
          <!-- 图片页 -->
          <template v-if="currentStepData.type === 'image'">
            <div v-if="currentStepData.description" class="step-description">
              {{ currentStepData.description }}
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
  </login-container>
</template>

<script lang="ts" setup>
import { gp } from "/@vab/plugins/vab.ts";
import type { FormInstance, FormRules } from 'element-plus'
import { password, register } from '/@/api/user'
import leftImg from '/@/assets/login_images/left_img_6.png'
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

defineOptions({
  name: 'Register',
})

interface FormType {
  phone: string
  p: string
  p1: string
  ga_code?: string
}

const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { title } = storeToRefs(settingsStore)
const { setToken } = userStore
const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()
const form = reactive<FormType>({
  phone: '',
  p: '',
  p1: '',
  ga_code: '',
})
const showGaCodeTip = ref<boolean>(false)
// 当前步骤索引
const currentStepIndex = ref<number>(0)

// 令牌验证码教程步骤数据类型
interface StepData {
  type: 'image' | 'text'
  image?: string
  description?: string
  title?: string
  content?: string
}

// 令牌验证码教程步骤数据
const gaCodeTipSteps: StepData[] = [
  {
    type: 'image',
    image: bangdingImg1,
    description: '请在此编辑步骤1的说明文字'
  },
  {
    type: 'image',
    image: bangdingImg2,
    description: '请在此编辑步骤2的说明文字'
  },
  {
    type: 'image',
    image: bangdingImg3,
    description: '请在此编辑步骤3的说明文字'
  },
  {
    type: 'image',
    image: bangdingImg4,
    description: '请在此编辑步骤4的说明文字'
  },
  {
    type: 'image',
    image: bangdingImg5,
    description: '请在此编辑步骤5的说明文字'
  },
  {
    type: 'image',
    image: bangdingImg6,
    description: '请在此编辑步骤6的说明文字'
  },
  {
    type: 'image',
    image: bangdingImg7,
    description: '温馨提示：令牌绑定后可通过令牌的动态验证码登录或重置密码，不可随意删除，否则将导致后续无法正常登录，请妥善保存。'
  }
]

// 总步骤数
const totalSteps = computed(() => gaCodeTipSteps.length)

// 当前步骤数据
const currentStepData = computed(() => gaCodeTipSteps[currentStepIndex.value])

// 打开弹窗时重置步骤
watch(showGaCodeTip, (newVal) => {
  if (newVal) {
    currentStepIndex.value = 0
  }
})

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
    },
  ],
})

const handleRegister = () => {
  formRef.value?.validate(async (valid: any) => {
    if (valid) {
      loading.value = true
      const { phone, p, p1, ga_code } = form
      await password({ phone, p, p1, ga_code }).then((res: any) => {
        if (res.code === 200 && (res.data.ResultType === 5 || res.data.ResultType === 0)) {
          gp.$baseMessage('修改成功', 'success', 'hey')
        } else {
          const resultDescription = getResultDescription(res.data.ResultType)
          gp.$baseMessage(resultDescription, 'error', 'hey')
        }
      }).catch((err) => {
        gp.$baseMessage('修改密码失败，请重试', 'error', 'hey')
        console.error('修改密码失败:', err)
      }).finally(() => {
        loading.value = false
      })
      setTimeout(() => {
        router.push('/login')
      }, 500)
    }
  })
}

// 获取结果描述
const getResultDescription = (result: number): string => {
  switch (result) {
    case 0:
      return '操作成功'
    case 2:
      return '验证码已过期'
    case 3:
      return '验证码不正确'
    case 4:
      return '请输入验证码'
    case 5:
      return '验证成功'
    case 6:
      return '请填写手机号'
    case 7:
      return '需要绑定令牌验证器'
    case 8:
      return '请输入令牌验证码'
    default:
      return '未知错误'
  }
}
</script>

<style lang="scss" scoped>
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