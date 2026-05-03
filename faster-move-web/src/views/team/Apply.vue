<template>
  <div>
    <vab-card>
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="美团外卖" name="1" />
        <el-tab-pane label="饿了么" name="2" />
        <el-tab-pane label="饿了么复制版" name="8" />
        <el-tab-pane label="京东到家" name="6" />
        <el-tab-pane label="美团闪购" name="3" />
        <el-tab-pane label="美团医药" name="4" />
        <el-tab-pane label="饿百零售" name="5" />
        <el-tab-pane label="抖音即时零售" name="7" />
        <el-tab-pane label="美团团购" name="1000" />
        <el-tab-pane label="京东团购" name="1001" />
      </el-tabs>
      <div class="filter-main">
        <div class="filter-item">
          <el-segmented v-model="online" :options="onlineOptions" size="large" @change="handleChangeOnline" />
        </div>
        <div class="filter-item">
          <el-button :icon="Plus" type="primary" @click="handleAdd">创建应用</el-button>
        </div>
      </div>
    </vab-card>
    <vab-card style="margin-bottom: 0">
      <div>
        <el-table ref="tableRef" v-loading="listLoading" :data="list" height="calc(100vh - 350px)" row-key="id"
          style="width: 100%;">
          <el-table-column align="center" label="排序" prop="index" width="90">
            <template #default="scope">
              <span class="drag-handle" title="拖拽排序">
                <el-icon><Rank /></el-icon>
                <span>{{ scope.row.index != null ? scope.row.index : '-' }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="应用名称" prop="name" />
          <el-table-column align="center" label="功能代码" prop="code" />
          <el-table-column label="应用描述" prop="notes" />
          <el-table-column align="center" label="图标" prop="logo">
            <template #default="scope">
              <img v-if="scope.row.logo" :src="scope.row.logo" style="width: 40px; height: 40px;" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="教程地址" prop="course">
            <template #default="scope">
              <el-button v-if="scope.row.course" type="text" @click="copyText(scope.row)">复制链接</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" label="依赖功能" prop="depend_codes" width="180">
            <template #default="scope">
              <span v-if="scope.row.depend_codes && scope.row.depend_codes.length > 0">
                {{ scope.row.depend_codes.join(', ') }}
              </span>
              <span v-else style="color: #909399;">无</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="续费按钮" width="90">
            <template #default="scope">
              <el-tag v-if="scope.row.show_renew_btn === false" type="info" size="small">隐藏</el-tag>
              <el-tag v-else type="success" size="small">显示</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="续费显示名" prop="renew_name" width="120">
            <template #default="scope">
              <span v-if="scope.row.renew_name" style="color: #409EFF;">{{ scope.row.renew_name }}</span>
              <span v-else style="color: #909399;">使用名称</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="本月售卖" prop="sold_month" :formatter="(row, column, cellValue) => formatBalance(cellValue)" />
          <el-table-column align="center" label="累计售卖" prop="sold_total" :formatter="(row, column, cellValue) => formatBalance(cellValue)" />
          <el-table-column align="center" label="今日售卖" prop="sold_today" />
          <el-table-column align="center" fixed="right" label="操作">
            <template #default="scope">
              <el-button style="color: #2cca87" type="text" @click="editApp(scope.row)">
                编辑
              </el-button>
              <el-button style="color: #fe0000" type="text" @click="stopApp(scope.row)">{{ scope.row.avtag ? '停用' : '启用'
                }}</el-button>
              <el-button style="color: #fe0000" type="text" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </vab-card>
    <el-dialog v-model="dialogFormVisible" :before-close="closeAddForm" :title="userParams.id ? '编辑应用' : '创建应用'"
      width="500px">
      <el-form ref="ruleForm" :model="userParams" :rules="userRule">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="userParams.name" autocomplete="off" size="small" />
        </el-form-item>
        <el-form-item label="应用描述" prop="notes">
          <el-input v-model="userParams.notes" autocomplete="off" size="small" />
        </el-form-item>
        <el-form-item label="应用代码" prop="code">
          <el-input v-model="userParams.code" autocomplete="off" size="small" />
        </el-form-item>
        <el-form-item label="店铺类型" prop="shop_type">
          <el-select v-model="userParams.shop_type" placeholder="请选择平台类型" size="small" style="width: 100%"
            @change="handleShopTypeChange">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="index">
          <el-input-number v-model="userParams.index" :min="0" :precision="0" placeholder="数字越小越靠前" size="small"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="依赖功能">
          <el-select v-model="userParams.depend_codes" multiple filterable placeholder="选择依赖的功能代码" size="small"
            style="width: 100%">
            <el-option v-for="item in availableFunctions" :key="item.code" :label="`${item.name} (${item.code})`"
              :value="item.code" :disabled="item.code === userParams.code" />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            开启此功能时，会自动检查并开启所选的依赖功能
          </div>
        </el-form-item>
        <el-form-item label="显示续费按钮">
          <el-switch v-model="userParams.show_renew_btn" active-text="显示" inactive-text="隐藏" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            关闭后该功能不会出现在续费选项列表中
          </div>
        </el-form-item>
        <el-form-item label="续费显示名称">
          <el-input v-model="userParams.renew_name" autocomplete="off" clearable placeholder="为空时使用应用名称" size="small" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            续费时显示的名称，为空则使用应用名称
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="btnLoading" type="primary" @click="addAdmin">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Rank } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { nextTick, onMounted, watch } from 'vue'
import { gp } from '/@vab/plugins/vab.ts'
import type { TableInstance } from 'element-plus';
import { ElMessageBox } from 'element-plus'
import { addFunction, deleteFunction, editFunction, getFuncList, setAvtag } from '/@/api/apply.ts'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'

defineOptions({
  name: 'Apply',
})

/**
 * 平台类型选项接口
 */
interface ShopTypeOption {
  label: string
  value: ShopType
}

/**
 * 平台类型选项列表
 */
const shopTypeOptions: ShopTypeOption[] = [
  { label: '美团外卖', value: ShopType.美团 },
  { label: '饿了么外卖', value: ShopType.饿了么 },
  { label: '美团闪购', value: ShopType.美团闪购 },
  { label: '美团医药', value: ShopType.美团医药 },
  { label: '饿百零售', value: ShopType.饿百零售 },
  { label: '京东到家', value: ShopType.京东到家 },
  { label: '抖店即时零售', value: ShopType.抖店即时零售 },
  { label: '饿了么官方', value: ShopType.饿了么官方 },
  { label: '美团团购', value: ShopType.美团团购 },
  { label: '京东团购', value: ShopType.京东团购 },
]
const activeName = ref('1')
const btnLoading = ref(false)

// 监听 activeName 变化，自动更新 shoptype 并加载数据
watch(activeName, (newValue) => {
  const shopType = parseInt(newValue)
  if (!isNaN(shopType)) {
    courseParams.shoptype = shopType
    getCourseCoursesData()
  }
}, { immediate: false })
const dialogFormVisible = ref(false)
const listLoading = ref(false)
const ruleForm = ref<TableInstance>()
const userRule = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  notes: [{ required: true, message: '请输入介绍', trigger: 'blur' }],
  code: [{ required: true, message: '请输入引用代码', trigger: 'blur' }],
  shop_type: [{ required: true, message: '请选择店铺类型', trigger: 'blur' }],
}
let userParams = reactive({
  id: '',
  name: '',
  notes: '',
  code: '',
  shop_type: ShopType.美团,
  index: 0,
  depend_codes: [] as string[],
  show_renew_btn: true as boolean,
  renew_name: '' as string,
})

/**
 * 重置表单数据为初始值
 */
const resetUserParams = () => {
  userParams.id = ''
  userParams.name = ''
  userParams.notes = ''
  userParams.code = ''
  userParams.shop_type = ShopType.美团
  userParams.index = 0
  userParams.depend_codes = []
  userParams.show_renew_btn = true
  userParams.renew_name = ''
}

/**
 * 可用功能列表（用于依赖选择）
 */
const availableFunctions = ref<any[]>([])

/**
 * 根据店铺类型获取可用功能列表
 */
const loadAvailableFunctions = async (shopType: ShopType) => {
  try {
    const functions = await getFuncList({ shoptype: shopType, avtag: true })
    availableFunctions.value = functions
  } catch (error) {
    console.error('获取功能列表失败:', error)
    availableFunctions.value = []
  }
}

/**
 * 处理店铺类型变更
 */
const handleShopTypeChange = (value: ShopType) => {
  loadAvailableFunctions(value)
}

const addAdmin = () => {
  if (ruleForm.value)
    ruleForm.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        if (userParams.id) {
          editFunction(userParams as any).then(() => {
            gp.$baseMessage('修改成功！', 'success', 'hey')
            getCourseCoursesData()
            dialogFormVisible.value = false
          }).finally(() => {
            btnLoading.value = false
          })
        } else {
          addFunction(userParams as any)
            .then(() => {
              gp.$baseMessage('添加成功！', 'success', 'hey')
              getCourseCoursesData()
              dialogFormVisible.value = false
            })
            .finally(() => {
              btnLoading.value = false
            })
        }
      }
    })
}
const closeAddForm = () => {
  ruleForm.value?.resetFields()
  resetUserParams()
  dialogFormVisible.value = false
}
const tableRef = ref<{ $el?: HTMLElement }>()
const sortableInstance = ref<ReturnType<typeof Sortable.create> | null>(null)
const list = ref<any>([])
const online = ref('全部应用')
const onlineOptions = ['全部应用', '已上线', '已下线']
const handleChangeOnline = () => {
  switch (online.value) {
    case '全部应用': {
      courseParams.avtag = undefined
      break;
    }
    case '已上线': {
      courseParams.avtag = true
      break;
    }
    case '已下线': {
      courseParams.avtag = false
      break;
    }
  }
  getCourseCoursesData()
}
const courseParams = reactive({
  shoptype: 1,
  avtag: undefined
})
/**
 * 拖拽结束：同步列表顺序，仅更新被拖拽项的 index（上一行 index + 1），后端会处理前面行的顺序
 */
const handleDragEnd = async (evt: { oldIndex?: number; newIndex?: number }) => {
  const oldIndex = evt.oldIndex ?? -1
  const newIndex = evt.newIndex ?? -1
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return
  const arr = list.value
  const [item] = arr.splice(oldIndex, 1)
  arr.splice(newIndex, 0, item)
  const newIndexVal = newIndex === 0 ? 0 : (arr[newIndex - 1].index ?? 0) + 1
  item.index = newIndexVal
  try {
    await editFunction({ ...item, index: newIndexVal })
    gp.$baseMessage('排序已保存', 'success', 'hey')
  } catch {
    gp.$baseMessage('保存排序失败', 'error', 'hey')
    getCourseCoursesData()
  }
}

const initSortable = () => {
  nextTick(() => {
    if (sortableInstance.value) {
      sortableInstance.value.destroy()
      sortableInstance.value = null
    }
    if (list.value.length > 0) {
      const tbody = tableRef.value?.$el?.querySelector('.el-table__body-wrapper tbody') as HTMLElement | null
      if (tbody) {
        sortableInstance.value = Sortable.create(tbody, {
          handle: '.drag-handle',
          animation: 150,
          ghostClass: 'sortable-ghost',
          onEnd: handleDragEnd,
        })
      }
    }
  })
}

const getCourseCoursesData = () => {
  listLoading.value = true
  getFuncList(courseParams).then((data) => {
    list.value = (data || []).slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    initSortable()
  }).finally(() => {
    listLoading.value = false
  })
}
/**
 * 处理创建应用按钮点击
 */
const handleAdd = async () => {
  resetUserParams()
  // 加载默认店铺类型的功能列表
  await loadAvailableFunctions(userParams.shop_type)
  dialogFormVisible.value = true
}

// 组件挂载时初始化数据
onMounted(() => {
  // 确保初始 shoptype 与 activeName 一致
  const shopType = parseInt(activeName.value)
  if (!isNaN(shopType)) {
    courseParams.shoptype = shopType
  }
  getCourseCoursesData()
})
/**
 * 处理编辑应用
 */
const editApp = async (row: any) => {
  const rowCopy = JSON.parse(JSON.stringify(row))
  // 直接更新 userParams 的属性，而不是重新创建 reactive 对象
  userParams.id = rowCopy.id || ''
  userParams.name = rowCopy.name || ''
  userParams.notes = rowCopy.notes || ''
  userParams.code = rowCopy.code || ''
  userParams.shop_type = rowCopy.shop_type || ShopType.美团
  userParams.index = rowCopy.index ?? 0
  userParams.depend_codes = rowCopy.depend_codes || []
  userParams.show_renew_btn = rowCopy.show_renew_btn !== false
  userParams.renew_name = rowCopy.renew_name || ''

  // 加载对应店铺类型的功能列表
  await loadAvailableFunctions(userParams.shop_type)

  dialogFormVisible.value = true
}
const stopApp = (row: any) => {
  const params = {
    id: row.id,
    avtag: !row.avtag,
  }
  setAvtag(params).then(() => {
    gp.$baseMessage('操作成功!', 'success', 'hey')
    getCourseCoursesData()
  })
}
const copyData = (content: any) => {
  try {
    const input = document.createElement('textarea');
    input.value = content;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    input.remove();
    return true;
  } catch { }
  return false;
}
const copyText = (data: any) => {
  if (copyData(data.course)) {
    gp.$baseMessage('复制完成!', 'success', 'hey')
  } else {
    gp.$baseMessage('复制失败!', 'error', 'hey')
  }
}

const formatBalance = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  // 如果是整数，不显示小数位
  if (Number.isInteger(num)) {
    return num.toString()
  }
  // 否则保留一位小数
  return num.toFixed(1)
}

/**
 * 处理删除应用
 * @param row 应用数据行
 */
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除应用"${row.name}"吗？删除条件：没有在功能价格中引用且在功能店铺中不存在或已到期（已到期会自动删除）`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      deleteFunction(row.id)
        .then(() => {
          gp.$baseMessage('删除成功！', 'success', 'hey')
          getCourseCoursesData()
        })
    })
    .catch(() => { })
}
</script>
<style scoped lang="scss">
.filter-main {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .filter-item {
    display: flex;
    align-items: center;
  }
}

.inputbox {
  display: flex;
  align-items: flex-start;

  span {
    line-height: 32px;
  }

  .input-item {
    margin-bottom: 10px;
    display: flex;
    align-items: flex-start;
  }
}

.main-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.videobox-drop {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;

  .videoitem {
    display: flex;
    margin-bottom: 10px;

    .vide {
      width: 100px;
      height: 100px;
      background: #D8D8D8;
      border-radius: 6px;
      overflow: hidden;
    }

    .desc {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      padding-left: 20px;
      padding-right: 50px;
    }
  }
}

.videobox {
  display: flex;
  margin-top: 10px;
  flex-wrap: wrap;
  // align-self:start;
  justify-content: start;

  .videoitem {
    margin-bottom: 10px;
    margin-right: 10px;
    width: calc((100% - 30px) / 4);

    .vide {
      width: 100%;
      height: 228px;
      background: #D8D8D8;
      border-radius: 6px;
      overflow: hidden;
    }

    .desc {
      padding: 8px 16px 16px;
    }
  }

  .videoitem:nth-of-type(4n) {
    margin-right: 0;
  }
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: move;
  user-select: none;
}

:deep(.sortable-ghost) {
  opacity: 0.4;
  background: var(--el-fill-color-light);
}
</style>