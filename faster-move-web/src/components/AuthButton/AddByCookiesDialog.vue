<template>
  <el-dialog
    v-model="visible"
    title="通过Cookies添加门店"
    width="520px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form :model="form" label-width="80px" label-position="top">
      <el-form-item label="平台类型">
        <el-select v-model="form.shopType" placeholder="请选择平台类型" style="width: 100%">
          <el-option v-for="opt in shopTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Cookies">
        <el-input
          v-model="form.cookies"
          type="textarea"
          :rows="8"
          placeholder="请粘贴Cookies内容（JSON格式或字符串格式均可）"
          resize="none"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { addShop } from '/@/api/shop'
import { gp } from '/@vab/plugins/vab'

interface Props {
  modelValue: boolean
  shopType?: ShopType
}

const props = withDefaults(defineProps<Props>(), {
  shopType: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'shop-added': [data: any]
  refresh: []
}>()

const shopTypeOptions = [
  { label: '美团餐饮', value: ShopType.美团 },
  { label: '美团闪购', value: ShopType.美团闪购 },
  { label: '美团医药', value: ShopType.美团医药 },
  { label: '饿了么餐饮', value: ShopType.饿了么 },
  { label: '饿了么复制版', value: ShopType.饿了么官方 },
  { label: '饿百零售', value: ShopType.饿百零售 },
  { label: '京东到家', value: ShopType.京东到家 },
  { label: '抖音即时零售', value: ShopType.抖店即时零售 },
  { label: '美团团购', value: ShopType.美团团购 },
  { label: '京东团购', value: ShopType.京东团购 }
]

const visible = ref(false)
const loading = ref(false)

const form = ref({
  shopType: ShopType.美团 as ShopType,
  cookies: ''
})

watch(
  () => props.modelValue,
  val => {
    visible.value = val
    if (val && props.shopType !== undefined) {
      form.value.shopType = props.shopType
    }
  }
)

watch(visible, val => {
  emit('update:modelValue', val)
})

const handleClosed = () => {
  form.value.cookies = ''
}

const handleSubmit = async () => {
  if (!form.value.cookies.trim()) {
    gp.$baseMessage('请填写Cookies内容', 'warning', 'hey')
    return
  }

  loading.value = true
  try {
    const data = {
      shop_type: form.value.shopType,
      shop_user: '',
      shop_pwd: '',
      cookies: form.value.cookies.trim()
    }

    const res: any = await addShop(data)
    if (res.code === 200) {
      gp.$baseMessage('店铺添加成功!', 'success', 'hey')
      emit('shop-added', {
        name: res.data?.name,
        office_id: res.data?.office_id,
        shop_type: form.value.shopType,
        shop_user: '',
        shop_pwd: '',
        cookies: form.value.cookies.trim(),
        reset_power: false
      })
      emit('refresh')
      visible.value = false
    } else {
      gp.$baseMessage(res.msg || '添加店铺失败', 'error', 'hey')
    }
  } catch (error: any) {
    gp.$baseMessage('添加店铺异常: ' + error.message, 'error', 'hey')
  } finally {
    loading.value = false
  }
}
</script>
