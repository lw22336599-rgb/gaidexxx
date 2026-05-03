<template>
  <div class="function-price">
    <vab-card>
      <div class="filter-main">
        <div class="filter-item">
          <span class="filter-label">平台类型：</span>
          <el-select v-model="query.shopType" class="filter-select" placeholder="请选择平台类型" size="small"
            @change="handleShopTypeChange">
            <el-option :value="0" label="全部平台" />
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">价格名称：</span>
          <el-input v-model.trim="query.priceTitle" class="filter-input" clearable placeholder="输入价格名称关键字" size="small"
            @keyup.enter="reloadPriceList" />
        </div>
        <div class="filter-item">
          <span class="filter-label">功能代码：</span>
          <el-input v-model.trim="query.funcCode" class="filter-input" clearable placeholder="输入功能代码精确匹配" size="small"
            @keyup.enter="reloadPriceList" />
        </div>
        <div class="filter-item filter-item-right">
          <el-button type="primary" size="small" @click="handleAddPrice">
            新增价格
          </el-button>
          <el-button size="small" @click="reloadPriceList">
            刷新
          </el-button>
        </div>
      </div>
    </vab-card>

    <vab-card style="margin-top: 10px">
      <el-table v-loading="listLoading" :data="priceList" height="calc(100vh - 380px)" style="width: 100%">
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column prop="title" label="价格名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="平台类型" min-width="120" align="center">
          <template #default="{ row }">
            {{ getShopTypeName(row.shop_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="add_time" label="增加天数" width="90" align="center" />
        <el-table-column prop="sale_price" label="售价(元)" width="100" align="center" />
        <el-table-column prop="avtag" label="启用状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.avtag" :active-value="true" :inactive-value="false" active-color="#13ce66"
              inactive-color="#ff4949" @change="handleTogglePrice(row)" />
          </template>
        </el-table-column>
        <el-table-column label="包含功能" min-width="220">
          <template #default="{ row }">
            <div class="func-tags">
              <el-tag v-for="name in (row as FunctionPriceWithFuncNameVo).func_names" :key="name" class="func-tag"
                size="small" type="info">
                {{ name }}
              </el-tag>
              <span
                v-if="!(row as FunctionPriceWithFuncNameVo).func_names || (row as FunctionPriceWithFuncNameVo).func_names.length === 0">
                全部功能
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="text" @click="handleEditPrice(row)">编辑</el-button>
            <el-button type="text" @click="handleViewFunctions(row)">功能管理</el-button>
            <el-button type="text" style="color: #f56c6c" @click="handleDeletePrice(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-main">
        <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="total" background layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange" @size-change="handleSizeChange" />
      </div>
    </vab-card>

    <el-dialog v-model="editDialogVisible" :title="editForm.id ? '编辑功能价格' : '新增功能价格'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="90px">
        <el-form-item label="价格名称" prop="title">
          <el-input v-model="editForm.title" autocomplete="off" size="small" />
        </el-form-item>
        <el-form-item label="平台类型" prop="shop_type">
          <el-select v-model="editForm.shop_type" placeholder="请选择平台类型" size="small"
            @change="handleEditFormShopTypeChange">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="售价(元)" prop="sale_price">
          <el-input-number v-model="editForm.sale_price" :min="0" :step="1" size="small" />
        </el-form-item>
        <el-form-item label="增加天数" prop="add_time">
          <el-input-number v-model="editForm.add_time" :min="1" :step="1" size="small" />
        </el-form-item>
        <el-form-item label="支持功能">
          <!-- 多选时显示功能名称，实际提交 multi_func 为功能ID -->
          <el-select v-model="editForm.multi_func" multiple filterable placeholder="不选择表示支持全部功能" size="small">
            <el-option v-for="item in funcOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.notes" :rows="2" type="textarea" autocomplete="off" size="small" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="editSubmitting" @click="submitEditForm">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="funcDrawerVisible" title="功能启用管理" size="40%" direction="rtl">
      <el-alert type="info" show-icon :closable="false" title="切换开关将全局禁用/启用该功能，与价格本身无强绑定。"
        style="margin-bottom: 10px" />
      <el-table v-loading="funcLoading" :data="currentFunctions" height="calc(100vh - 260px)" style="width: 100%">
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column prop="name" label="功能名称" min-width="140" />
        <el-table-column prop="code" label="功能代码" width="140" />
        <el-table-column prop="notes" label="功能说明" min-width="180" show-overflow-tooltip />
        <el-table-column prop="avtag" label="启用状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.avtag" :active-value="true" :inactive-value="false" active-color="#13ce66"
              inactive-color="#ff4949" @change="handleToggleFunc(row)" />
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { apiManager } from '@/TsModel/Api/ApiManager'
import type { GetFunctionPricePageParm } from '@/TsModel/Alien/Controllers/Function/GetFunctionPricePageParm'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo'
import type { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'
import type { t_wmt_function_price } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function_price'
import type { FunctionPriceWithFuncNameVo } from '@/TsModel/Alien/Controllers/Function/FunctionPriceWithFuncNameVo'

defineOptions({
  name: 'FunctionPrice',
})

interface ShopTypeOption {
  label: string
  value: ShopType
}

interface QueryState {
  shopType: ShopType | 0
  priceTitle: string
  funcCode: string
  page: number
  pageSize: number
}

const listLoading = ref(false)
const funcLoading = ref(false)
const editDialogVisible = ref(false)
const funcDrawerVisible = ref(false)
const editSubmitting = ref(false)

const priceList = ref<FunctionPriceWithFuncNameVo[]>([])
const funcOptions = ref<t_wmt_function[]>([])
const currentFunctions = ref<t_wmt_function[]>([])
const total = ref(0)

const query = reactive<QueryState>({
  // 0 表示不过滤平台类型，传给后端时会转成 null
  shopType: 0,
  priceTitle: '',
  funcCode: '',
  page: 1,
  pageSize: 20,
})

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

const editFormRef = ref<FormInstance>()

const editForm = reactive<FunctionPriceWithFuncNameVo>({
  id: '',
  crtim: undefined,
  uptim: undefined,
  avtag: true,
  notes: '',
  title: '',
  shop_type: ShopType.美团,
  sale_price: 0,
  add_time: 1,
  multi_func: [],
  func_names: []
})

const editRules: FormRules = {
  title: [{ required: true, message: '请输入价格名称', trigger: 'blur' }],
  shop_type: [{ required: true, message: '请选择平台类型', trigger: 'change' }],
  sale_price: [{ required: true, message: '请输入售价', trigger: 'change' }],
  add_time: [{ required: true, message: '请输入增加天数', trigger: 'change' }],
}

const handleShopTypeChange = (value: ShopType | 0) => {
  // 直接记录选择的值，0 表示不过滤平台类型
  query.shopType = value
  query.page = 1
  getPriceList()
  loadFunctionOptions()
}

const getPriceList = async () => {
  listLoading.value = true
  try {
    const parms: GetFunctionPricePageParm = {
      page: query.page,
      pageSize: query.pageSize,
      ShopType: query.shopType === 0 ? null : (query.shopType as ShopType),
      priceTitle: query.priceTitle || null,
      funcCode: query.funcCode || null,
    }
    // 接口真实返回结构可能为 { code, data: PageResultVo<T>, message } 或直接为 PageResultVo<T>
    const rawResult =
      (await apiManager.functionpriceApi.GetPricePageList(parms)) as any

    const pageData: PageResultVo<FunctionPriceWithFuncNameVo> =
      rawResult && 'rows' in rawResult ? rawResult : rawResult?.data
    priceList.value = (pageData?.rows || []) as FunctionPriceWithFuncNameVo[]
    total.value = pageData?.total || 0
  } finally {
    listLoading.value = false
  }
}

const reloadPriceList = () => {
  query.page = 1
  getPriceList()
}

const handlePageChange = (page: number) => {
  query.page = page
  getPriceList()
}

const handleSizeChange = (size: number) => {
  query.pageSize = size
  query.page = 1
  getPriceList()
}

/**
 * 加载功能选项列表
 * @param shopType 平台类型,如果不传则使用查询条件中的平台类型
 */
const loadFunctionOptions = async (shopType?: ShopType) => {
  try {
    // 如果传入了平台类型,使用传入的;否则使用查询条件中的平台类型
    const targetShopType: ShopType = shopType ?? (query.shopType === 0 ? ShopType.美团 : (query.shopType as ShopType))

    const rawResult = (await apiManager.functionpriceApi.GetFuncList(
      targetShopType
    )) as any
    // 同样兼容 { code, data: T[] } 与直接返回数组两种情况
    const data: t_wmt_function[] = Array.isArray(rawResult)
      ? rawResult
      : rawResult?.data || []
    funcOptions.value = data
  } catch {
  }
}

/**
 * 处理编辑表单中平台类型改变事件
 * 当平台类型改变时,重新加载对应平台的功能列表,并清空已选择的功能
 */
const handleEditFormShopTypeChange = async (shopType: ShopType) => {
  // 重新加载对应平台的功能列表
  await loadFunctionOptions(shopType)
  // 清空已选择的功能,因为不同平台的功能ID可能不同
  editForm.multi_func = []
  editForm.func_names = []
}

const resetEditForm = () => {
  editForm.id = ''
  editForm.title = ''
  editForm.func_names = []
  editForm.shop_type = query.shopType as ShopType
  editForm.sale_price = 0
  editForm.add_time = 1
  editForm.multi_func = []
  editForm.notes = ''
}

const handleAddPrice = () => {
  resetEditForm()
  editDialogVisible.value = true
}

const handleEditPrice = (row: t_wmt_function_price) => {
  editForm.id = row.id
  editForm.title = row.title
  editForm.shop_type = row.shop_type
  editForm.sale_price = row.sale_price
  editForm.add_time = row.add_time
  // multi_func 为功能ID集合，直接回显到多选框
  editForm.multi_func = row.multi_func || []
  // func_names 为后台返回的友好名称集合，直接使用
  editForm.func_names = (row as FunctionPriceWithFuncNameVo).func_names || []
  editForm.notes = row.notes
  editDialogVisible.value = true
}

const submitEditForm = () => {
  if (!editFormRef.value) return
  editFormRef.value.validate(async (valid) => {
    if (!valid) return
    editSubmitting.value = true
    try {
      // 此处 multi_func 已经是功能ID数组，直接提交给后端
      if (editForm.id) {
        await apiManager.functionpriceApi.UpdatePrice(editForm)
      } else {
        await apiManager.functionpriceApi.AddPrice(editForm)
      }

      editDialogVisible.value = false
      await getPriceList()
    } finally {
      editSubmitting.value = false
    }
  })
}

const handleViewFunctions = (row: t_wmt_function_price) => {
  const ids = new Set(row.multi_func || [])
  // multi_func 存的是功能ID，这里用 ID 过滤
  currentFunctions.value = funcOptions.value.filter((item) => ids.has(item.id))
  funcDrawerVisible.value = true
}

const handleToggleFunc = async (row: t_wmt_function) => {
  try {
    await apiManager.functionappApi.SetAvtag(row.id, row.avtag)
  } catch {
    row.avtag = !row.avtag
  }
}

const handleTogglePrice = async (row: t_wmt_function_price) => {
  const currentValue = row.avtag
  try {
    await apiManager.functionpriceApi.SetPriceEnable(row.id, currentValue)
  } catch {
    // 接口失败时回滚界面状态
    row.avtag = !currentValue
  }
}

const handleDeletePrice = (row: t_wmt_function_price) => {
  ElMessageBox.confirm(
    `确定要删除价格【${row.title}】吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    await apiManager.functionpriceApi.DeletePrice(row.id)
    await getPriceList()
  })
}

const getShopTypeName = (shopType: ShopType | null | undefined) => {
  if (shopType === null || shopType === undefined) return ''
  const option = shopTypeOptions.find((item) => item.value === shopType)
  return option ? option.label : ''
}

getPriceList()
loadFunctionOptions()
</script>

<style scoped lang="scss">
.function-price {
  .filter-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;

    .filter-item {
      display: flex;
      align-items: center;

      .filter-label {
        margin-right: 6px;
      }

      .filter-select {
        width: 180px;
      }

      .filter-input {
        width: 220px;
      }

      .filter-checkbox {
        margin-left: 10px;
      }
    }

    .filter-item-right {
      margin-left: auto;
      gap: 10px;
    }
  }

  .func-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .func-tag {
      margin-bottom: 2px;
    }
  }

  .dialog-footer {
    text-align: right;
  }

  .pagination-main {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>