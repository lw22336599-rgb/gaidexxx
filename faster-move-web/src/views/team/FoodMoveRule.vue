<template>
  <div class="food-move-rule">
    <vab-card style="margin-bottom: 10px">
      <div class="layout-container">
        <!-- 左侧分组树 -->
        <div class="tree-container">
          <div class="tree-header">
            <span>规则分组</span>
            <el-button type="primary" size="small" @click="handleAddGroup"> 新增分组 </el-button>
          </div>
          <el-tree
            ref="groupTreeRef"
            v-loading="groupLoading"
            :data="groupTreeData"
            :props="treeProps"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleGroupNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="tree-node-label">{{ data.name }}</span>
                <span class="tree-node-actions">
                  <el-button type="text" size="small" @click.stop="handleEditGroup(data)"> 编辑 </el-button>
                  <el-button type="text" size="small" style="color: #f56c6c" @click.stop="handleDeleteGroup(data)">
                    删除
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 右侧规则列表 -->
        <div class="table-container">
          <div class="filter-main">
            <div class="filter-item">
              <span class="filter-label">店铺类型：</span>
              <el-select
                v-model="query.shop_type"
                class="filter-select"
                placeholder="全部"
                size="small"
                clearable
                @change="reloadRuleList"
              >
                <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">事件类型：</span>
              <el-select
                v-model="query.for_evnt"
                class="filter-select"
                placeholder="全部"
                size="small"
                clearable
                @change="reloadRuleList"
              >
                <el-option
                  v-for="item in ruleForEventOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">规则类型：</span>
              <el-select
                v-model="query.ForType"
                class="filter-select"
                placeholder="全部"
                size="small"
                clearable
                @change="reloadRuleList"
              >
                <el-option
                  v-for="item in ruleForTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">规则名称：</span>
              <el-input
                v-model.trim="query.name"
                class="filter-input"
                clearable
                placeholder="输入规则名称搜索"
                size="small"
                @keyup.enter="reloadRuleList"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">启用状态：</span>
              <el-select
                v-model="query.avtag"
                class="filter-select"
                placeholder="全部"
                size="small"
                clearable
                @change="reloadRuleList"
              >
                <el-option label="启用" :value="true" />
                <el-option label="禁用" :value="false" />
              </el-select>
            </div>
            <div class="filter-item">
              <el-button type="danger" size="small" :disabled="selectedRules.length === 0" @click="handleBatchDelete">
                批量删除
              </el-button>
              <el-button type="primary" size="small" @click="handleAddRule"> 新增规则 </el-button>
              <el-button size="small" @click="reloadRuleList"> 刷新 </el-button>
            </div>
          </div>

          <div class="table-scroll">
            <el-table
              v-loading="listLoading"
              :data="ruleList"
              height="calc(100vh - 310px)"
              size="small"
              style="min-width: 100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column type="index" width="60" label="序号" align="center" />
              <el-table-column prop="name" label="规则名称" min-width="140" show-overflow-tooltip />
              <el-table-column label="店铺类型" align="center">
                <template #default="{ row }">
                  {{ getShopTypeName(row.shop_type) }}
                </template>
              </el-table-column>
              <el-table-column label="规则类型" align="center">
                <template #default="{ row }">
                  {{ getRuleForTypeName(row.ForType) }}
                </template>
              </el-table-column>
              <el-table-column label="事件类型" align="center">
                <template #default="{ row }">
                  {{ getRuleForEventName(row.for_evnt) }}
                </template>
              </el-table-column>
              <el-table-column prop="evnt_words" label="事件关键词" min-width="120" show-overflow-tooltip />
              <el-table-column label="关键词正则" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.evnt_reg" type="success" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="设置r_word" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.evnt_set_rword" type="success" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="设置类型" align="center">
                <template #default="{ row }">
                  {{ getEvntSetTypeName(row.evnt_set_type) }}
                </template>
              </el-table-column>
              <el-table-column label="自动保存" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.evnt_set_save" type="success" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="evnt_try" label="重试次数" align="center" />
              <el-table-column prop="r_word_old" label="老字符串" min-width="120" show-overflow-tooltip />
              <el-table-column prop="r_word_new" label="新字符串" min-width="120" show-overflow-tooltip />
              <el-table-column label="字符串正则" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.r_word_reg" type="success" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="str_max_length" label="最大长度" align="center" />
              <el-table-column prop="str_min_length" label="最小长度" align="center" />
              <el-table-column prop="max_val" label="最大值" align="center" />
              <el-table-column prop="min_val" label="最小值" align="center" />
              <el-table-column prop="group_name" label="所属分组" min-width="120" show-overflow-tooltip />
              <el-table-column label="启用状态" width="100" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.avtag"
                    :active-value="true"
                    :inactive-value="false"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    @change="handleToggleRule(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="280" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="text" @click="handleEditRule(row)">编辑</el-button>
                  <el-button type="text" @click="handleConnectGroup(row)">移入分组</el-button>
                  <el-button type="text" @click="handleRemoveGroup(row)">移出分组</el-button>
                  <el-button type="text" style="color: #f56c6c" @click="handleDeleteRule(row)"> 删除 </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pagination-main">
            <el-pagination
              v-model:current-page="query.page"
              v-model:page-size="query.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              background
              layout="total, sizes, prev, pager, next"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </vab-card>

    <!-- 规则编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑商品复制规则' : '新增商品复制规则'"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="130px">
        <el-divider content-position="left">基础信息</el-divider>
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入规则名称" size="small" />
        </el-form-item>
        <el-form-item label="店铺类型" prop="shop_type">
          <el-select v-model="editForm.shop_type" placeholder="请选择店铺类型" size="small">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则类型" prop="ForType">
          <el-select v-model="editForm.ForType" placeholder="请选择规则类型" size="small">
            <el-option v-for="item in ruleForTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="editForm.avtag" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.notes" :rows="2" type="textarea" placeholder="请输入备注信息" size="small" />
        </el-form-item>

        <el-divider content-position="left">事件规则配置</el-divider>
        <!-- 事件类型 & 事件关键词 两列 -->
        <div class="form-two-col-row">
          <el-form-item label="针对事件型" class="form-two-col-item">
            <el-select v-model="editForm.for_evnt" placeholder="请选择事件类型" size="small" clearable>
              <el-option
                v-for="item in ruleForEventOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="事件关键词" class="form-two-col-item">
            <el-input v-model="editForm.evnt_words" placeholder="请输入事件关键词" size="small" />
          </el-form-item>
        </div>
        <!-- 关键词正则匹配 & 设置 r_word 两列 -->
        <div class="form-two-col-row">
          <el-form-item label="关键词正则匹配" class="form-two-col-item">
            <el-switch v-model="editForm.evnt_reg" :active-value="true" :inactive-value="false" />
          </el-form-item>
          <el-form-item label="设置r_word" class="form-two-col-item">
            <el-switch v-model="editForm.evnt_set_rword" :active-value="true" :inactive-value="false" />
          </el-form-item>
        </div>
        <!-- 设置字段类型 & 自动保存到数据库 两列 -->
        <div class="form-two-col-row">
          <el-form-item label="设置字段类型" class="form-two-col-item">
            <el-select v-model="editForm.evnt_set_type" placeholder="请选择设置字段类型" size="small" clearable>
              <el-option
                v-for="item in evntSetValueTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="自动保存到数据库" class="form-two-col-item">
            <el-switch v-model="editForm.evnt_set_save" :active-value="true" :inactive-value="false" />
          </el-form-item>
        </div>
        <el-form-item label="重试次数">
          <el-input-number v-model="editForm.evnt_try" :min="0" :step="1" size="small" />
        </el-form-item>

        <el-divider content-position="left">文本规则配置</el-divider>
        <!-- 老字符串 & 新字符串 两列 -->
        <div class="form-two-col-row">
          <el-form-item label="老字符串" class="form-two-col-item">
            <el-input v-model="editForm.r_word_old" placeholder="请输入要替换的老字符串" size="small" />
          </el-form-item>
          <el-form-item label="新字符串" class="form-two-col-item">
            <el-input v-model="editForm.r_word_new" placeholder="请输入替换后的新字符串" size="small" />
          </el-form-item>
        </div>
        <el-form-item label="字符串替换正则">
          <el-switch v-model="editForm.r_word_reg" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <!-- 字符串最大长度 & 字符串最小长度 两列 -->
        <div class="form-two-col-row">
          <el-form-item label="字符串最大长度" class="form-two-col-item">
            <el-input-number v-model="editForm.str_max_length" :min="0" :step="1" size="small" />
          </el-form-item>
          <el-form-item label="字符串最小长度" class="form-two-col-item">
            <el-input-number v-model="editForm.str_min_length" :min="0" :step="1" size="small" />
          </el-form-item>
        </div>

        <el-divider content-position="left">数字规则配置</el-divider>
        <!-- 数字最大值 & 数字最小值 两列 -->
        <div class="form-two-col-row">
          <el-form-item label="数字最大值" class="form-two-col-item">
            <el-input-number v-model="editForm.max_val" :step="0.01" size="small" clearable />
          </el-form-item>
          <el-form-item label="数字最小值" class="form-two-col-item">
            <el-input-number v-model="editForm.min_val" :step="0.01" size="small" clearable />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="editSubmitting" @click="submitEditForm"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分组编辑对话框 -->
    <el-dialog v-model="groupDialogVisible" :title="groupForm.id ? '编辑分组' : '新增分组'" width="480px">
      <el-form ref="groupFormRef" :model="groupForm" :rules="groupRules" label-width="90px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分组名称" size="small" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="groupForm.notes" :rows="2" type="textarea" placeholder="请输入备注信息" size="small" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="groupDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="groupSubmitting" @click="submitGroupForm"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 移入分组对话框 -->
    <el-dialog v-model="connectGroupDialogVisible" title="移入分组" width="400px">
      <el-form label-width="90px">
        <el-form-item label="选择分组">
          <el-select v-model="selectedGroupId" placeholder="请选择分组" size="small">
            <el-option v-for="group in flatGroupList" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="connectGroupDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitConnectGroup"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { apiManager } from '@/TsModel/Api/ApiManager'
import type { GetFdmvRuleListParmsVo } from '@/TsModel/Alien/Faster/Controllers/FoodMove/GetFdmvRuleListParmsVo'
import type { AddFdmvRuleParmsVo } from '@/TsModel/Alien/Faster/Controllers/FoodMove/AddFdmvRuleParmsVo'
import type { UpdateFdmvRuleParmsVo } from '@/TsModel/Alien/Faster/Controllers/FoodMove/UpdateFdmvRuleParmsVo'
import type { ConnectRuleGroupParmsVo } from '@/TsModel/Alien/Faster/Controllers/FoodMove/ConnectRuleGroupParmsVo'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { RuleForType } from '@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForType'
import { RuleForEvent } from '@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForEvent'
import { EvntRuleSetValueType } from '@/TsModel/Alien/Entity/Function/FOODMOVE/EvntRuleSetValueType'
import { GroupType } from '@/TsModel/Alien/Entity/Enums/GroupType'
import type { t_wmt_fc_fdmv_rule } from '@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_rule'
import type { t_wmt_group } from '@/TsModel/Alien/Entity/Tables/t_wmt_group'
import type { TreeData } from '@/TsModel/Alien/Entity/TreeData'
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo'

defineOptions({
  name: 'FoodMoveRule'
})

interface ShopTypeOption {
  label: string
  value: ShopType
}

interface RuleForTypeOption {
  label: string
  value: RuleForType
}

interface RuleForEventOption {
  label: string
  value: RuleForEvent
}

interface EvntSetValueTypeOption {
  label: string
  value: EvntRuleSetValueType
}

interface QueryState {
  groupId?: string
  shop_type?: ShopType
  for_evnt?: RuleForEvent
  ForType?: RuleForType
  name?: string
  avtag?: boolean
  page: number
  pageSize: number
}

// 响应式状态
const listLoading = ref(false)
const groupLoading = ref(false)
const editDialogVisible = ref(false)
const groupDialogVisible = ref(false)
const connectGroupDialogVisible = ref(false)
const editSubmitting = ref(false)
const groupSubmitting = ref(false)

const ruleList = ref<t_wmt_fc_fdmv_rule[]>([])
const groupTreeData = ref<any[]>([])
const flatGroupList = ref<t_wmt_group[]>([])
const selectedRules = ref<t_wmt_fc_fdmv_rule[]>([])
const selectedGroupId = ref<string>('')
const currentRule = ref<t_wmt_fc_fdmv_rule | null>(null)
const total = ref(0)

const groupTreeRef = ref()
const editFormRef = ref<FormInstance>()
const groupFormRef = ref<FormInstance>()

// 分组树中的“全部分组”虚拟节点 id
const ALL_GROUP_ID = 'ALL_GROUP'

const query = reactive<QueryState>({
  groupId: undefined,
  shop_type: undefined,
  for_evnt: undefined,
  ForType: undefined,
  name: undefined,
  avtag: undefined,
  page: 1,
  pageSize: 20
})

// 店铺类型选项
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

// 规则类型选项
const ruleForTypeOptions: RuleForTypeOption[] = [
  { label: '针对商品标题', value: RuleForType.针对商品标题 },
  { label: '针对商品描述', value: RuleForType.针对商品描述 },
  { label: '针对商品规格名', value: RuleForType.针对商品规格名 },
  { label: '针对打包费', value: RuleForType.针对打包费 },
  { label: '针对商品价格', value: RuleForType.针对商品价格 },
  { label: '针对规格单位', value: RuleForType.针对规格单位 },
  { label: '针对分类名称', value: RuleForType.针对分类名称 },
  { label: '针对分类描述', value: RuleForType.针对分类描述 },
  { label: '针对商品类目', value: RuleForType.针对商品类目 },
  { label: '针对类目属性值', value: RuleForType.针对类目属性值 },
  { label: '针对自定义属性', value: RuleForType.针对自定义属性 },
  { label: '针对商品卖点', value: RuleForType.针对商品卖点 },
  { label: '针对商品库存', value: RuleForType.针对商品库存 }
]

// 事件类型选项
const ruleForEventOptions: RuleForEventOption[] = [
  { label: '商品提交失败出现关键词', value: RuleForEvent.商品提交失败出现关键词 },
  { label: '分组创建失败出现关键词', value: RuleForEvent.分组创建失败出现关键词 }
]

// 事件设置值类型选项
const evntSetValueTypeOptions: EvntSetValueTypeOption[] = [
  { label: '老字符串', value: EvntRuleSetValueType.老字符串 },
  { label: '新字符串', value: EvntRuleSetValueType.新字符串 },
  { label: '字符串最大长度', value: EvntRuleSetValueType.字符串最大长度 },
  { label: '字符串最小长度', value: EvntRuleSetValueType.字符串最小长度 },
  { label: '针对数字最大值', value: EvntRuleSetValueType.针对数字最大值 },
  { label: '针对数字最小值', value: EvntRuleSetValueType.针对数字最小值 },
  { label: '老字符串并新正则', value: EvntRuleSetValueType.老字符串并新正则 },
  { label: '强制推荐类目', value: EvntRuleSetValueType.强制推荐类目 }
]

// 编辑表单
const editForm: any = reactive({
  name: '',
  shop_type: ShopType.美团,
  for_evnt: undefined,
  evnt_words: undefined,
  evnt_reg: undefined,
  evnt_set_rword: undefined,
  evnt_set_type: undefined,
  evnt_set_save: undefined,
  evnt_try: undefined,
  ForType: RuleForType.针对商品标题,
  r_word_old: undefined,
  r_word_new: undefined,
  r_word_reg: undefined,
  str_max_length: undefined,
  str_min_length: undefined,
  max_val: undefined,
  min_val: undefined,
  group: undefined,
  group_name: undefined,
  notes: '',
  id: '',
  avtag: true
})

const editRules: FormRules = {
  shop_type: [{ required: true, message: '请选择店铺类型', trigger: 'change' }],
  ForType: [{ required: true, message: '请选择规则类型', trigger: 'change' }]
}

// 分组表单
const groupForm = reactive<Partial<t_wmt_group>>({
  id: '',
  name: '',
  notes: '',
  type: GroupType.商品复制规则分组,
  user: '',
  avtag: true
})

const groupRules: FormRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
}

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

/** 获取店铺类型名称 */
const getShopTypeName = (shopType: ShopType | null | undefined) => {
  if (shopType === null || shopType === undefined) return ''
  const option = shopTypeOptions.find(item => item.value === shopType)
  return option ? option.label : ''
}

/** 获取规则类型名称 */
const getRuleForTypeName = (forType: RuleForType | null | undefined) => {
  if (forType === null || forType === undefined) return ''
  const option = ruleForTypeOptions.find(item => item.value === forType)
  return option ? option.label : ''
}

/** 获取事件类型名称 */
const getRuleForEventName = (forEvent: RuleForEvent | null | undefined) => {
  if (forEvent === null || forEvent === undefined) return ''
  const option = ruleForEventOptions.find(item => item.value === forEvent)
  return option ? option.label : ''
}

/** 获取事件设置类型名称 */
const getEvntSetTypeName = (setType: EvntRuleSetValueType | null | undefined) => {
  if (setType === null || setType === undefined) return ''
  const option = evntSetValueTypeOptions.find(item => item.value === setType)
  return option ? option.label : ''
}

/** 将 TreeData 转换为 el-tree 可用的格式 */
const convertTreeData = (nodes: TreeData<t_wmt_group>[]): any[] => {
  return nodes.map(node => {
    const converted: any = {
      ...node.Member,
      children: node.children && node.children.length > 0 ? convertTreeData(node.children) : []
    }
    return converted
  })
}

/** 加载分组树 */
const loadGroupTree = async () => {
  groupLoading.value = true
  try {
    // 由于后端统一返回 { Success, code, message, data } 包装，这里需要做一层兼容解包
    const rawResult = (await apiManager.groupApi.GetGroups(GroupType.商品复制规则分组, true, undefined)) as any

    // 兼容两种情况：直接返回数组 或 包装在 data 字段中
    const sourceTreeData: TreeData<t_wmt_group>[] = Array.isArray(rawResult) ? rawResult : rawResult?.data || []

    // 转换 TreeData 为 el-tree 可用的格式
    const convertedTree = convertTreeData(sourceTreeData || [])

    // 在最外层包一层“全部分组”虚拟根节点，点击表示不过滤分组
    groupTreeData.value = [
      {
        id: ALL_GROUP_ID,
        name: '全部分组',
        children: convertedTree
      }
    ]

    // 展平分组列表用于下拉选择
    const flattenGroups = (nodes: any[]): t_wmt_group[] => {
      const list: t_wmt_group[] = []
      nodes.forEach(node => {
        // 跳过“全部分组”虚拟节点，只保留真实分组用于下拉选择
        if (node.id !== ALL_GROUP_ID) {
          list.push(node)
        }
        if (node.children && node.children.length > 0) {
          list.push(...flattenGroups(node.children))
        }
      })
      return list
    }
    flatGroupList.value = flattenGroups(convertedTree)
  } finally {
    groupLoading.value = false
  }
}

/** 获取规则列表 */
const getRuleList = async () => {
  listLoading.value = true
  try {
    const parms: GetFdmvRuleListParmsVo = {
      groupId: query.groupId,
      shop_type: query.shop_type,
      for_evnt: query.for_evnt,
      ForType: query.ForType,
      name: query.name,
      avtag: query.avtag,
      page: query.page,
      pageSize: query.pageSize
    }
    // 兼容后端统一返回 { Success, code, message, data } 的包装结构
    const rawResult = (await apiManager.fdmvruleApi.GetRuleList(parms)) as any
    const result: PageResultVo<t_wmt_fc_fdmv_rule> = (rawResult &&
      (rawResult.data || rawResult)) as PageResultVo<t_wmt_fc_fdmv_rule>
    ruleList.value = result?.rows || []
    total.value = result?.total || 0
  } finally {
    listLoading.value = false
  }
}

/** 刷新规则列表 */
const reloadRuleList = () => {
  query.page = 1
  getRuleList()
}

/** 分页切换 */
const handlePageChange = (page: number) => {
  query.page = page
  getRuleList()
}

/** 每页条数切换 */
const handleSizeChange = (size: number) => {
  query.pageSize = size
  query.page = 1
  getRuleList()
}

/** 表格选择变化 */
const handleSelectionChange = (selection: t_wmt_fc_fdmv_rule[]) => {
  selectedRules.value = selection
}

/** 分组节点点击 */
const handleGroupNodeClick = (data: any) => {
  if (data && data.id && data.id !== ALL_GROUP_ID) {
    query.groupId = data.id
  } else {
    query.groupId = undefined
  }
  reloadRuleList()
}

/** 重置编辑表单 */
const resetEditForm = () => {
  editForm.id = ''
  editForm.name = ''
  editForm.shop_type = ShopType.美团
  editForm.for_evnt = undefined
  editForm.evnt_words = undefined
  editForm.evnt_reg = undefined
  editForm.evnt_set_rword = undefined
  editForm.evnt_set_type = undefined
  editForm.evnt_set_save = undefined
  editForm.evnt_try = undefined
  editForm.ForType = RuleForType.针对商品标题
  editForm.r_word_old = undefined
  editForm.r_word_new = undefined
  editForm.r_word_reg = undefined
  editForm.str_max_length = undefined
  editForm.str_min_length = undefined
  editForm.max_val = undefined
  editForm.min_val = undefined
  editForm.group = undefined
  editForm.group_name = undefined
  editForm.notes = ''
  editForm.avtag = true
}

/** 新增规则 */
const handleAddRule = () => {
  resetEditForm()
  editDialogVisible.value = true
}

/** 编辑规则 */
const handleEditRule = (row: t_wmt_fc_fdmv_rule) => {
  editForm.id = row.id
  editForm.name = row.name || ''
  editForm.shop_type = row.shop_type
  editForm.for_evnt = row.for_evnt ?? undefined
  editForm.evnt_words = row.evnt_words ?? undefined
  editForm.evnt_reg = row.evnt_reg ?? undefined
  editForm.evnt_set_rword = row.evnt_set_rword ?? undefined
  editForm.evnt_set_type = row.evnt_set_type ?? undefined
  editForm.evnt_set_save = row.evnt_set_save ?? undefined
  editForm.evnt_try = row.evnt_try ?? undefined
  editForm.ForType = row.ForType
  editForm.r_word_old = row.r_word_old ?? undefined
  editForm.r_word_new = row.r_word_new ?? undefined
  editForm.r_word_reg = row.r_word_reg ?? undefined
  editForm.str_max_length = row.str_max_length ?? undefined
  editForm.str_min_length = row.str_min_length ?? undefined
  editForm.max_val = row.max_val ?? undefined
  editForm.min_val = row.min_val ?? undefined
  editForm.group = row.group ?? undefined
  editForm.group_name = row.group_name ?? undefined
  editForm.notes = row.notes
  editForm.avtag = row.avtag
  editDialogVisible.value = true
}

/** 提交编辑表单 */
const submitEditForm = () => {
  if (!editFormRef.value) return
  editFormRef.value.validate(async valid => {
    if (!valid) return
    editSubmitting.value = true
    try {
      if (editForm.id) {
        const updateParms: UpdateFdmvRuleParmsVo = {
          id: editForm.id,
          avtag: editForm.avtag || false,
          name: editForm.name,
          shop_type: editForm.shop_type,
          for_evnt: editForm.for_evnt,
          evnt_words: editForm.evnt_words,
          evnt_reg: editForm.evnt_reg,
          evnt_set_rword: editForm.evnt_set_rword,
          evnt_set_type: editForm.evnt_set_type,
          evnt_set_save: editForm.evnt_set_save,
          evnt_try: editForm.evnt_try,
          ForType: editForm.ForType,
          r_word_old: editForm.r_word_old,
          r_word_new: editForm.r_word_new,
          r_word_reg: editForm.r_word_reg,
          str_max_length: editForm.str_max_length,
          str_min_length: editForm.str_min_length,
          max_val: editForm.max_val,
          min_val: editForm.min_val,
          group: editForm.group,
          group_name: editForm.group_name,
          notes: editForm.notes
        }
        await apiManager.fdmvruleApi.UpdateRule(updateParms)
      } else {
        await apiManager.fdmvruleApi.AddRule(editForm)
      }
      editDialogVisible.value = false
      await getRuleList()
    } finally {
      editSubmitting.value = false
    }
  })
}

/** 启用/禁用规则 */
const handleToggleRule = async (row: t_wmt_fc_fdmv_rule) => {
  const currentValue = row.avtag
  try {
    const updateParms: UpdateFdmvRuleParmsVo = {
      id: row.id,
      avtag: currentValue,
      name: row.name,
      shop_type: row.shop_type,
      for_evnt: row.for_evnt,
      evnt_words: row.evnt_words,
      evnt_reg: row.evnt_reg,
      evnt_set_rword: row.evnt_set_rword,
      evnt_set_type: row.evnt_set_type,
      evnt_set_save: row.evnt_set_save,
      evnt_try: row.evnt_try,
      ForType: row.ForType,
      r_word_old: row.r_word_old,
      r_word_new: row.r_word_new,
      r_word_reg: row.r_word_reg,
      str_max_length: row.str_max_length,
      str_min_length: row.str_min_length,
      max_val: row.max_val,
      min_val: row.min_val,
      group: row.group,
      group_name: row.group_name,
      notes: row.notes
    }
    await apiManager.fdmvruleApi.UpdateRule(updateParms)
  } catch {
    row.avtag = !currentValue
  }
}

/** 删除规则 */
const handleDeleteRule = (row: t_wmt_fc_fdmv_rule) => {
  ElMessageBox.confirm(`确定要删除规则【${row.name || '未命名'}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await apiManager.fdmvruleApi.DeleteRule(row.id)
    await getRuleList()
  })
}

/** 批量删除规则 */
const handleBatchDelete = () => {
  if (selectedRules.value.length === 0) return
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRules.value.length} 条规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRules.value.map(item => item.id)
    await apiManager.fdmvruleApi.DeleteRules(ids)
    await getRuleList()
  })
}

/** 移入分组 */
const handleConnectGroup = (row: t_wmt_fc_fdmv_rule) => {
  currentRule.value = row
  selectedGroupId.value = row.group || ''
  connectGroupDialogVisible.value = true
}

/** 提交移入分组 */
const submitConnectGroup = async () => {
  if (!currentRule.value || !selectedGroupId.value) return
  const parms: ConnectRuleGroupParmsVo = {
    ruleIds: [currentRule.value.id],
    groupId: selectedGroupId.value
  }
  await apiManager.fdmvruleApi.ConnectGroup(parms)
  connectGroupDialogVisible.value = false
  await getRuleList()
}

/** 移出分组 */
const handleRemoveGroup = (row: t_wmt_fc_fdmv_rule) => {
  if (!row.group) {
    return
  }
  ElMessageBox.confirm(`确定要将规则【${row.name || '未命名'}】移出分组吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const parms: ConnectRuleGroupParmsVo = {
      ruleIds: [row.id],
      groupId: row.group!
    }
    await apiManager.fdmvruleApi.RemoveGroup(parms)
    await getRuleList()
  })
}

/** 新增分组 */
const handleAddGroup = () => {
  groupForm.id = ''
  groupForm.name = ''
  groupForm.notes = ''
  groupDialogVisible.value = true
}

/** 编辑分组 */
const handleEditGroup = (data: any) => {
  if (!data) return
  groupForm.id = data.id
  groupForm.name = data.name
  groupForm.notes = data.notes
  groupDialogVisible.value = true
}

/** 提交分组表单 */
const submitGroupForm = () => {
  if (!groupFormRef.value) return
  groupFormRef.value.validate(async valid => {
    if (!valid) return
    groupSubmitting.value = true
    try {
      const formData: t_wmt_group = {
        id: groupForm.id || '',
        name: groupForm.name || '',
        notes: groupForm.notes || '',
        type: GroupType.商品复制规则分组,
        user: groupForm.user || '',
        avtag: true,
        crtim: undefined,
        uptim: undefined
      }
      if (groupForm.id) {
        await apiManager.groupApi.UpdateGroup(formData)
      } else {
        await apiManager.groupApi.AddGroup(formData)
      }
      groupDialogVisible.value = false
      await loadGroupTree()
    } finally {
      groupSubmitting.value = false
    }
  })
}

/** 删除分组 */
const handleDeleteGroup = (data: any) => {
  if (!data) return
  ElMessageBox.confirm(`确定要删除分组【${data.name}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await apiManager.groupApi.DeleteGroup(data.id)
    await loadGroupTree()
  })
}

// 初始化加载数据
loadGroupTree()
getRuleList()
</script>

<style scoped lang="scss">
.food-move-rule {
  .layout-container {
    display: flex;
    gap: 10px;

    .tree-container {
      width: 260px;
      min-width: 260px;
      max-width: 260px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 10px;
      background-color: #fff;

      .tree-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;

        span {
          font-weight: bold;
          font-size: 14px;
        }
      }

      .tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;

        .tree-node-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tree-node-actions {
          width: 90px; // 固定按钮区域宽度，避免布局抖动
          text-align: right;
          visibility: hidden; // 默认隐藏但保留空间
        }

        &:hover .tree-node-actions {
          visibility: visible; // 悬停时仅改变可见性，不改变布局
        }
      }
    }

    .table-container {
      flex: 1;
      // 允许在 flex 布局中根据父级宽度收缩，避免内容把父容器撑宽
      min-width: 0;

      .filter-main {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;

        .filter-item {
          display: flex;
          align-items: center;

          .filter-label {
            margin-right: 6px;
            white-space: nowrap;
          }

          .filter-select {
            width: 140px;
          }

          .filter-input {
            width: 180px;
          }
        }

        .filter-item-right {
          margin-left: auto;
          gap: 10px;
        }
      }

      .table-scroll {
        width: 100%;
        overflow-x: auto;

        // 表格宽度随列内容撑开，列多时可以横向滚动查看“操作”列
        :deep(.el-table) {
          width: max-content;
          min-width: 100%;
        }

        // 紧凑表格展示：缩小单元格与表头内边距和字体
        :deep(.el-table .cell) {
          padding: 4px 8px;
          font-size: 12px;
        }

        :deep(.el-table__header .cell) {
          padding: 6px 8px;
          font-size: 12px;
        }

        :deep(.el-table__row) {
          height: 32px;
        }
      }
    }
  }

  .pagination-main {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }

  .form-two-col-row {
    display: flex;
    align-items: flex-start;

    margin-bottom: 0; // 行间距仍然由 el-form-item 自己控制
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
