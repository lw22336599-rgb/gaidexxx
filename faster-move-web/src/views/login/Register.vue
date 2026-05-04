<template>
  <login-container>
    <div class="login-form">
      <img alt="" class="left-img" :src="leftImg" />
      <el-form ref="formRef" label-position="left" :model="form" :rules="rules" @submit.prevent>
        <div class="title">hello !</div>
        <div class="title-tips">{{ title }} {{ translate('账号注册') }}</div>
        <el-form-item prop="phone">
          <el-input
            v-model.trim="form.phone"
            clearable
            maxlength="11"
            :placeholder="translate('请输入手机号')"
            show-word-limit
            type="text"
          >
            <template #prefix>
              <vab-icon icon="smartphone-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="codeOrTeamId">
          <el-input
            v-model.trim="form.codeOrTeamId"
            auto-complete="off"
            clearable
            :placeholder="translate('请输入邀请码')"
            type="text"
          >
            <template #prefix>
              <vab-icon icon="barcode-box-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="p">
          <el-input v-model.trim="form.p" clearable :placeholder="translate('请输入密码')" type="password">
            <template #prefix>
              <vab-icon icon="lock-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="p1">
          <el-input v-model.trim="form.p1" clearable :placeholder="translate('请再次输入密码')" type="password">
            <template #prefix>
              <vab-icon icon="lock-line" />
            </template>
          </el-input>
        </el-form-item>
        <el-button v-throttle="handleRegister" class="login-btn" :loading="loading" native-type="submit" type="primary">
          {{ translate('注册') }}
        </el-button>

        <router-link to="/login">
          <el-button style="margin-top: 20px; margin-left: -10px" type="primary">
            {{ translate('登录') }}
          </el-button>
        </router-link>
        <router-link to="/password">
          <el-button style="margin-top: 20px" text type="primary">
            {{ translate('忘记密码') }}
          </el-button>
        </router-link>
      </el-form>
    </div>
  </login-container>
</template>

<script lang="ts" setup>
import { gp } from '/@vab/plugins/vab.ts'
import type { FormInstance, FormRules } from 'element-plus'
import { register } from '/@/api/user'
import leftImg from '/@/assets/login_images/left_img_5.png'
import { translate } from '/@/i18n'
import { useSettingsStore } from '/@/store/modules/settings'
import { useUserStore } from '/@/store/modules/user'
import { isPassword, isPhone } from '/@/utils/validate'

defineOptions({
  name: 'Register'
})

interface FormType {
  phone: string
  codeOrTeamId: string
  p: string
  p1: string
  is_boss: boolean
}
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { title } = storeToRefs(settingsStore)
const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()
const login = (form: any) => userStore.login(form)
const form = reactive<FormType>({
  phone: '',
  codeOrTeamId: '',
  p: '',
  p1: '',
  is_boss: false
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
      message: translate('请输入手机号')
    },
    { validator: validatePhone, trigger: 'blur' }
  ],
  codeOrTeamId: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入邀请码'
    }
  ],
  p: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入密码')
    },
    { validator: validatePassword, trigger: 'blur' }
  ],
  p1: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请再次输入密码')
    },
    { validator: validateAgainPassword, trigger: 'blur' }
  ]
})

const redirect = ref<any>(undefined)

watchEffect(() => {
  redirect.value = (route.query && route.query.redirect) || '/'
})
const handleRoute = () => {
  return redirect.value === '/404' || redirect.value === '/403' ? '/' : redirect.value
}
const handleRegister = async () => {
  formRef.value?.validate(async (valid: any) => {
    if (valid) {
      loading.value = true
      await register(form)
        .then(async (res: any) => {
          if (res.code === 200 && (res.data.ResultType === 5 || res.data.ResultType === 0)) {
            gp.$baseMessage('注册成功', 'success', 'hey')
            setTimeout(() => {
              router.push('/login')
            }, 500)
            const { phone, p } = form
            await login({ phone, pwd: p })
              .then((res: any) => {
                if (res.code === 200 && (res.data.ResultType === 5 || res.data.ResultType === 0)) {
                  gp.$baseMessage('登录成功', 'success', 'hey')
                }
              })
              .catch(() => {
                loading.value = false
              })
            await router.push(handleRoute())
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>
