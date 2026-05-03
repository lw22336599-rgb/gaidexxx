<template>
  <el-table ref="tableRef" :data="list" style="width: 100%" height="calc(100vh - 300px)" v-loading="listLoading"
    @selection-change="handleSelectionChange">
    <el-table-column v-if="funstate == 1" type="selection" width="55" />
    <!-- :header-cell-style="back" -->
    <el-table-column prop="name" label="门店名称" min-width="300">
      <template #default="{ row }">
        <div class="mdname">
          <div class="shop-name" @click="openWindow(row)">
            <img v-if="row.shop_type == 1" style="width: 15px; height: 15px" src="../../../icon/mt.svg" alt="" />
            <img v-if="row.shop_type == 2" style="width: 15px; height: 15px" src="../../../icon/elm.svg" alt="" />
            <span class="shop-name-text" :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>门店ID:<span :class="{ 'blur-text': demoMode }">{{ row.office_id }}</span></span>
            <el-icon style="cursor: pointer; color: #909399; font-size: 14px;" @click.stop="copyOfficeId(row.office_id)"
              title="复制门店ID">
              <DocumentCopy />
            </el-icon>
            <span style="margin-left: 8px;">{{ row.city }}</span>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="state" align="center" min-width="200">
      <template #header>
        <div class="shop-status-header">
          <span class="header-label">营业状态</span>
          <el-dropdown trigger="hover" placement="bottom" class="header-filter-dropdown" @command="handleChangeState">
            <el-button type="primary" size="small" text class="filter-button">
              <el-icon style="margin-right: 4px">
                <Filter />
              </el-icon>
              {{ getStateFilterText() }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="online-filter-menu">
                <el-dropdown-item :command="4" :class="{ 'is-selected': stateFilter === 4 }">
                  营业中
                </el-dropdown-item>
                <el-dropdown-item :command="5" :class="{ 'is-selected': stateFilter === 5 }">
                  停业中
                </el-dropdown-item>
                <el-dropdown-item :command="6" :class="{ 'is-selected': stateFilter === 6 }">
                  上线中
                </el-dropdown-item>
                <el-dropdown-item :command="7" :class="{ 'is-selected': stateFilter === 7 }">
                  已下线
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
      <template #default="{ row }">
        <div>{{ getStateText(row.state) }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="EndTime" label="到期时间" width="200" align="center">
      <template #default="scope">
        <div class="maine">
          <div>{{ formatFuncExpireTime(scope.row.chatendtime) }}</div>
          <div class="xftext" @click="openpay(scope.row)">续费</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="微信号推送" min-width="100" align="center" v-if="funstate == 1">
      <template #default="scope">
        <div class="weichatts">
          <!-- <el-switch
            v-model="scope.row.score"
            class="ml-2"/> -->
          <div class="xftext" @click="sethao(scope.row)">绑定微信号</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="微信群推送" min-width="100" align="center" v-if="funstate == 1">
      <template #default="scope">
        <div class="weichatts">
          <!-- <el-switch
            v-model="scope.row.score"
            class="ml-2"/> -->
          <div class="xftext" @click="setqun(scope.row)">绑定微信群</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="WebHook推送" min-width="120" align="center" v-if="funstate == 1">
      <template #default="scope">
        <div class="weichatts">
          <div class="xftext" @click="setwebhook(scope.row)">绑定WebHook</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="推送开关" width="100" align="center" v-if="funstate == 1">
      <template #default="scope">
        <el-switch v-model="scope.row.chatcheck" class="ml-2" @change="chatpushchang(scope.row)" />
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="180" align="center" v-if="funstate == 1">
      <template #default="scope">
        <div class="action-buttons">
          <div class="xftext" @click="openwro(scope.row)"><vab-icon icon="settings-4-fill" />推送设置</div>
          <div class="xftext" @click="pushDataNow(scope.row)">立即推送</div>
          <div class="xftext" @click="getDailyReport(scope.row)">复制日报</div>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
// import { ArrowRight } from "@element-plus/icons-vue";
// const back = { background: "#DFDFDF" };
// const wechathao = ref(true);
// const wechatqun = ref(true);
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab'
import { useSettingsStore } from '/@/store/modules/settings'
import { openWindow } from '/@/utils/openShopWin.ts'
import { DocumentCopy, Filter } from '@element-plus/icons-vue'

interface TableProps {
  tablelist: any[]
  loadshow: boolean
  funstate: number
}

const emit = defineEmits([
  'setdrawer',
  'setqaddwechat',
  'sethaddwechat',
  'opendio',
  'setpayDialogState',
  'getman',
  'chatpushchang',
  'getfuncdata',
  'changeState',
  'shopSelectionChange'
])
const props = defineProps<TableProps>()

const listLoading = ref<boolean>(false)
const list = ref<any[]>([])
const funstate = computed(() => props.funstate)
const tableRef = ref<any>(null)

const handleSelectionChange = (selectedRows: any[]) => {
  emit('shopSelectionChange', selectedRows)
}

const setSelection = (rows: any[]) => {
  tableRef.value?.toggleRowSelection(rows)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

defineExpose({ setSelection, clearSelection })

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const openwro = (obj: any) => {
  console.log(obj, 'obj')
  emit('opendio', obj)
  emit('getfuncdata', { id: obj.id, type: 1 })
  // emit('setdrawer',true)
}
const setqun = (obj: any) => {
  emit('getman', 2)
  emit('opendio', obj)
  emit('getfuncdata', { id: obj.id, type: 3 })
  // emit('setqaddwechat',true)
}
const sethao = (obj: any) => {
  emit('getman', 1)
  emit('opendio', obj)
  emit('getfuncdata', { id: obj.id, type: 2 })
  // emit('sethaddwechat',true)
}
const setwebhook = (obj: any) => {
  emit('getman', 3)
  emit('opendio', obj)
  // type: 4 预留给专门的 WebHook 配置（目前仅用于加载配置数据）
  emit('getfuncdata', { id: obj.id, type: 4 })
}
const openpay = (obj: any) => {
  // emit('getfuncdata',{id:obj.id,type:1})
  emit('opendio', obj)
  emit('setpayDialogState', true)
}
const chatpushchang = (val: any) => {
  // console.log(val);
  emit('chatpushchang', val)
}

// 营业状态筛选
const stateFilter = ref<number | undefined>(undefined)

// 获取营业状态
const getStateText = (state: number): string => {
  const stateMap: Record<number, string> = {
    4: '营业中',
    5: '暂停营业',
    6: '店铺上线中',
    7: '店铺已下线'
  }
  return stateMap[state] || ''
}

// 获取营业状态筛选显示文本
const getStateFilterText = (): string => {
  if (!stateFilter.value) return '请选择'

  switch (stateFilter.value) {
    case 4:
      return '营业中'
    case 5:
      return '停业中'
    case 6:
      return '上线中'
    case 7:
      return '已下线'
    default:
      return '请选择'
  }
}

// 营业状态筛选改变
const handleChangeState = (value: number | undefined) => {
  stateFilter.value = value
  emit('changeState', value)
}

// 复制门店ID到剪贴板
const copyOfficeId = async (officeId: string) => {
  try {
    await navigator.clipboard.writeText(officeId)
    gp.$baseMessage('门店ID已复制到剪贴板', 'success', 'hey')
  } catch (error) {
    // 如果 clipboard API 不可用，使用备用方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = officeId
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      gp.$baseMessage('门店ID已复制到剪贴板', 'success', 'hey')
    } catch (fallbackError) {
      gp.$baseMessage('复制失败，请手动复制', 'error', 'hey')
    }
  }
}

// 立即推送
const pushDataNow = async (row: any) => {
  try {
    await apiManager.chatPushDataApi.PushDataNow(row.id)
    gp.$baseMessage('推送成功', 'success')
  } catch (error) {
    console.error('立即推送失败:', error)
    // 错误提示已在拦截器中处理
  }
}

// 获取日报并复制到剪贴板
const getDailyReport = async (row: any) => {
  try {
    const data = await apiManager.chatPushDataApi.GetShopYesterdayData(row.id, true)
    // 复制到剪贴板
    await navigator.clipboard.writeText(data)
    gp.$baseMessage('日报已复制到剪贴板', 'success')
  } catch (error) {
    console.error('获取日报失败:', error)
    // 错误提示已在拦截器中处理
  }
}

/**
 * 计算剩余天数和小时数
 * @param timeStr 时间字符串，可能是日期格式或"已到期"等文本
 * @returns 返回"X天Y小时"或"Y小时"或"已到期"或"未购买"
 */
const getRemainingDays = (timeStr: string | undefined | null): string => {
  if (!timeStr || timeStr === '已到期' || timeStr === '未购买') {
    return timeStr || '未购买'
  }

  try {
    const endDate = new Date(timeStr)
    if (isNaN(endDate.getTime())) {
      return '未购买'
    }

    const now = new Date()
    const diffMs = endDate.getTime() - now.getTime()

    if (diffMs < 0) {
      return '已到期'
    }

    // 计算天数
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    // 计算剩余小时数（去除天数后的剩余毫秒数）
    const remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      // 如果有天数，显示"X天Y小时"
      return remainingHours > 0 ? `${diffDays}天${remainingHours}小时` : `${diffDays}天`
    } else if (remainingHours > 0) {
      // 如果只有小时数，显示"Y小时"
      return `${remainingHours}小时`
    } else {
      // 如果连小时都没有（少于1小时），显示"已到期"或"不足1小时"
      return '不足1小时'
    }
  } catch (error) {
    return '未购买'
  }
}

/**
 * 格式化功能到期时间显示
 * @param timeStr 时间字符串
 * @returns 返回格式化的显示文本，如"剩余 X天Y小时"或"已到期"或"未购买"
 */
const formatFuncExpireTime = (timeStr: string | undefined | null): string => {
  const remaining = getRemainingDays(timeStr)
  if (remaining === '已到期' || remaining === '未购买') {
    return `${remaining}`
  }
  return `剩余 ${remaining}`
}
watch(
  props,
  () => {
    listLoading.value = props.loadshow
    list.value = props.tablelist
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.maine {}

.shop-name-row {
  cursor: pointer;
  color: var(--el-color-primary);
  display: inline-flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
}

.xftext {
  color: var(--el-color-primary);
  cursor: pointer;
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

//.weichatts{
//  width: 100%;
//  display: flex;
//  flex-direction: column;
//  justify-content: center;
//  align-items: center;
//}
// .succebox{
//     color: #00BD74;
//     display: flex;
//     align-items: center;
// }
// .succedian{
//     background: #00BD74;
//     width: 5px;
//     height: 5px;
//     border-radius: 50%;
//     margin-right: 5px;
// }
// .errorbox{
//     color: #FE0000;
//     display: flex;
//     align-items: center;
// }
// .errordian{
//     background: #FE0000;
//     width: 5px;
//     height: 5px;
//     border-radius: 50%;
//     margin-right: 5px;
// }
// .see{
//     color: #FE0000;
//     display: flex;
//     align-items: center;
//     .seeicon{
//         margin-left: 3px;
//     }
// }
// .mdname{

// }
// .butlist{
//     // width: 100%;
//     // height: 100%;
//     display: flex;
//     // justify-content: center;
//     align-content: center;
//     font-size: 16px;
//     color: #FE0000;
//     .setbutton{
//         margin-right: 20px;
//     }
// }

.blur-text {
  filter: blur(4px);
  user-select: none;
}

.shop-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.shop-name-text {
  color: var(--el-color-primary);
  font-weight: 600;
}

.shop-status-header {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible !important; // 确保内容可以溢出显示

  .header-label {
    // 保持文字在中心位置，不受右侧按钮影响
    flex: 1;
    text-align: center;
  }

  .header-filter-dropdown {
    position: absolute;
    left: calc(50% + 35px); // 从中心偏右开始，留出"营业状态"文字的空间
    right: 0; // 确保按钮右侧不会超出容器
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    white-space: nowrap;
    overflow: visible !important; // 确保内容不被裁剪
    // 移除 max-width，让按钮可以根据内容自动扩展，向右延伸显示完整文本
  }

  // 确保 Element Plus 的下拉组件和按钮组件没有宽度限制
  :deep(.header-filter-dropdown .el-button) {
    max-width: none !important;
    width: auto !important;
    min-width: auto !important;
  }
}

// 确保表格单元格允许内容溢出
:deep(.el-table__header-wrapper) {
  overflow: visible !important;
}

:deep(.el-table__header th) {
  overflow: visible !important;
}

:deep(.el-table__header .cell) {
  overflow: visible !important;
}

// 筛选按钮样式
.filter-button {
  padding: 4px 8px;
  font-size: 12px;
  width: auto !important;
  min-width: auto !important;
  max-width: none !important; // 不限制最大宽度，让按钮完整显示内容
  white-space: nowrap !important; // 确保文本不换行
  overflow: visible !important; // 确保内容不被裁剪
  display: inline-flex !important; // 确保内容完整显示
  align-items: center !important;
  background-color: #409eff !important;
  color: #fff !important;
  border-color: #409eff !important;

  &:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
    color: #fff !important;
  }

  &:focus {
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
  }

  &:active {
    background-color: #3a8ee6 !important;
    border-color: #3a8ee6 !important;
    color: #fff !important;
  }

  .el-icon {
    font-size: 12px;
    color: #fff !important;
    flex-shrink: 0; // 图标不收缩
  }

  // 确保按钮内的文本完整显示
  span {
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
}

// 确保 Element Plus 按钮组件没有宽度限制
:deep(.header-filter-dropdown .el-button__text) {
  white-space: nowrap !important;
  overflow: visible !important;
}

// 筛选下拉菜单样式
:deep(.online-filter-menu) {
  min-width: 50px;
  width: auto;
  padding: 4px 6px;

  .el-dropdown-menu__item {
    padding: 4px 6px;

    &.is-selected {
      color: var(--el-color-primary);
      font-weight: 500;
      background-color: var(--el-color-primary-light-9);
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style>