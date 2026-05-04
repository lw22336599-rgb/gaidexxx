<template>
  <div class="page-container">
    <header class="header">
      <h4>自助OEM贴牌功能介绍</h4>
      <p>
        自助OEM贴牌功能是为企业客户量身打造的快速品牌定制解决方案。用户可通过可视化界面一键配置品牌元素（如软件Logo、软件名称、插画等信息），打包属于您自己的专属应用，彰显公司实力，并实现动态更新与版本同步。
      </p>
    </header>

    <nav class="tabs-nav">
      <div class="tabs-wrapper">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="自助贴牌" :name="0" />
        </el-tabs>
      </div>
    </nav>

    <main v-show="activeName === 0" class="main-content">
      <el-form :model="form" class="oem-form">
        <!-- 软件名称 -->
        <div class="form-field">
          <div class="form-label">软件名称</div>
          <el-form-item>
            <el-input v-model="form.name" placeholder="请输入软件名称" class="name-input" />
          </el-form-item>
        </div>

        <!-- 软件logo -->
        <div class="form-field">
          <div class="form-label">
            软件logo
            <span class="form-tip">（需上传512x512.png格式图片）</span>
          </div>
          <el-form-item>
            <el-upload
              ref="logoUploadRef"
              class="upload-box upload-box-square"
              action=""
              :show-file-list="false"
              :limit="1"
              :http-request="
                (e: UploadRequestOptions) => {
                  return httpRequestimg(e, 'logo')
                }
              "
            >
              <img v-if="form.logo.url" :src="form.logo.url" class="preview-img" />
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
              </div>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 软件icon -->
        <div class="form-field">
          <div class="form-label">
            软件icon
            <span class="form-tip">（需上传512x512.png格式图片）</span>
          </div>
          <el-form-item>
            <el-upload
              ref="iconUploadRef"
              class="upload-box upload-box-square"
              action=""
              :show-file-list="false"
              :limit="1"
              :http-request="
                (e: UploadRequestOptions) => {
                  return httpRequestimg(e, 'icon')
                }
              "
            >
              <img v-if="form.icon.url" :src="form.icon.url" class="preview-img" />
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
              </div>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 插画上传区域 -->
        <div v-if="0" class="illustrations-group">
          <div class="form-field">
            <div class="form-label">
              软件登录界面插画
              <span class="form-tip">（可不上传，不上传则使用默认图片）</span>
            </div>
            <el-form-item>
              <el-upload
                class="upload-box upload-box-wide"
                action=""
                :show-file-list="false"
                :limit="1"
                :http-request="
                  (e: UploadRequestOptions) => {
                    return httpRequestimg(e, 'loginImage')
                  }
                "
              >
                <img v-if="form.loginImage.url" :src="form.loginImage.url" class="preview-img-wide" />
                <div v-else class="upload-placeholder">
                  <el-icon><Plus /></el-icon>
                </div>
              </el-upload>
            </el-form-item>
          </div>

          <div class="form-field">
            <div class="form-label">
              软件注册界面插画
              <span class="form-tip">（可不上传，不上传则使用默认图片）</span>
            </div>
            <el-form-item>
              <el-upload
                class="upload-box upload-box-wide"
                action=""
                :show-file-list="false"
                :limit="1"
                :http-request="
                  (e: UploadRequestOptions) => {
                    return httpRequestimg(e, 'registerImage')
                  }
                "
              >
                <img v-if="form.registerImage.url" :src="form.registerImage.url" class="preview-img-wide" />
                <div v-else class="upload-placeholder">
                  <el-icon><Plus /></el-icon>
                </div>
              </el-upload>
            </el-form-item>
          </div>

          <div class="form-field">
            <div class="form-label">
              软件忘记密码界面插画
              <span class="form-tip">（可不上传，不上传则使用默认图片）</span>
            </div>
            <el-form-item>
              <el-upload
                class="upload-box upload-box-wide"
                action=""
                :show-file-list="false"
                :limit="1"
                :http-request="
                  (e: UploadRequestOptions) => {
                    return httpRequestimg(e, 'forgetPasswordImage')
                  }
                "
              >
                <img v-if="form.forgetPasswordImage.url" :src="form.forgetPasswordImage.url" class="preview-img-wide" />
                <div v-else class="upload-placeholder">
                  <el-icon><Plus /></el-icon>
                </div>
              </el-upload>
            </el-form-item>
          </div>
        </div>

        <el-form-item>
          <div class="form-actions">
            <el-button type="primary" @click="submit">开始打包</el-button>
          </div>
        </el-form-item>

        <el-form-item v-if="0">
          <div class="build-log">
            <h4>打包日志</h4>
            <div class="log-content">打包中，请稍心等待片刻...</div>
          </div>
        </el-form-item>
      </el-form>
    </main>

    <!-- 移除原来的对话框代码，替换为导入的组件 -->
    <BuildResultDialog v-model="dialogVisible" :build-result="buildResult" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadInstance, UploadRequestOptions } from 'element-plus'
import { ElLoading } from 'element-plus'
import { gp } from '~/library/plugins/vab'
// 导入新组件
import BuildResultDialog from './components/BuildResultDialog.vue'

let domain = 'http://zxgx.ztk1.com'
// domain = 'http://localhost:300'

interface FormState {
  name: string
  logo: {
    url: string // 用于预览的临时URL
    file: File | null // 实际文件对象
  }
  icon: {
    url: string
    file: File | null
  }
  loginImage: {
    url: string
    file: File | null
  }
  registerImage: {
    url: string
    file: File | null
  }
  forgetPasswordImage: {
    url: string
    file: File | null
  }
}

type ImageKeyType = Exclude<keyof FormState, 'name'>

const form = reactive<FormState>({
  name: '',
  logo: { url: '', file: null },
  icon: { url: '', file: null },
  loginImage: { url: '', file: null },
  registerImage: { url: '', file: null },
  forgetPasswordImage: { url: '', file: null }
})

const activeName = ref(0)

const logoUploadRef = ref<UploadInstance>()
const iconUploadRef = ref<UploadInstance>()

const dialogVisible = ref(false)
const buildResult = ref<any>({})

const handleClick = () => {
  console.log(activeName.value)
}

const submit = () => {
  // 表单验证
  if (!form.name.trim()) {
    gp.$baseMessage('请输入软件名称', 'error', 'hey')
    return
  }

  if (!form.logo.file) {
    gp.$baseMessage('请上传软件logo', 'error', 'hey')
    return
  }

  if (!form.icon.file) {
    gp.$baseMessage('请上传软件icon', 'error', 'hey')
    return
  }

  // 创建 FormData 对象
  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('logo', form.logo.file)
  formData.append('icon', form.icon.file)
  if (form.loginImage.file) formData.append('loginImage', form.loginImage.file)
  if (form.registerImage.file) formData.append('registerImage', form.registerImage.file)
  if (form.forgetPasswordImage.file) formData.append('forgetPasswordImage', form.forgetPasswordImage.file)

  const loading = ElLoading.service({
    lock: true,
    text: '正在提交...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  fetch(`${domain}/init`, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('提交失败')
      }
      return response.json()
    })
    .then(result => {
      if (result.code === 1) {
        gp.$baseMessage(result.error, 'error', 'hey')
        return
      }
      buildResult.value = result.data
      dialogVisible.value = true

      // 清空表单
      form.name = ''
      form.logo = { url: '', file: null }
      form.icon = { url: '', file: null }
      form.loginImage = { url: '', file: null }
      form.registerImage = { url: '', file: null }
      form.forgetPasswordImage = { url: '', file: null }
    })
    .catch(error => {
      gp.$baseMessage(error.message || '提交失败，请重试', 'error', 'hey')
    })
    .finally(() => {
      loading.close()
    })
}

const httpRequestimg = (fileBox: UploadRequestOptions, type: ImageKeyType): Promise<void> => {
  console.log('httpRequestimg', fileBox, type)
  return new Promise((resolve, reject) => {
    if (form[type].url) {
      URL.revokeObjectURL(form[type].url)
    }

    const reader = new FileReader()
    reader.addEventListener('load', event => {
      if (event.target?.result) {
        const image = new Image()
        image.src = event.target.result as string

        image.onload = () => {
          form[type] = {
            url: URL.createObjectURL(fileBox.file),
            file: fileBox.file
          }
          resolve()
        }

        image.onerror = () => {
          gp.$baseMessage('图片加载失败，请重试', 'error', 'hey')
          reject(new Error('图片加载失败'))
        }
      }
    })

    reader.onerror = () => {
      gp.$baseMessage('文件读取失败，请重试', 'error', 'hey')
      reject(new Error('文件读取失败'))
    }

    switch (type) {
      case 'logo':
        if (logoUploadRef.value) {
          logoUploadRef.value.clearFiles()
        }
        break
      case 'icon':
        if (iconUploadRef.value) {
          iconUploadRef.value.clearFiles()
        }
        break
    }
    reader.readAsDataURL(fileBox.file)
  })
}

// 组件卸载时清理所有临时URL
onBeforeUnmount(() => {
  if (form.logo.url) URL.revokeObjectURL(form.logo.url)
  if (form.icon.url) URL.revokeObjectURL(form.icon.url)
  if (form.loginImage.url) URL.revokeObjectURL(form.loginImage.url)
  if (form.registerImage.url) URL.revokeObjectURL(form.registerImage.url)
  if (form.forgetPasswordImage.url) URL.revokeObjectURL(form.forgetPasswordImage.url)
})
</script>

<style lang="scss" scoped>
$height: 120px;
.page-container {
  padding: 20px;
}

.header {
  margin-bottom: 30px;

  h4 {
    margin-bottom: 15px;
  }
}

.form-field {
  margin-bottom: 24px;
}

.form-label {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;

  .form-tip {
    font-weight: normal;
    color: #909399;
    font-size: 12px;
  }
}

.name-input {
  width: 300px;
}

.upload-box {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &.upload-box-square {
    width: $height;
    height: $height;
  }

  &.upload-box-wide {
    width: 380px;
    height: $height;
  }

  :deep(.el-upload) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.preview-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.preview-img-wide {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .el-icon {
    font-size: 28px;
    color: #8c939d;
  }
}

.illustrations-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-actions {
  text-align: center;
  margin: 30px 0;
}

.build-log {
  h4 {
    margin-bottom: 15px;
  }

  .log-content {
    padding: 15px;
    background: #fafafd;
    border-radius: 4px;
    min-height: 300px;
  }
}
</style>
