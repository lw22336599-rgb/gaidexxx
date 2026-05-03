<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :before-upload="beforeUpload"
      :file-list="fileList"
      :headers="headers"
      :limit="props.limit"
      list-type="picture-card"
      multiple
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
    >
      <template #default>
        <vab-icon icon="add-large-line" style="margin-left: 0"/>
      </template>
      <template #file="{ file }">
        <div class="upload-item">
          <el-image
            :preview-src-list="[file.url]"
            :src="file.url"
            style="width: 100%;"
          />
          <div class="del-icon" @click="handleRemove(file)">
            <vab-icon icon="delete-bin-2-fill" />
          </div>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

interface FileItem {
  uid: string;
  url?: string;
}
const fileList = ref<FileItem[]>([]);
const setDefaultImg = (val: string) => {
  if (val) {
    fileList.value.push({url: val} as FileItem);
  }
}
const props = defineProps({
  limit: Number,
  img: {
    type: String,
    required: false,
    default: '',
  }
});
watch(
  () => props.img,
  (val) => {
    setDefaultImg(val)
  },
  {
    immediate: true,
  }
)
const emit = defineEmits(['setUploadImg']);
const headers = ref<{ [key: string]: string }>({});
const uploadUrl = ref<string>('');

onMounted(() => {
  const token = localStorage.getItem('shop-vite-token');
  if (token) headers.value.Authorization = `Bearer ${token}`;

  const baseUrlStr = localStorage.getItem('baseUrl');
  if (baseUrlStr) {
    const { default: rawBaseUrl } = JSON.parse(baseUrlStr);
    // 兼容 baseUrl 末尾是否带 `/`
    const baseUrl =
      typeof rawBaseUrl === 'string'
        ? (rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`)
        : '';
    uploadUrl.value = `${baseUrl}system/method/file/upload`;
  }
});

const handleRemove = (file: FileItem) => {
  fileListCopy.value = fileListCopy.value.filter(item => item.uid !== file.uid);
  fileList.value = JSON.parse(JSON.stringify(fileListCopy.value));
  emit('setUploadImg', fileListCopy.value);
};

const beforeUpload = (file: File): boolean => {
  const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isValidType) {
    ElMessage.error('上传图片只能是 JPG、GIF 或 PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isValidType && isLt2M;
};

const fileListCopy = ref<FileItem[]>([]);
const handleSuccess = (response: any, file: FileItem, fileList: FileItem[]) => {
  fileListCopy.value = fileList.map(f => f.uid === file.uid ? { ...f, url: response.url } : f);
  emit('setUploadImg', fileListCopy.value);
};

const handleError = (err: any, file: FileItem) => {
  console.error('上传失败:', err, file);
  ElMessage.error('上传失败，请稍后再试！');
};
</script>

<style scoped lang="scss">
.upload-item {
  position: relative;
  overflow: hidden;

  .el-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .del-icon {
    display: none;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: rgba($color: #000000, $alpha: 0.5);
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 2px;
    top: 2px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color: #000000, $alpha: 0.2);
    }

    i {
      font-size: 12px;
      color: #ffffff;
    }
  }

  &:hover .del-icon {
    display: flex;
  }
}
</style>
