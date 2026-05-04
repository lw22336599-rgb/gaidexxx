<template>
  <div class="personal-center-container no-background-container auto-height-container">
    <el-row :gutter="20">
      <el-col :lg="8" :md="12" :sm="24" :xl="8" :xs="24">
        <vab-card class="auto-height-card">
          <div class="user-info">
            <el-avatar :size="100" src="/src/assets/home_images/zdblogo.png" />
            <div class="user-info-full-name">
              {{ userInfo.admin.role[0] }}
            </div>
            <div class="user-info-description">
              {{ userInfo.admin.notes }}
            </div>
            <ul class="user-info-list">
              <li>
                <span>用户名：</span>
                {{ userInfo.admin.user_name }}
              </li>
              <li>
                <span>用户密码：</span>
                {{ userInfo.admin.password }}
                <el-icon class="edit-psw" size="18" @click="openDialog"><edit /></el-icon>
              </li>
              <li>
                <span>账号ID：</span>
                {{ userInfo.admin.id }}
              </li>
              <li>
                <span>手机号：</span>
                {{ userInfo.admin.phone }}
              </li>
              <li>
                <span>剩余积分：</span>
                {{ userInfo.admin.balance }}
              </li>
              <li>
                <span>邀请码：</span>
                {{ userInfo.admin.code }}
              </li>
              <li>
                <span>注册时间：</span>
                {{ userInfo.admin.crtim }}
              </li>
              <li>
                <span>上次登录时间：</span>
                {{ userInfo.admin.uptim }}
              </li>
            </ul>
          </div>
        </vab-card>
      </el-col>
      <el-col :lg="16" :md="12" :sm="24" :xl="16" :xs="24">
        <vab-card class="auto-height-card">
          <el-tabs v-model="activeName">
            <el-tab-pane label="基本信息" name="first">
              <el-col :lg="12" :md="16" :sm="24" :xl="12" :xs="24">
                <div class="shoplist">
                  <template v-for="(shop, index) in userInfo.count_shop_type" :key="index">
                    <div class="shopnumiten">
                      <div>{{ shop.ShopCount }}</div>
                      <div>{{ shop.Title }}</div>
                    </div>
                  </template>
                </div>
              </el-col>
            </el-tab-pane>
          </el-tabs>
        </vab-card>
      </el-col>
    </el-row>
    <el-dialog v-model="dialogState" :before-close="cancelDialog" title="修改密码" width="600">
      <el-form ref="formRef" label-position="left" :model="form" :rules="rules" @submit.prevent>
        <el-form-item prop="phone">
          <el-input v-model.trim="form.phone" clearable disabled maxlength="11" show-word-limit type="text">
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
        <el-form-item prop="phone_code" style="position: relative">
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
  </div>
</template>

<script lang="ts" setup>
import { Edit } from '@element-plus/icons-vue'
import { translate } from '/@/i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { isPassword, isPhone } from '/@/utils/validate.ts'
import { password } from '/@/api/user.ts'
import { gp } from '/@vab/plugins/vab.ts'

defineOptions({
  name: 'PersonalCenter'
})
const userInfoStr = localStorage.getItem('userInfo') as string
const userInfo = JSON.parse(userInfoStr)
const activeName = ref<string>('first')

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
  phone_code: ''
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
  p: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入新密码')
    },
    { validator: validatePassword, trigger: 'blur' }
  ],
  p1: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请确认新密码')
    },
    { validator: validateAgainPassword, trigger: 'blur' }
  ],
  phone_code: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机验证码')
    }
  ]
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
  isGetPhone.value = true
  let n = 60
  // 清除可能存在的旧定时器
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    console.log(phoneCode.value)
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
    timer = null // 确保清除后将 timer 设置为 null
  }
  phoneCode.value = translate('获取验证码')
  isGetPhone.value = false
}
const handleRegister = () => {
  formRef.value?.validate(async (valid: any) => {
    if (valid) {
      loading.value = true
      const { phone, p, p1, phone_code } = form
      await password({ phone, p, p1, phone_code })
        .then((res: any) => {
          if (res.code === 200 && (res.data.ResultType === 5 || res.data.ResultType === 0)) {
            gp.$baseMessage('修改成功', 'success', 'hey')
          }
        })
        .finally(() => {
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
.personal-center-container {
  .user-info {
    padding: var(--el-padding);
    text-align: center;

    :deep() {
      .el-avatar {
        img {
          padding: var(--el-padding);
          cursor: pointer;
        }
      }
    }

    &-full-name {
      margin-top: 15px;
      font-size: 24px;
      font-weight: 500;
      color: var(--el-color-grey);
    }

    &-description {
      margin-top: 8px;
    }

    &-follow {
      margin-top: 15px;
    }

    &-list {
      margin-top: 18px;
      line-height: 30px;
      text-align: left;
      list-style: none;

      h5 {
        margin: -20px 0 5px;
      }
    }
  }

  .item {
    display: flex;

    i {
      font-size: 40px;
    }

    &-content {
      box-sizing: border-box;
      flex: 1;
      margin-left: var(--el-margin);

      &-second {
        margin-top: 8px;
      }
    }
  }
}
.user-info-list {
  span {
    font-weight: 600;
    margin-right: 10px;
  }
  li {
    display: flex;
    align-items: center;
  }
  .edit-psw {
    margin-left: 10px;
    cursor: pointer;
  }
}
.msg-item {
  margin-bottom: 12px;
  .msg-title {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .msg-item {
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
    background-image: url('@/assets/home_images/shop1.png');
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
    background-image: url('@/assets/home_images/shop1.png');
  }
}
.phone-code {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
