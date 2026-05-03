<script setup lang="ts">
import { addFeedback } from "/@/api/business.ts";
import { gp } from "/@vab/plugins/vab.ts";
import type { FormInstance, FormRules } from "element-plus";

const openFeedback = () => {
  dialogVisible.value = true
}
const dialogVisible = ref<boolean>(false)
const feedbackForm = reactive({
  msg: '',
  img: [],
  contact: ''
})
const feedbackRules = reactive<FormRules>({
  msg: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入内容',
    },
  ]
})
const loading = ref(false)
const feedbackRef = ref<FormInstance>()
const submitFeedback = () => {
  if (feedbackRef.value)
    feedbackRef.value?.validate(async (valid: any) => {
      if (valid) {
        loading.value = true
        addFeedback(feedbackForm).then((res: any) => {
          if (res.code === 200) {
            gp.$baseMessage('反馈成功', 'success', 'hey')
            dialogVisible.value = false
            handleClose()
          }
        }).finally(() => {
          loading.value = false
        })
      }
    })
}
interface FileItem {
  response?: {
    url: string;
  };
}
const getUploadImg = (fileList: FileItem[]): void => {
  feedbackForm.img = fileList
    .filter(item => item.response && item.response.url) // 确保 response 和 url 存在
    .map(item => item.response!.url); // 提取所有有效的 url
};
const handleClose = () => {
  dialogVisible.value = false
  feedbackForm.img = [];
  feedbackForm.msg = '';
  feedbackForm.contact = '';
}
</script>

<template>
  <div>
    <div class="feedback-button" @click="openFeedback">
      <vab-icon icon="feedback-line" />
      <span class="feedback-label">反馈</span>
    </div>
    <el-dialog v-if="dialogVisible" v-model="dialogVisible" :before-close="handleClose" :close-on-click-modal="false"
      title="意见反馈" width="40%">
      <el-form ref="feedbackRef" label-width="80px" :model="feedbackForm" :rules="feedbackRules">
        <el-form-item label="问题描述" prop="msg">
          <el-input v-model="feedbackForm.msg" placeholder="请输入内容" :rows="5" type="textarea" />
        </el-form-item>
        <el-form-item label="问题截图">
          <vab-upload :limit="9" @set-upload-img="getUploadImg" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="feedbackForm.contact" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button :loading="loading" type="primary" @click="submitFeedback">提 交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.feedback-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  text-align: center;
}

.feedback-label {
  margin: 7px -24px -1px 0px;
  font-size: 12px;
}
</style>