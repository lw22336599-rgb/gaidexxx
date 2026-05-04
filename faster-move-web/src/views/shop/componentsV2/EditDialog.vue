<template>
  <el-dialog
    v-model="editDialogStateCom"
    :before-close="handleClose"
    title="编辑门店"
    width="600"
    :close-on-click-modal="false"
  >
    <div class="edit-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="left">
        <!-- 所属平台 -->
        <el-form-item label="所属平台">
          <div class="platform-display">
            <vab-icon v-if="platformIcon" :icon="platformIcon" is-custom-svg class="platform-icon" />
            <span class="platform-name">{{ platformName }}</span>
          </div>
        </el-form-item>

        <!-- 门店名称 -->
        <el-form-item label="门店名称">
          <el-input v-model="form.shopName" disabled />
        </el-form-item>

        <!-- 门店ID -->
        <el-form-item label="门店ID">
          <el-input v-model="form.officeId" disabled />
        </el-form-item>

        <!-- 门店账号 -->
        <el-form-item label="门店账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入11位手机号" maxlength="11" />
        </el-form-item>

        <!-- 门店密码 -->
        <el-form-item label="门店密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入门店备注"
            :maxlength="30"
            show-word-limit
          />
        </el-form-item>

        <!-- 门店分组 -->
        <el-form-item label="门店分组" prop="group">
          <el-select v-model="form.group" placeholder="选择分组" clearable style="width: 100%">
            <el-option v-for="group in flatGroupOptions" :key="group.value" :label="group.label" :value="group.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { updateShopMsg, getGroup } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'
import { ElMessage } from 'element-plus'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'

const props = defineProps<{
  shopData: any
  editDialogState: boolean
  shopTypeStr?: string
  shopType?: number
}>()

const editDialogStateCom = computed(() => props.editDialogState)

const emit = defineEmits(['closeDialog', 'paySuccess'])

interface FormType {
  shopName: string
  officeId: string
  account: string
  phone: string
  password: string
  notes: string
  group: string | null
}

const formRef = ref()
const loading = ref(false)
const form = reactive<FormType>({
  shopName: '',
  officeId: '',
  account: '',
  phone: '',
  password: '',
  notes: '',
  group: null
})

// 分组相关
const groupOptions = ref<any[]>([])
const flatGroupOptions = ref<any[]>([])

// 获取平台图标和名称
const platformIcon = computed(() => {
  if (props.shopTypeStr) {
    return props.shopTypeStr.replace(/-feature|-operate/gi, '')
  }
  if (props.shopData?.shop_type) {
    const typeValue = Number(props.shopData.shop_type) as ShopType
    switch (typeValue) {
      case ShopType.美团:
        return 'mt'
      case ShopType.饿了么:
      case ShopType.饿了么官方:
        return 'tbsg_wm'
      case ShopType.美团闪购:
        return 'mt-shop'
      case ShopType.美团医药:
        return 'mt-medicine'
      case ShopType.饿百零售:
        return 'tbsg_ls'
      case ShopType.京东到家:
        return 'jd-home'
      case ShopType.抖店即时零售:
        return 'dy-retail'
      default:
        return undefined
    }
  }
  return undefined
})

const platformName = computed(() => {
  if (props.shopData?.shop_type) {
    const typeValue = Number(props.shopData.shop_type) as ShopType
    const typeMap: Record<number, string> = {
      1: '美团外卖',
      2: '饿了么',
      3: '美团闪购',
      4: '美团医药',
      5: '饿百零售',
      6: '京东到家',
      7: '抖店即时零售',
      8: '饿了么官方'
    }
    return typeMap[typeValue] || '未知平台'
  }
  return '未知平台'
})

// 获取分组列表
const getGroupList = async () => {
  try {
    const res: any = await getGroup({
      grouptype: 1,
      recursionchild: true
    })
    if (res.code === 200) {
      groupOptions.value = res.data
      // 处理分组数据
      const factory = (material: any) => {
        material.forEach((raw: any) => {
          if (raw.Member) {
            raw.id = raw.Member.id
            raw.label = raw.Member.name
            raw.value = raw.Member.id
          } else {
            raw.label = raw.name || ''
            raw.value = raw.id || ''
          }
          raw.children && factory(raw.children)
        })
      }
      factory(groupOptions.value)

      // 扁平化分组数据
      const flattenGroups = (groups: any[]): any[] => {
        const result: any[] = []
        groups.forEach((group: any) => {
          if (group.label && group.value) {
            result.push({
              label: group.label,
              value: group.value
            })
          }
          if (group.children && group.children.length > 0) {
            result.push(...flattenGroups(group.children))
          }
        })
        return result
      }
      flatGroupOptions.value = flattenGroups(groupOptions.value)
    }
  } catch (error) {
    console.error('获取分组列表失败:', error)
  }
}

// 根据分组名称获取分组ID
const getGroupIdByName = (groupName: string | null | undefined): string | null => {
  if (!groupName) return null
  const group = flatGroupOptions.value.find(g => g.label === groupName)
  return group?.value || null
}

// 设置表单数据
const setFormData = () => {
  if (props.shopData) {
    form.shopName = props.shopData.name || ''
    form.officeId = props.shopData.office_id || ''
    form.account = props.shopData.shop_user || ''
    form.phone = props.shopData.phone || ''
    form.password = props.shopData.password || ''
    form.notes = props.shopData.notes || ''
    form.group = getGroupIdByName(props.shopData.group_name)
  }
}

// 表单验证规则
const rules = reactive({
  account: [
    {
      pattern: /^[a-zA-Z0-9]*$/,
      message: '账号只能包含英文和数字',
      trigger: 'blur'
    }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的11位手机号',
      trigger: 'blur'
    }
  ]
})

// 监听对话框打开和shopData变化，初始化数据
watch(
  [() => props.editDialogState, () => props.shopData],
  async ([newState, newShopData]) => {
    if (newState && newShopData) {
      await nextTick()
      // 如果分组列表还未加载，先加载分组列表
      if (flatGroupOptions.value.length === 0) {
        await getGroupList()
      }
      setFormData()
    }
  },
  { immediate: true, deep: true }
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const updateData: any = {
      id: props.shopData.id,
      UpdateVal: {
        shop_user: form.account || undefined,
        phone: form.phone || undefined,
        password: form.password || undefined,
        notes: form.notes || undefined,
        group: form.group || undefined
      }
    }

    const res: any = await updateShopMsg(updateData)

    if (res.code === 200) {
      ElMessage.success('保存成功')
      emit('paySuccess')
      handleClose()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error: any) {
    if (error !== false) {
      // 验证失败时不显示错误
      console.error('表单验证失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  emit('closeDialog')
}

// 初始化分组列表
onMounted(() => {
  getGroupList()
})
</script>

<style scoped lang="scss">
.edit-form {
  padding: 20px 0;
}

.platform-display {
  display: flex;
  align-items: center;
  gap: 8px;

  .platform-icon {
    font-size: 20px;
  }

  .platform-name {
    font-size: 14px;
    color: #606266;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
  resize: vertical;
}
</style>
