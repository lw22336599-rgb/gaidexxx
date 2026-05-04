<template>
  <div class="tool-box">
    <vab-card>
      <div class="filter-main">
        <div class="filter-item">
          <span class="filter-label">目标店铺类型：</span>
          <el-select
            v-model="targetShopType"
            class="filter-select"
            placeholder="请选择店铺类型"
            size="small"
            @change="handleShopTypeChange"
          >
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="filter-item filter-item-right">
          <el-button type="primary" size="small" @click="handleCreate"> 新增工具 </el-button>
          <el-button size="small" @click="loadToolList"> 刷新 </el-button>
        </div>
      </div>
    </vab-card>

    <vab-card style="margin-top: 10px">
      <el-table v-loading="listLoading" :data="toolList" height="calc(100vh - 320px)" style="width: 100%">
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column prop="Name" label="工具名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="Text" label="工具描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="目标店铺类型" width="140" align="center">
          <template #default="{ row }">
            {{ getShopTypeName(targetShopType) }}
          </template>
        </el-table-column>
        <el-table-column prop="Points" label="积分" width="90" align="center" />
        <el-table-column label="关联功能" min-width="200">
          <template #default="{ row }">
            <div class="func-tags">
              <el-tag v-for="code in row.FunctionCodes" :key="code" class="func-tag" size="small" type="info">
                {{ getFunctionLabel(code) }}
              </el-tag>
              <span v-if="!row.FunctionCodes || row.FunctionCodes.length === 0"> 未配置 </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="源店铺类型" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="type in row.FromShopTypes" :key="type" class="func-tag" size="small" type="success">
              {{ getShopTypeName(type) }}
            </el-tag>
            <span v-if="!row.FromShopTypes || row.FromShopTypes.length === 0"> 未配置 </span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="显示站点图标" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.ShowSiteIcon ? 'success' : 'info'" size="small">
              {{ row.ShowSiteIcon ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="启用状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.Avtag"
              :active-value="true"
              :inactive-value="false"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column label="排序" width="140" align="center">
          <template #default="{ row }">
            <div class="sort-cell">
              <el-input-number v-model="row.Sort" :min="0" :step="1" size="small" />
              <el-button type="text" size="small" @click="handleSaveSort(row)">
                保存
              </el-button>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" style="color: #f56c6c" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </vab-card>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑工具' : '新增工具'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="110px">
        <el-form-item label="工具名称" prop="Name">
          <el-input v-model="editForm.Name" placeholder="请输入工具名称" size="small" />
        </el-form-item>
        <el-form-item label="工具描述" prop="Text">
          <el-input v-model="editForm.Text" :rows="2" type="textarea" placeholder="请输入工具描述" size="small" />
        </el-form-item>
        <div class="form-two-col-row">
          <el-form-item label="目标店铺类型" class="form-two-col-item" prop="TargetShopType">
            <el-select
              v-model="editForm.TargetShopType"
              placeholder="请选择店铺类型"
              size="small"
              @change="handleEditTargetShopTypeChange"
            >
              <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="积分" class="form-two-col-item" prop="Points">
            <el-input-number v-model="editForm.Points" :min="0" :step="1" size="small" />
          </el-form-item>
        </div>
        <div class="form-two-col-row">
          <el-form-item label="工具图标" class="form-two-col-item" prop="Img">
            <el-input v-model="editForm.Img" placeholder="请输入图标地址" size="small" />
          </el-form-item>
          <el-form-item label="教程链接" class="form-two-col-item" prop="TutorialUrl">
            <el-input v-model="editForm.TutorialUrl" placeholder="请输入教程链接" size="small" />
          </el-form-item>
        </div>
        <div class="form-two-col-row">
          <el-form-item label="显示站点图标" class="form-two-col-item">
            <el-switch v-model="editForm.ShowSiteIcon" :active-value="true" :inactive-value="false" />
          </el-form-item>
          <el-form-item label="启用状态" class="form-two-col-item">
            <el-switch v-model="editForm.Avtag" :active-value="true" :inactive-value="false" />
          </el-form-item>
        </div>
        <el-form-item label="排序" prop="Sort">
          <el-input-number v-model="editForm.Sort" :min="0" :step="1" size="small" />
        </el-form-item>
        <el-form-item label="关联功能" prop="FunctionCodes">
          <el-select v-model="editForm.FunctionCodes" multiple filterable placeholder="请选择关联功能" size="small">
            <el-option
              v-for="item in funcOptions"
              :key="item.code"
              :label="`${item.name}(${item.code})`"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="源店铺类型" prop="FromShopTypes">
          <el-select v-model="editForm.FromShopTypes" multiple filterable placeholder="请选择源店铺类型" size="small">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="editSubmitting" @click="submitEditForm"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { ToolItemCreateDto } from '@/TsModel/Alien/Entity/Function/Tool/ToolItemCreateDto'
import type { ToolItemDto } from '@/TsModel/Alien/Entity/Function/Tool/ToolItemDto'
import type { ToolItemSortDto } from '@/TsModel/Alien/Entity/Function/Tool/ToolItemSortDto'
import type { ToolItemStatusDto } from '@/TsModel/Alien/Entity/Function/Tool/ToolItemStatusDto'
import type { ToolItemUpdateDto } from '@/TsModel/Alien/Entity/Function/Tool/ToolItemUpdateDto'
import type { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'

defineOptions({
  name: 'ToolBox'
})

interface ShopTypeOption {
  label: string
  value: ShopType
}

interface ToolForm extends ToolItemCreateDto {
  id?: string
}

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
  { label: '京东团购', value: ShopType.京东团购 }
]

const listLoading = ref(false)
const editDialogVisible = ref(false)
const editSubmitting = ref(false)

const toolList = ref<ToolItemDto[]>([])
const funcOptions = ref<t_wmt_function[]>([])

const targetShopType = ref<ShopType>(ShopType.美团)

const editFormRef = ref<FormInstance>()

const editForm = reactive<ToolForm>({
  id: '',
  Name: '',
  Text: '',
  Points: 0,
  Img: '',
  ShowSiteIcon: true,
  FunctionCodes: [],
  FromShopTypes: [],
  TutorialUrl: '',
  Sort: 1,
  TargetShopType: ShopType.美团,
  Avtag: true
})

const editRules: FormRules = {
  Name: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  Text: [{ required: true, message: '请输入工具描述', trigger: 'blur' }],
  Points: [{ required: true, message: '请输入积分', trigger: 'change' }],
  Img: [{ required: true, message: '请输入图标地址', trigger: 'blur' }],
  TargetShopType: [{ required: true, message: '请选择店铺类型', trigger: 'change' }],
  FunctionCodes: [{ required: true, message: '请选择关联功能', trigger: 'change' }]
}

const getShopTypeName = (shopType: ShopType | null | undefined) => {
  if (shopType === null || shopType === undefined) return ''
  const option = shopTypeOptions.find(item => item.value === shopType)
  return option ? option.label : ''
}

const getFunctionLabel = (code: string) => {
  const match = funcOptions.value.find(item => item.code?.toUpperCase() === code?.toUpperCase())
  if (match) return `${match.name}(${match.code})`
  return code
}

const handleShopTypeChange = (value: ShopType) => {
  targetShopType.value = value
  editForm.TargetShopType = value
  loadFunctionOptions(value)
  loadToolList()
}

const handleEditTargetShopTypeChange = (value: ShopType) => {
  editForm.TargetShopType = value
  loadFunctionOptions(value)
}

const resetEditForm = () => {
  editForm.id = ''
  editForm.Name = ''
  editForm.Text = ''
  editForm.Points = 0
  editForm.Img = ''
  editForm.ShowSiteIcon = true
  editForm.FunctionCodes = []
  editForm.FromShopTypes = []
  editForm.TutorialUrl = ''
  editForm.Sort = 1
  editForm.TargetShopType = targetShopType.value
  editForm.Avtag = true
}

const loadFunctionOptions = async (shopType: ShopType) => {
  await apiManager.functionpriceApi.GetFuncList(shopType).then(res => {
    funcOptions.value = res || []
  })
}

const loadToolList = async () => {
  listLoading.value = true
  await apiManager.toolApi
    .GetList(targetShopType.value)
    .then(res => {
      toolList.value = (res || [])
        .map(item => ({
          ...item,
          Sort: Number.isFinite(item.Sort) ? item.Sort : 0
        }))
        .sort((a, b) => a.Sort - b.Sort)
    })
    .finally(() => {
      listLoading.value = false
    })
}

const handleCreate = () => {
  resetEditForm()
  editDialogVisible.value = true
}

const handleEdit = (row: ToolItemDto) => {
  resetEditForm()
  editForm.id = row.Id
  editForm.Name = row.Name
  editForm.Text = row.Text
  editForm.Points = row.Points
  editForm.Img = row.Img
  editForm.ShowSiteIcon = row.ShowSiteIcon
  editForm.FunctionCodes = row.FunctionCodes ? [...row.FunctionCodes] : []
  editForm.FromShopTypes = row.FromShopTypes ? [...row.FromShopTypes] : []
  editForm.TutorialUrl = row.TutorialUrl
  editForm.Sort = Number.isFinite(row.Sort) ? row.Sort : 0
  editForm.TargetShopType = targetShopType.value
  editForm.Avtag = row.Avtag
  editDialogVisible.value = true
}

const submitEditForm = () => {
  if (!editFormRef.value) return
  editFormRef.value.validate(async valid => {
    if (!valid) return
    editSubmitting.value = true
    const payload: ToolItemUpdateDto = {
      Name: editForm.Name,
      Text: editForm.Text,
      Points: editForm.Points,
      Img: editForm.Img,
      ShowSiteIcon: editForm.ShowSiteIcon,
      FunctionCodes: editForm.FunctionCodes,
      FromShopTypes: editForm.FromShopTypes && editForm.FromShopTypes.length > 0 ? editForm.FromShopTypes : [],
      TutorialUrl: editForm.TutorialUrl,
      Sort: editForm.Sort,
      TargetShopType: editForm.TargetShopType,
      Avtag: editForm.Avtag
    }
    const request = editForm.id
      ? apiManager.toolApi.Update(editForm.id, payload)
      : apiManager.toolApi.Create(payload as ToolItemCreateDto)

    await request.finally(() => {
      editSubmitting.value = false
    })
    editDialogVisible.value = false
    await loadToolList()
  })
}

const handleToggleStatus = async (row: ToolItemDto) => {
  const dto: ToolItemStatusDto = {
    Avtag: row.Avtag
  }
  await apiManager.toolApi.UpdateStatus(row.Id, dto)
  await loadToolList()
}

const handleSaveSort = async (row: ToolItemDto) => {
  const sortValue = Number(row.Sort)
  if (Number.isNaN(sortValue)) {
    throw new Error('排序值无效，请输入数字')
  }
  const dto: ToolItemSortDto = {
    Sort: sortValue
  }
  await apiManager.toolApi.UpdateSort(row.Id, dto)
  await loadToolList()
}

const handleDelete = (row: ToolItemDto) => {
  ElMessageBox.confirm(`确定要删除工具【${row.Name || '未命名'}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await apiManager.toolApi.Delete(row.Id)
    await loadToolList()
  })
}

loadFunctionOptions(targetShopType.value)
loadToolList()
</script>

<style scoped lang="scss">
.tool-box {
  .filter-main {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    .filter-item {
      display: flex;
      align-items: center;

      .filter-label {
        margin-right: 6px;
        white-space: nowrap;
      }

      .filter-select {
        width: 200px;
      }
    }

    .filter-item-right {
      margin-left: auto;
      gap: 10px;
      display: flex;
      align-items: center;
    }
  }

  .func-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .func-tag {
    margin-right: 0;
  }

  .sort-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .form-two-col-row {
    display: flex;
    align-items: flex-start;
  }

  .form-two-col-item {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>
