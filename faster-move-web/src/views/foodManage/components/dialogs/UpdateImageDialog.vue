<template>
  <el-dialog
    v-model="dialogVisible"
    title="主图批量边框修改"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="image-combine-container">
      <!-- 左侧：上传边框 -->
      <div class="border-upload">
        <el-upload
          class="upload-block"
          :show-file-list="false"
          :http-request="customUpload"
          :before-upload="beforeUpload"
          accept="image/png,image/gif"
        >
          <template #default>
            <div class="upload-content">
              <img v-if="borderUrl" :src="borderUrl" class="border-preview" />
              <div v-else class="upload-placeholder">点击上传PNG边框</div>
            </div>
          </template>
        </el-upload>
      </div>
      <!-- 右侧：合成预览 -->
      <div class="preview-area">
        <div class="preview-box">
          <img :src="firstProductImage" class="main-image" />
          <img v-if="borderUrl" :src="borderUrl" class="border-image" />
        </div>
      </div>
    </div>
    <el-form class="mt16" label-width="120px">
      <el-form-item label="是否只设置主图">
        <el-switch v-model="onlyMainImage" :active-text="'只设置主图'" :inactive-text="'全部图片'" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!borderUrl" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UploadRequestOptions } from 'element-plus'
import { filerequ } from '@/api/shop'
import type { FoodManageApi } from '../../types/api'

const props = defineProps<{
  modelValue: boolean
  firstProductImage: string
  baseParams: FoodManageApi.BaseParams
  foodIds?: string[]
  onlyMainImage?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: FoodManageApi.BatchUpdateImageBorderParams): void
  (e: 'update:onlyMainImage', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const onlyMainImage = computed({
  get: () => (props.onlyMainImage !== undefined ? props.onlyMainImage : true),
  set: val => emit('update:onlyMainImage', val)
})

const borderUrl = ref<string>('')
const uploadUrl = '' // 实际不使用，走自定义上传

const beforeUpload = (file: File) => {
  if (file.type !== 'image/png' && file.type !== 'image/gif') {
    ElMessage.error('请上传PNG或GIF格式的图片')
    return false
  }
  return true
}

const customUpload = async (option: UploadRequestOptions) => {
  const formData = new FormData()
  formData.append('file', option.file)
  try {
    const res = await filerequ(formData)
    borderUrl.value = res.url
    option.onSuccess && option.onSuccess(res)
  } catch (e) {
    option.onError && option.onError(e as any)
  }
}

const handleClose = () => {
  borderUrl.value = ''
  dialogVisible.value = false
}

const handleConfirm = () => {
  if (!borderUrl.value) return
  const params: FoodManageApi.BatchUpdateImageBorderParams = {
    ...props.baseParams,
    FoodIds: props.foodIds,
    BorderImageUrl: borderUrl.value,
    OnlyMainImage: onlyMainImage.value
  }
  emit('confirm', params)
  handleClose()
}
</script>

<style scoped lang="scss">
.image-combine-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .border-upload {
    width: 220px;

    .upload-block {
      width: 200px;
      height: 200px;
      border: 1px dashed #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;

      .upload-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .border-preview {
        max-width: 100%;
        max-height: 100%;
        display: block;
        pointer-events: none;
      }

      .upload-placeholder {
        color: #999;
        font-size: 14px;
        text-align: center;
        pointer-events: none;
      }
    }
  }

  .preview-area {
    width: 220px;

    .preview-box {
      position: relative;
      width: 200px;
      height: 200px;
      border: 1px solid #eee;

      .main-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .border-image {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
        pointer-events: none;
      }
    }
  }
}

.mt16 {
  margin-top: 16px;
}
</style>
