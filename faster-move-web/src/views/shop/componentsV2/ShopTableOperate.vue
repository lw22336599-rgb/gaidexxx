<template>
  <div class="shop-table w-table">
    <!-- 隐藏首页tab切换栏，直接显示门店列表 -->
    <el-tabs v-show="false" v-model="activetab_func" @tab-remove="removetab_func">
      <el-tab-pane v-for="(item, k) in listtabs_func" :key="item.name" :closable="item.name != 1" :label="item.label"
        :name="item.name">
        <template #label>
          <span>
            <span>{{ item.label }}</span>
            <vab-icon v-show="item.label != '首页'"
              :icon="item.muted == 1 ? 'notification-off-fill' : 'notification-4-fill'"
              @click.stop="setMute(k, item)" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 这是多开店铺的店铺后台显示区域 -->
    <div v-show="activetab_func != 1 && activwebv.length > 0">
      <div v-for="item in activwebv" v-show="activetab_func === item.id" :key="item.id"
        style="width: 100%; height: calc(100vh - 360px)">
        <webview :id="'webview' + item.id" allowpopups="true" allowtransparency="true" nodeintegration="true"
          :partition="'persist:webview_' + item.id" plugins="true" :src="item.shop_type === 1
            ? 'https://e.waimai.meituan.com'
            : item.shop_type == 3
              ? 'https://shangoue.meituan.com'
              : item.shop_type == 4
                ? 'https://yiyao.meituan.com/main/frame'
                : item.shop_type === 2
                  ? 'https://melody.shop.ele.me/app/shop/' + item.office_id + '/dashboard#app.shop.dashboard'
                  : item.shop_type == 6
                    ? 'https://store.jddj.com'
                    : item.shop_type == 5
                      ? 'https://nr.ele.me'
                      : item.shop_type == 7
                        ? 'https://jsls.jinritemai.com'
                        : item.shop_type == 1000
                          ? 'https://ecom.meituan.com/meishi/'
                          : item.shop_type == 1001
                            ? 'https://store.jddj.com'
                            : ''
            " style="height: 100%; width: 100%"
          useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
          webpreferences="nativeWindowOpen=yes, spellcheck=no, contextIsolation=no" />
      </div>
    </div>
    <el-table v-if="activetab_func == 1" ref="tableRef" v-loading="listLoading" :border="border"
      :cell-class-name="cellClassName" :data="props.shopList" :header-cell-class-name="headerCellClassName"
      :max-height="'calc(100vh - 240px)'" :size="lineHeight" :stripe="stripe"
      @selection-change="handleBatchSelectionChange" @sort-change="handleSortChange">
      <!-- 批量续费模式的选择列 -->
      <el-table-column v-if="props.batchRenewMode" type="selection" width="55" fixed="left" />
      <el-table-column v-for="(item, index) in finallyColumns" :key="index" :align="item.align"
        class="shop-table-item-cell" :fixed="item.fixed" :label="item.label" :min-width="item.minWidth || 100"
        :prop="item.prop" show-overflow-tooltip :sortable="item.sortable">
        <!--      :render-header="renderHeader"-->
        <template #header>
          <!-- 门店基本信息筛选（营业状态） -->
          <div v-if="item.label === '门店基本信息'" class="shop-info-header basic-info-header is-operational">
            <div class="header-content">
              <span class="header-label">门店基本信息</span>
              <el-dropdown trigger="hover" placement="bottom" class="header-filter-dropdown operational-filter"
                @command="handleBasicInfoFilter">
                <el-button type="primary" size="small" text class="filter-button">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getBasicInfoFilterText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="basic-info-filter-menu">
                    <el-dropdown-item :command="'全部'" :class="{ 'is-selected': !basicInfoFilter }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="'营业中'" :class="{ 'is-selected': basicInfoFilter === '营业中' }">
                      营业中
                    </el-dropdown-item>
                    <el-dropdown-item :command="'停业中'" :class="{ 'is-selected': basicInfoFilter === '停业中' }">
                      停业中
                    </el-dropdown-item>
                    <el-dropdown-item :command="'上线中'" :class="{ 'is-selected': basicInfoFilter === '上线中' }">
                      上线中
                    </el-dropdown-item>
                    <el-dropdown-item :command="'已下线'" :class="{ 'is-selected': basicInfoFilter === '已下线' }">
                      已下线
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>


          <!-- 实时指标列：仅点击排序图标才触发排序 -->
          <div v-else-if="['实时收入', '有效订单', '曝光人数', '入店转化率', '下单转化率', '客单价'].includes(item.label)"
            class="shop-info-header">
            <div class="header-content realtime-sort-header" @click.stop>
              <span class="header-label">{{ item.label }}</span>
              <span class="realtime-sort-icons">
                <el-icon class="sort-icon"
                  :class="{ active: metricSort.prop === item.prop && metricSort.order === 'asc' }"
                  @click.stop="toggleMetricSort(item.prop, 'asc')">
                  <CaretTop />
                </el-icon>
                <el-icon class="sort-icon"
                  :class="{ active: metricSort.prop === item.prop && metricSort.order === 'desc' }"
                  @click.stop="toggleMetricSort(item.prop, 'desc')">
                  <CaretBottom />
                </el-icon>
              </span>
            </div>
          </div>

          <!-- 授权状态筛选 -->
          <div v-if="item.label === '授权状态'" class="shop-info-header auth-status-header is-operational">
            <div class="header-content">
              <span class="header-label">授权状态</span>
              <el-dropdown trigger="hover" placement="bottom"
                class="header-filter-dropdown auth-status-filter operational-filter" @command="handleAuthStatusFilter">
                <el-button type="primary" size="small" text class="filter-button">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getAuthStatusFilterText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="basic-info-filter-menu">
                    <el-dropdown-item :command="'全部'" :class="{ 'is-selected': !authStatusFilter }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="'授权正常'" :class="{ 'is-selected': authStatusFilter === '授权正常' }">
                      授权正常
                    </el-dropdown-item>
                    <el-dropdown-item :command="'授权异常'" :class="{ 'is-selected': authStatusFilter === '授权异常' }">
                      授权异常
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 门店分组筛选 -->
          <div v-if="item.label === '门店分组'" class="shop-info-header group-header is-operational">
            <div class="header-content">
              <span class="header-label">门店分组</span>
              <el-dropdown trigger="hover" placement="bottom"
                class="header-filter-dropdown group-filter operational-filter" @command="handleGroupFilter">
                <el-button type="primary" size="small" text class="filter-button">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getGroupFilterText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="basic-info-filter-menu">
                    <el-dropdown-item :command="'全部'" :class="{ 'is-selected': !groupFilter }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item v-for="group in flatGroupOptions" :key="group.value" :command="group.label"
                      :class="{ 'is-selected': groupFilter === group.label }">
                      {{ group.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div v-if="item.label === '操作'">
            <span style="margin-right: 10px">操作</span><el-popover popper-class="custom-table-checkbox">
              <template #reference>
                <el-button>
                  <vab-icon icon="settings-line" />
                </el-button>
              </template>
              <el-checkbox-group v-model="checkList">
                <el-checkbox v-for="columnItem in columns" :key="columnItem.label" :disabled="columnItem.disableCheck"
                  :label="columnItem.label" :value="columnItem.label">
                  {{ columnItem.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-popover>
          </div>
        </template>
        <template #default="{ row }">
          <div class="shop-info-cell" v-if="item.label === '门店基本信息'">
            <!-- 店铺卡片容器 -->
            <div class="item-shop">
              <!-- 门店头像LOGO -->
              <div class="item-avatar">
                <el-popover placement="top-start">
                  <el-image :src="row.img" :class="{ 'blur-image': demoMode }" />
                  <template #reference>
                    <div style="position: relative">
                      <el-image :src="row.img" style="width: 80px; height: 80px; border-radius: 4px;"
                        :class="{ 'blur-image': demoMode }" />
                    </div>
                  </template>
                </el-popover>
                <div class="avatar-action-btn" @click="copytext(row)">复制日报</div>
              </div>
              <div class="item-right">
                <div class="item-name" @click="openWindow(row)">
                  <PlatformIcon class="logo" :shop-type="row.shop_type" :size="20" />
                  <div class="name-text" :class="{ 'blur-text': demoMode }">{{ row.name }}</div>
                </div>
                <!-- 城市与月售 -->
                <div class="item-business-info">
                  <div class="business-item">
                    城市：{{ row.city || '暂无' }}
                  </div>
                  <div class="business-item">月售：{{ row.extra_data?.month_sale || '暂无' }}</div>
                </div>
                <!-- 门店ID和营业状态一排显示 -->
                <div class="item-id-state-row">
                  <div class="item-office-id" style="display: flex; align-items: center; gap: 4px;">
                    <span :class="{ 'blur-text': demoMode }">门店ID：{{ row.office_id }}</span>
                    <el-icon style="cursor: pointer; color: #909399; font-size: 13px;"
                      @click.stop="copyOfficeId(row.office_id)" title="复制门店ID">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                  <!-- 竖线分隔 -->
                  <div class="divider-line"></div>
                  <!-- 营业状态 -->
                  <div class="item-shop-state" v-if="row.state !== 3">
                    <vab-icon icon="award-fill"
                      :style="`color: ${row.state === 4 ? 'rgb(238, 145, 63)' : '#909399'}`" />
                    <span v-if="row.state === 4" class="shop-state">营业中</span>
                    <span v-if="row.state === 5" class="shop-state round-icon">停业中</span>
                    <span v-if="row.state === 6" class="shop-state round-icon">上线中</span>
                    <span v-if="row.state === 7" class="shop-state round-icon">已下线</span>
                  </div>
                </div>
                <div class="item-remark" @click="updateNotes(row)">
                  门店备注：<span :class="{ 'blur-text': demoMode }">{{ row.notes || '暂无' }}</span>
                  <span class="edit-hint">修改</span>
                </div>
              </div>
            </div>
            <img v-if="row ? row.is_top : false" class="top-up-img" src="/@/assets/shop_images/icon_001.png" />
          </div>
          <div v-if="item.label === '门店分组'" class="group-cell-wrapper">
            <!-- 直接显示选择框，不使用编辑模式，参考团队管理页面的逻辑 -->
            <el-select :model-value="getGroupIdByName(row.group_name)" placeholder="选择分组" size="default" clearable
              class="group-select-compact"
              :key="`group-select-${row.id}-${row.group_name || 'empty'}-${flatGroupOptions.length}`"
              @change="(value: any) => handleGroupChange(row, value)">
              <el-option v-for="group in flatGroupOptions" :key="group.value" :label="group.label"
                :value="String(group.value)">
              </el-option>
            </el-select>
            <div class="group-expire-text">
              功能{{ formatFuncExpireTime(row.EndTime) }}
            </div>
            <!-- 美团餐饮、美团闪购、京东到家才显示运营版续费按钮（饿了么无运营版） -->
            <div v-if="props.shopType === ShopType.美团 || props.shopType === ShopType.美团闪购 || props.shopType === ShopType.京东到家" class="group-renew-btn"
              @click="payFunShow(row, 'APP数据服务')">
              运营版续费
            </div>
          </div>
          <div v-if="item.label === '授权状态'">
            <div class="auth-status-container">
              <div class="auth-status-row">
                <span class="auth-prefix-label">
                  {{ isEleCopyShopType ? 'API授权：' : '插件授权：' }}
                </span>
                <div class="auth-buttons">
                  <el-button :type="row.state == 3 ? 'danger' : 'success'" size="small" plain
                    :class="{ 'auth-normal-btn': row.state != 3, 'auth-error-btn': row.state == 3 }">
                    {{ row.state == 3 ? '授权异常' : '授权正常' }}
                  </el-button>
                  <span class="auth-time-inline">{{ formatAuthTime(row.ck_uptime) }}</span>
                </div>
              </div>
              <div v-if="hasApiAuth" class="auth-status-row" style="margin-top: 4px;">
                <span class="auth-prefix-label">API授权：</span>
                <div class="auth-buttons">
                  <el-button v-if="row.api_state == null" type="info" size="small" plain class="auth-normal-btn">
                    未授权
                  </el-button>
                  <el-button v-else :type="row.api_state == 3 ? 'danger' : 'success'" size="small" plain
                    :class="{ 'auth-normal-btn': row.api_state != 3, 'auth-error-btn': row.api_state == 3 }">
                    {{ row.api_state == 3 ? '授权异常' : '授权正常' }}
                  </el-button>
                  <span class="auth-time-inline">{{ formatAuthTime(row.api_extime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="item.label === '实时收入'">
            <div style="font-weight: 500; font-size: 22px; color: #000">
              {{ row.extra_data.income == -1 ? 0 : (isNaN(row.extra_data.income) ? 0 : row.extra_data.income) }}
            </div>
            <div style="font-size: 14px; color: #999999">比昨日同时段：</div>
            <div :style="getCompareStyle(row.extra_data.income_y)" class="compare-data">
              {{ cutOfday(row.extra_data.income, row.extra_data.income_y) }}
            </div>
          </div>
          <div v-if="item.label === '有效订单'">
            <div style="font-weight: 500; font-size: 22px; color: #000">
              {{ row.extra_data.order_num == -1 ? 0 : (isNaN(row.extra_data.order_num) ? 0 : row.extra_data.order_num)
              }}
            </div>
            <div style="font-size: 14px; color: #999999">比昨日同时段：</div>
            <div :style="getCompareStyle(row.extra_data.order_num_y)" class="compare-data">
              {{ cutOfday(row.extra_data.order_num, row.extra_data.order_num_y) }}
            </div>
          </div>
          <div v-if="item.label === '曝光人数'">
            <div style="font-weight: 500; font-size: 22px; color: #000">
              {{ row.extra_data.show_num == -1 ? '暂无' : row.extra_data.show_num }}
            </div>
            <div style="font-size: 14px; color: #999999">比昨日同时段：</div>
            <div :style="getCompareStyle(row.extra_data.show_y)" class="compare-data">
              {{ cutOfday(row.extra_data.show_num, row.extra_data.show_y) }}
            </div>
          </div>
          <div v-if="item.label === '入店转化率'">
            <div style="font-weight: 500; font-size: 22px; color: #000">
              {{ row.extra_data.in_ratio == -1 ? '暂无' : formatRatioValue(row.extra_data.in_ratio, row.shop_type) }}
            </div>
            <div style="font-size: 14px; color: #999999">比昨日同时段：</div>
            <div :style="getCompareStyle(row.extra_data.in_ratio_y)" class="compare-data">
              {{ formatPercentage(row.extra_data.in_ratio_y, true, !isMeituanShopType(row.shop_type)) }}
            </div>
          </div>
          <div v-if="item.label === '下单转化率'">
            <div style="font-weight: 500; font-size: 22px; color: #000">
              {{ row.extra_data.order_ratio == -1 ? '暂无' : formatRatioValue(row.extra_data.order_ratio, row.shop_type) }}
            </div>
            <div style="font-size: 14px; color: #999999">比昨日同时段：</div>
            <div :style="getCompareStyle(row.extra_data.order_ratio_y)" class="compare-data">
              {{ formatPercentage(row.extra_data.order_ratio_y, true, !isMeituanShopType(row.shop_type)) }}
            </div>
          </div>
          <div v-if="item.label === '客单价'">
            <div style="font-weight: 500; font-size: 22px; color: #000">
              {{ row.extra_data.avg_income == -1 ? '暂无' : (isNaN(row.extra_data.avg_income) ? 0 :
                row.extra_data.avg_income)
              }}
            </div>
            <div style="font-size: 14px; color: #999999">比昨日同时段：</div>
            <div :style="getCompareStyle(row.extra_data.avg_income_y)" class="compare-data">
              {{ cutOfday(row.extra_data.avg_income, row.extra_data.avg_income_y) }}
            </div>
          </div>
          <div v-if="item.label === '推广详情'" style="display: flex; align-items: center; gap: 0px">
            <div style="font-size: 14px; opacity: 0.7">
              <div class="tg-column">推广曝光量：{{ row.extra_data.ad_show_num || '0' }}</div>
              <div class="tg-column">推广进店量：{{ row.extra_data.ad_in_num || '0' }}</div>
              <div class="tg-column">
                进店率：{{ row.extra_data.ad_in_ratio || '0' }}
                <span v-if="row.extra_data && row.extra_data.ad_in_ratio">%</span>
              </div>
              <div class="tg-column">单次进店成本：{{ row.extra_data.ad_in_cost || '0' }}</div>
            </div>
            <div style="font-size: 14px; color: #999999">
              <div class="tg-column">
                比昨日：<span :style="getCompareStyle(row.extra_data.ad_show_num_y)">{{
                  cutOfday(row.extra_data.ad_show_num, row.extra_data.ad_show_num_y)
                }}</span>
              </div>
              <div class="tg-column">
                比昨日：<span :style="getCompareStyle(row.extra_data.ad_in_num_y)">{{
                  cutOfday(row.extra_data.ad_in_num, row.extra_data.ad_in_num_y)
                }}</span>
              </div>
              <div class="tg-column">
                比昨日：<span :style="getCompareStyle(row.extra_data.ad_in_ratio_y)">{{
                  cutOfday(row.extra_data.ad_in_ratio, row.extra_data.ad_in_ratio_y)
                }}</span>
              </div>
              <div class="tg-column">
                比昨日：<span :style="getCompareStyle(row.extra_data.ad_in_cost_y)">{{
                  cutOfday(row.extra_data.ad_in_cost, row.extra_data.ad_in_cost_y)
                }}</span>
              </div>
            </div>
          </div>
          <div v-if="item.label === '点金推广'">
            <div>当前消耗：{{ row.extra_data.ad_pay }}</div>
            <div> 今日预算： {{ row.extra_data.ad_budget }}</div>
            <div>推广余额：{{ row.extra_data.ad_balance }}</div>
          </div>
          <div v-if="item.label === '当前点金出价'" class="ad-bid-container">
            <el-input-number v-model="row.extra_data.ad_bid" :min="0" :step="0.1" class="ad-bid-input" />
            <el-button type="primary" size="small" @click="saveAdBid(row)" style="margin-top: 8px">保存</el-button>
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty class="vab-data-empty" description="暂无数据" />
      </template>
    </el-table>
    <vab-pagination :current-page="props.page" :page-size="props.pageSize" :total="props.total"
      @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    <!-- 单店续费弹窗（与多开续费相同样式的卡片） -->
    <pay-dialog v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="payTypeText"
      :shop-data="shopData" @close-dialog="closePayDialog" @pay-success="paySuccess" />
    <all-func-setting v-if="drawerState" :current-row="currentRow" :drawer-fun="drawerFun" :drawer-state="drawerState"
      @close-drawer="closeDrawer" />
  </div>
</template>
<script setup lang="ts">
import { addShop, createBindCode, setShopIsTop, updateShopExtra, updateShopMsg, getGroup, getCity, getShopListHas } from '/@/api/shop.ts'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { connectShopUserGroup, connectShopUserRemoveGroup } from '/@/api/group.ts'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { CallFuinctionParms } from '@/TsModel/Alien/Controllers/Function/CallFuinctionParms'
import AllFuncSetting from '/@/views/shop/componentsV2/AllFuncSetting.vue'
import PayDialog from '/@/views/shop/PayDialog.vue'
import { gp } from '/@vab/plugins/vab.ts'
import type { TableInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { GetCookiesObj } from '/@/utils/tool'
import { openWindow as openShopBackendWindow } from '/@/utils/openShopWin.ts'
import { h, watch } from 'vue'
import { DocumentCopy, Filter, Edit, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'

const props = defineProps({
  shopTypeStr: String,
  shopType: Number,
  listLoading: Boolean,
  shopList: Array,
  total: Number,
  page: Number,
  pageSize: Number,
  batchRenewMode: {
    type: Boolean,
    default: false
  }
})

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const columns = ref<any>([
  {
    label: '门店基本信息',
    sortable: false,
    checked: true,
    minWidth: 350,
    align: 'left',
    fixed: 'left',
    disableCheck: true
  },
  {
    label: '门店分组',
    sortable: false,
    checked: true,
    minWidth: 130,
    align: 'center'
  },
  {
    label: '授权状态',
    checked: true,
    minWidth: 160,
    align: 'center'
  },
  {
    label: '实时收入',
    checked: true,
    minWidth: 110,
    align: 'center',
    sortable: false,
    prop: 'income'
  },
  {
    label: '有效订单',
    checked: true,
    minWidth: 110,
    align: 'center',
    sortable: false,
    prop: 'order_num'
  },
  {
    label: '曝光人数',
    checked: true,
    minWidth: 110,
    align: 'center',
    sortable: false,
    prop: 'show_num'
  },
  {
    label: '入店转化率',
    checked: true,
    minWidth: 120,
    align: 'center',
    sortable: false,
    prop: 'in_ratio'
  },
  {
    label: '下单转化率',
    checked: true,
    minWidth: 120,
    align: 'center',
    sortable: false,
    prop: 'order_ratio'
  },
  {
    label: '客单价',
    checked: true,
    minWidth: 110,
    align: 'center',
    sortable: false,
    prop: 'avg_income'
  },
  {
    label: '推广详情',
    checked: true,
    minWidth: 270,
    align: 'center'
  },
  {
    label: '点金推广',
    checked: true,
    minWidth: 140,
    align: 'center'
  },
  {
    label: '当前点金出价',
    checked: true,
    minWidth: 110,
    align: 'center',
    fixed: 'right', // 固定在最右边
    disableCheck: true
  }
])
// 是否为饿了么复制版（仅该类型展示“API授权”，其他类型展示“插件授权”）
const isEleCopyShopType = computed(() => props.shopType === ShopType.饿了么官方)
// 支持 API 授权的平台：饱了么餐饮、饱了么官方(复制版)、京东到家、京东团购
const hasApiAuth = computed(() => [2, 8, 6, 1001].includes(props.shopType as number))
const checkList = ref<any>([])
const finallyColumns = computed(() => columns.value.filter((item: any) => checkList.value.includes(item.label)))
const border = ref<boolean>(false)
const lineHeight = ref<any>('default')
const stripe = ref<boolean>(true)
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
const emit = defineEmits(['updatePage', 'sortChange', 'save-scroll', 'shopSelectionChange', 'update-filter'])
const selectRows = ref<any>([])
const drawerState = ref(false)
const currentRow = ref({})
const drawerFun = ref('')

// 筛选状态
const basicInfoFilter = ref<string | undefined>(undefined)
const authStatusFilter = ref<string>('')
const groupFilter = ref<string>('')
// 城市天气筛选状态（使用数组存储选中的城市路径）
const cityWeatherFilter = ref<any[]>([])

// 获取门店基本信息筛选文本
const getBasicInfoFilterText = () => {
  return basicInfoFilter.value || '全部'
}

// 获取授权状态筛选文本
const getAuthStatusFilterText = () => {
  if (!authStatusFilter.value) return '全部'
  return authStatusFilter.value
}

// 获取门店分组筛选文本
const getGroupFilterText = () => {
  if (!groupFilter.value) return '全部'
  return groupFilter.value
}

// 城市天气筛选文本
const getCityWeatherFilterText = () => {
  if (!cityWeatherFilter.value || cityWeatherFilter.value.length === 0) {
    return '全部'
  }
  if (cityWeatherFilter.value.length === 1) {
    return cityWeatherFilter.value[0][1] || '已选择'
  }
  return `已选择${cityWeatherFilter.value.length}个城市`
}

// 处理授权状态筛选（参考基础版 Screen 在线状态逻辑）
const handleAuthStatusFilter = (command: string) => {
  if (command === '全部') {
    authStatusFilter.value = ''
    // 清空授权相关筛选
    emit('update-filter', { ck_online: undefined, state: undefined })
  } else if (command === '授权正常') {
    authStatusFilter.value = '授权正常'
    // 授权正常：只按 ck_online 过滤，state 置空
    emit('update-filter', { ck_online: true, state: undefined })
  } else if (command === '授权异常') {
    authStatusFilter.value = '授权异常'
    // 授权异常：按 state=3 过滤，ck_online 清空
    emit('update-filter', { ck_online: undefined, state: 3 })
  }
}

// 处理门店分组筛选
const handleGroupFilter = (command: string) => {
  if (command === '全部') {
    groupFilter.value = ''
    emit('update-filter', { group: undefined })
  } else {
    groupFilter.value = command
    // 需要根据分组名称找到对应的分组ID
    const group = flatGroupOptions.value.find(g => g.label === command)
    if (group) {
      emit('update-filter', { group: group.value })
    }
  }
}

// 分组选项（扁平化）
const flatGroupOptions = ref<any[]>([])

// 保存已设置分组的店铺映射（shopId -> groupName），用于刷新后恢复
const shopGroupCache = ref<Map<string, string>>(new Map())

// 防重复请求标志
const isGroupListLoading = ref(false)
const isCityListLoading = ref(false)

// 获取分组列表
const getGroupList = async () => {
  // 防止重复请求
  if (isGroupListLoading.value) {
    return
  }

  try {
    isGroupListLoading.value = true
    const res: any = await getGroup({
      grouptype: 1,
      recursionchild: true
    })

    if (res.code === 200) {
      flatGroupOptions.value = flattenGroups(res.data)
    }
  } catch (error) {
    console.error('获取分组列表失败:', error)
  } finally {
    isGroupListLoading.value = false
  }
}

// 扁平化分组数据
const flattenGroups = (groups: any[]): any[] => {
  const result: any[] = []
  groups.forEach((group: any) => {
    const groupId = group.Member?.id || group.id
    const groupName = group.Member?.name || group.name
    if (groupId && groupName) {
      result.push({
        value: groupId,
        label: groupName
      })
    }
    if (group.children && group.children.length > 0) {
      result.push(...flattenGroups(group.children))
    }
  })
  return result
}

// 根据分组名称获取分组ID
const getGroupIdByName = (groupName: string | null | undefined): string | null => {
  if (!groupName) return null
  // 先尝试精确匹配
  let group = flatGroupOptions.value.find(g => g.label === groupName)
  if (group) return group.value

  // 如果精确匹配失败，尝试去除首尾空格后匹配
  const trimmedName = groupName.trim()
  group = flatGroupOptions.value.find(g => g.label?.trim() === trimmedName)
  if (group) {
    console.log('运营版分组名称匹配（去除空格）:', { 原始值: groupName, 匹配值: group.label, groupId: group.value })
    return group.value
  }

  // 如果还是找不到，输出调试信息
  console.warn('运营版未找到匹配的分组:', {
    groupName,
    availableGroups: flatGroupOptions.value.map(g => g.label),
    flatGroupOptions: flatGroupOptions.value
  })
  return null
}

// 已移除编辑模式，直接使用选择框（参考团队管理页面的逻辑）

// 处理分组变更（完全按照团队管理页面的逻辑实现）
const handleGroupChange = (row: any, groupId: any) => {
  // 参考团队管理页面的 confirmRelevanceShop 逻辑
  const shopIds = [row.id]
  const shopOfficeIds = [row.office_id]

  console.log('运营版-开始关联门店到分组（团队管理页面逻辑）:', { groupId, shopIds, shopOfficeIds })

  if (groupId) {
    // 添加到分组（参考团队管理页面：organizationValue === '未关联分组'）
    connectShopUserGroup({
      groupId: String(groupId),
      shopIds,
      shopOfficeIds
    }).then((res: any) => {
      console.log('运营版-connectShopUserGroup 响应:', res)

      if (res.code === 200) {
        gp.$baseMessage('关联成功！', 'success', 'hey')

        // 更新本地 group_name
        const selectedGroup = flatGroupOptions.value.find(g => String(g.value) === String(groupId))
        if (selectedGroup) {
          row.group_name = selectedGroup.label
          shopGroupCache.value.set(row.id, selectedGroup.label)
          console.log('运营版-更新 group_name:', row.group_name)
        }

        // 参考团队管理页面：调用 getShopList() 和 sequenceGetShopList()
        // getShopList() - 刷新弹窗列表
        getShopListHas({
          hasGroup: false,
          page: 1,
          pageSize: 20,
          shop_type: props.shopType || 1,
          shop_city: [],
          word: ''
        }).then(() => {
          console.log('运营版-getShopListHas 完成')
        })

        // sequenceGetShopList() - 刷新分组列表
        getGroupList().then(() => {
          // 刷新店铺列表显示
          queryData()
        })
      } else {
        gp.$baseMessage(`关联失败: ${res.msg || res.message}`, 'error', 'hey')
      }
    }).catch((error: any) => {
      console.error('运营版-关联失败:', error)
      gp.$baseMessage('关联失败', 'error', 'hey')
    })
  } else {
    // 从分组移除（参考团队管理页面：organizationValue === '已关联分组'）
    if (row.group_name) {
      const currentGroupId = getGroupIdByName(row.group_name)
      if (currentGroupId) {
        connectShopUserRemoveGroup({
          groupId: String(currentGroupId),
          shopIds,
          shopOfficeIds
        }).then((res: any) => {
          console.log('运营版-connectShopUserRemoveGroup 响应:', res)

          if (res.code === 200) {
            gp.$baseMessage('关联成功！', 'success', 'hey')

            // 更新本地 group_name
            row.group_name = ''
            shopGroupCache.value.delete(row.id)
            console.log('运营版-已清空 group_name')

            // 刷新列表
            getShopListHas({
              hasGroup: false,
              page: 1,
              pageSize: 20,
              shop_type: props.shopType || 1,
              shop_city: [],
              word: ''
            }).then(() => {
              console.log('运营版-getShopListHas 完成')
            })

            getGroupList().then(() => {
              queryData()
            })
          } else {
            gp.$baseMessage(`移除失败: ${res.msg || res.message}`, 'error', 'hey')
          }
        }).catch((error: any) => {
          console.error('运营版-移除失败:', error)
          gp.$baseMessage('移除失败', 'error', 'hey')
        })
      }
    }
  }
}

// 门店基本信息筛选改变（营业状态）
const handleBasicInfoFilter = (value: string) => {
  basicInfoFilter.value = value === '全部' ? undefined : value

  // 将筛选值转换为状态值
  let stateValue: number | undefined
  if (value === '全部') {
    stateValue = undefined
  } else if (value === '营业中') {
    stateValue = 4
  } else if (value === '停业中') {
    stateValue = 5
  } else if (value === '上线中') {
    stateValue = 6
  } else if (value === '已下线') {
    stateValue = 7
  }

  emit('update-filter', { state: stateValue })
}

// 城市天气筛选相关
const cityList = ref<Array<any>>([])
const selectedCities = ref<Set<string>>(new Set())
const selectedProvince = ref<string | null>(null)
const selectedCitiesUpdateTrigger = ref(0)

const currentProvinceCities = computed(() => {
  if (!selectedProvince.value) return []
  const province = cityList.value.find(p => p.value === selectedProvince.value)
  return province?.children || []
})

// 初始化城市筛选（弹窗打开时）
const initCityFilter = () => {
  selectedCities.value.clear()
  if (cityWeatherFilter.value && cityWeatherFilter.value.length > 0) {
    cityWeatherFilter.value.forEach((path: any[]) => {
      if (path && path.length > 1) {
        selectedCities.value.add(path[1])
      }
    })
  }

  if (selectedCities.value.size > 0 && cityList.value.length > 0) {
    for (const province of cityList.value) {
      if (province.children) {
        const hasSelectedCity = province.children.some((city: any) => selectedCities.value.has(city.value))
        if (hasSelectedCity) {
          selectedProvince.value = province.value
          break
        }
      }
    }
  }
  selectedCitiesUpdateTrigger.value++
}

// 选择省份
const selectProvince = (provinceValue: string) => {
  selectedProvince.value = provinceValue
}

// 切换省份全选
const toggleProvince = (provinceValue: string, checked: boolean) => {
  const province = cityList.value.find(p => p.value === provinceValue)
  if (!province || !province.children) return

  province.children.forEach((city: any) => {
    if (checked) {
      selectedCities.value.add(city.value)
    } else {
      selectedCities.value.delete(city.value)
    }
  })
  selectedCitiesUpdateTrigger.value++
}

// 判断省份是否选中
const isProvinceSelected = (provinceValue: string) => {
  const province = cityList.value.find(p => p.value === provinceValue)
  if (!province || !province.children || province.children.length === 0) return false
  return province.children.every((city: any) => selectedCities.value.has(city.value))
}

// 判断省份是否半选
const isProvinceIndeterminate = (provinceValue: string) => {
  const province = cityList.value.find(p => p.value === provinceValue)
  if (!province || !province.children || province.children.length === 0) return false
  const selectedCount = province.children.filter((city: any) => selectedCities.value.has(city.value)).length
  return selectedCount > 0 && selectedCount < province.children.length
}

// 判断城市是否选中
const isCitySelected = (city: any) => {
  selectedCitiesUpdateTrigger.value
  return selectedCities.value.has(city.value)
}

// 切换单个城市选择
const toggleCity = (city: any) => {
  if (selectedCities.value.has(city.value)) {
    selectedCities.value.delete(city.value)
  } else {
    selectedCities.value.add(city.value)
  }
  selectedCitiesUpdateTrigger.value++
}

// 清空城市筛选
const clearCityFilter = () => {
  selectedCities.value.clear()
  cityWeatherFilter.value = []
  emit('update-filter', { citys: undefined })
}

// 确认城市筛选
const confirmCityFilter = () => {
  const selectedCityArray = Array.from(selectedCities.value)
  cityWeatherFilter.value = []

  const selectedCitySet = new Set(selectedCityArray)
  const paths: any[] = []

  cityList.value.forEach((province: any) => {
    if (province.children) {
      province.children.forEach((city: any) => {
        if (selectedCitySet.has(city.value)) {
          paths.push([province.value, city.value])
        }
      })
    }
  })

  cityWeatherFilter.value = paths
  const cityNames = paths.map(p => p[1])
  emit('update-filter', { citys: cityNames.length > 0 ? cityNames : undefined })
}

// 获取城市列表（与基础版 Screen/ShopTable 逻辑一致）
const getCityList = async () => {
  // 防止重复请求
  if (isCityListLoading.value) {
    return
  }

  try {
    isCityListLoading.value = true
    const res: any = await getCity()
    if (res.code === 200 && res.data) {
      const arr: any[] = []
      for (const key in res.data) {
        const children = res.data[key].map((item: any) => ({
          value: item,
          label: item
        }))
        arr.push({ value: key, label: key, children })
      }
      cityList.value = arr
    }
  } catch (error) {
    console.error('获取城市列表失败:', error)
  } finally {
    isCityListLoading.value = false
  }
}

// 格式化授权时间为相对时间（N天前/N小时前/N分钟前）
const formatAuthTime = (time?: string | Date | null): string => {
  if (!time) return '暂无'
  try {
    const date = new Date(time)
    if (isNaN(date.getTime())) return '暂无'
    const diffMs = Date.now() - date.getTime()
    if (diffMs < 0) return '刚刚'
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin}分钟前`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}小时前`
    const diffDay = Math.floor(diffHour / 24)
    return `${diffDay}天前`
  } catch {
    return '暂无'
  }
}

// 处理表格排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  console.log('运营版表格排序变化:', { prop, order })
  // 将排序信息传递给父组件
  const sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : null
  emit('sortChange', {
    field: prop || '',
    order: sortOrder as 'asc' | 'desc' | null
  })
}

// 运营版：指标列排序状态（只允许点排序图标触发）
const metricSort = ref<{ prop: string; order: 'asc' | 'desc' | null }>({ prop: '', order: null })

const toggleMetricSort = (prop: string, order: 'asc' | 'desc') => {
  // 同一列同一方向再点一次 -> 取消排序
  if (metricSort.value.prop === prop && metricSort.value.order === order) {
    metricSort.value = { prop: '', order: null }
    emit('sortChange', { field: '', order: null })
    return
  }
  metricSort.value = { prop, order }
  emit('sortChange', { field: prop, order })
}

const renderHeader = ({ column }) => {
  return h(
    'div',
    {
      class: ['shop-table-item'],
      onMousedown: $event => {
        handleMouseDown($event, column)
      },
      onMousemove: $event => {
        handleMouseMove($event, column)
      },
      style: {
        cursor: 'pointer',
        'user-select': 'none'
      }
    },
    [h('a', column.label), h('span', { class: ['virtual'] })]
  )
}
let dragState = reactive({
  start: 0,
  end: 0,
  dragging: false,
  direction: ''
})
const handleMouseDown = (e, column) => {
  if (column.rawColumnKey === 0) {
    return
  }
  console.log('down', column)
  dragState.dragging = true
  dragState.start = column.rawColumnKey
  const eles = document.getElementsByClassName('shop-table-item')
  document.addEventListener('mouseup', handleMouseUp)
}
const handleMouseUp = () => {
  if (dragState.dragging && dragState.end !== 0) {
    console.log(dragState.dragging)
    swapElements(columns.value, dragState.start, dragState.end)
  }
  dragState = reactive({
    start: 0,
    end: 0,
    dragging: false,
    direction: ''
  })
}
const handleMouseMove = (e, column) => {
  if (dragState.dragging) {
    if (column.rawColumnKey > dragState.start) {
      dragState.direction = 'right'
    } else if (column.rawColumnKey < dragState.end) {
      dragState.direction = 'left'
    } else {
      dragState.direction = ''
    }
    dragState.end = column.rawColumnKey
  } else {
    return false
  }
}
const swapElements = (arr, index1, index2) => {
  if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
    console.log('提供的索引超出数组范围')
    return
  }
  ;[arr[index1], arr[index2]] = [arr[index2], arr[index1]]
}
const copytext = row => {
  let str = `🔥实时经营数据🔥\n数据更新时间：${row.extra_data.work_time.uptime}\n门店名称：${row.shop_type == 1 ? '美团-' : row.shop_type == 2 ? '饿了么-' : ''}${row.name}\n(${row.office_id})\n实时订单：${!row.extra_data.order_num || row.extra_data.order_num == -1 ? '0笔' : row.extra_data.order_num + '笔'}\n实时收入：${!row.extra_data.income || row.extra_data.income == -1 ? '0元，' : row.extra_data.income + '元，'}${row.extra_data.income > row.extra_data.income_y ? '⬆' + (row.extra_data.income - row.extra_data.income_y).toFixed(2) : '⬇-' + (row.extra_data.income_y - row.extra_data.income).toFixed(2)}\n曝光人数：${!row.extra_data.show_num || row.extra_data.show_num == -1 ? '0人，' : row.extra_data.show_num + '人，'}${row.extra_data.show_num > row.extra_data.show_y ? '⬆' + (row.extra_data.show_num - row.extra_data.show_y) : '⬇-' + (row.extra_data.show_y - row.extra_data.show_num)}\n入店转化率：${!row.extra_data.in_ratio || row.extra_data.in_ratio == -1 ? '0%，' : row.extra_data.in_ratio + '%，'}${row.extra_data.in_ratio > row.extra_data.in_ratio_y ? '⬆' + (row.extra_data.in_ratio - row.extra_data.in_ratio_y) : '⬇-' + (row.extra_data.in_ratio_y - row.extra_data.in_ratio)}\n单均到手：${!row.extra_data.avg_income || row.extra_data.avg_income == -1 ? '0元，' : row.extra_data.avg_income + '元，'}${row.extra_data.avg_income > row.extra_data.avg_income_y ? '⬆' + (row.extra_data.avg_income - row.extra_data.avg_income_y).toFixed(2) : '⬇-' + (row.extra_data.avg_income_y - row.extra_data.avg_income).toFixed(2)}\n推广花费：${!row.extra_data.ad_pay || row.extra_data.ad_pay == -1 ? '0元' : row.extra_data.ad_pay + '元'}\n推广曝光量：${!row.extra_data.ad_show_num || row.extra_data.ad_show_num == -1 ? '0次，' : row.extra_data.ad_show_num + '次，'}${row.extra_data.ad_show_num > row.extra_data.ad_show_num_y ? '⬆' + (row.extra_data.ad_show_num - row.extra_data.ad_show_num_y) : '⬇-' + (row.extra_data.ad_show_num_y - row.extra_data.ad_show_num)}\n推广进店量：${!row.extra_data.ad_in_num || row.extra_data.ad_in_num == -1 ? '0次，' : row.extra_data.ad_in_num + '次，'}${row.extra_data.ad_in_num > row.extra_data.ad_in_num_y ? '⬆' + (row.extra_data.ad_in_num - row.extra_data.ad_in_num_y) : '⬇-' + (row.extra_data.ad_in_num_y - row.extra_data.ad_in_num)}\n下单转化率：${!row.extra_data.order_ratio || row.extra_data.order_ratio == -1 ? '0%，' : row.extra_data.order_ratio + '%，'}${row.extra_data.order_ratio > row.extra_data.order_ratio_y ? '⬆' + (row.extra_data.order_ratio - row.extra_data.order_ratio_y) : '⬇-' + (row.extra_data.order_ratio_y - row.extra_data.order_ratio)}\n推广进店率：${!row.extra_data.ad_in_ratio || row.extra_data.ad_in_ratio == -1 ? '0%，' : row.extra_data.ad_in_ratio + '%，'}${row.extra_data.ad_in_ratio > row.extra_data.ad_in_ratio_y ? '⬆' + (row.extra_data.ad_in_ratio - row.extra_data.ad_in_ratio_y) : '⬇-' + (row.extra_data.ad_in_ratio_y - row.extra_data.ad_in_ratio)}\n单次进店成本：${!row.extra_data.ad_in_cost || row.extra_data.ad_in_cost == -1 ? '0元，' : row.extra_data.ad_in_cost + '元，'}${row.extra_data.ad_in_cost > row.extra_data.ad_in_cost_y ? '⬆' + (row.extra_data.ad_in_cost - row.extra_data.ad_in_cost_y).toFixed(2) : '⬇-' + (row.extra_data.ad_in_cost_y - row.extra_data.ad_in_cost).toFixed(2)}\n以上是为您整理的店铺实时经营数据。`
  // copyData(str)
  if (copyData(str)) {
    gp.$baseMessage('复制成功', 'success', 'hey')
  } else {
    gp.$baseMessage('复制失败', 'error', 'hey')
  }
}
const headerCellClassName = ({ column, columnIndex }) => {
  let active = columnIndex - 1 == dragState.end ? `darg_active_${dragState.direction}` : ''
  let start = columnIndex - 1 == dragState.start ? `darg_start` : ''
  return `${active} ${start}`
}
const cellClassName = ({ column, columnIndex }) => {
  // return (columnIndex - 1 === dragState.start ? `darg_start` : "")
}

const closeDrawer = () => {
  drawerState.value = false
}
const setSelectRows = (value: any) => {
  selectRows.value = value
}
const handleBatchSelectionChange = (selectedRows: any[]) => {
  // 根据模式判断是批量续费还是普通选择
  if (props.batchRenewMode) {
    // 批量续费模式：通知父组件选中的店铺
    emit('shopSelectionChange', selectedRows)
  } else {
    // 普通选择模式：使用原有的 setSelectRows 逻辑
    setSelectRows(selectedRows)
  }
}
const queryData = () => {
  emit('updatePage', {})
}
const handleCurrentChange = (value: number) => {
  emit('updatePage', { page: value })
}
const handleSizeChange = (value: number) => {
  emit('updatePage', { page: 1, pageSize: value })
}
const tableRef = ref<TableInstance>()
const updateNotes = (row: any) => {
  // 截断过长的店铺名，最多显示20个字符
  const shopName = row.name || '修改备注'
  const displayName = shopName.length > 20 ? shopName.substring(0, 20) + '...' : shopName

  ElMessageBox.prompt('请输入备注', displayName, {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消',
    inputValue: row.notes
    // 允许备注为空，移除 inputPattern 验证
  })
    .then(({ value }) => {
      // 允许空备注，只要用户点击了确认就保存（包括空字符串）
      updateShopMsg({
        id: row.id,
        UpdateVal: { notes: value || '' } // 确保传递空字符串而不是 undefined
      }).then((res: any) => {
        if (res.code === 200) {
          gp.$baseMessage('修改成功!', 'success', 'hey')
          queryData()
        }
      })
    })
    .catch(() => { })
}
const viewBindCode = (row: any) => {
  createBindCode(row.id).then((res: any) => {
    if (res.code === 200) {
      row.codeStr = `${res.data}(5分钟内有效)`
      row.code = res.data
      if (copyData(row.code)) {
        gp.$baseMessage('复制成功(绑定码5分钟有效)', 'success', 'hey')
      } else {
        gp.$baseMessage('复制失败', 'error', 'hey')
      }
    }
  })
}

// 计算功能剩余天数（与基础版保持一致）
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

    // 计算天数（向上取整，确保不足1天也显示为1天）
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays}天`
    } else {
      // 如果不足1天，显示为"不足1天"
      return '不足1天'
    }
  } catch (error) {
    return '未购买'
  }
}

// 格式化功能到期时间，返回"功能剩余X天/已到期/未购买"
const formatFuncExpireTime = (timeStr: string | undefined | null): string => {
  const remaining = getRemainingDays(timeStr)
  if (remaining === '已到期' || remaining === '未购买') {
    return remaining
  }
  return `剩余${remaining}`
}

const cutOfday = (todayVal: any, yesterdayVal: any) => {
  // 处理NaN情况
  if (isNaN(yesterdayVal) || yesterdayVal === null || yesterdayVal === undefined) {
    return 0
  }
  if (yesterdayVal > 0) {
    return `▲ ${yesterdayVal}` // 涨了用实心向上三角形
  } else if (yesterdayVal < 0) {
    return `▼ ${Math.abs(yesterdayVal)}` // 降了用实心向下三角形，并取绝对值
  } else {
    return yesterdayVal
  }
}

// 仅美团餐饮接口返回小数形式需乘100，其他平台（含美团闪购、美团医药）已是百分比形式
const isMeituanShopType = (shopType: number) => shopType === ShopType.美团

// 转化率主值显示：美团乘100，其他直接显示
const formatRatioValue = (value: number, shopType: number): string => {
  if (value === null || value === undefined || isNaN(value) || value === -1) return '暂无'
  const percentage = isMeituanShopType(shopType) ? value * 100 : value
  return percentage.toFixed(1) + '%'
}

// 转化百分比（withArrow 参数控制是否显示箭头，默认false；isAlreadyPercent 表示值已是百分比形式如17.85，无需再乘100）
const formatPercentage = (value: number, withArrow: boolean = false, isAlreadyPercent: boolean = false): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  // 接口返回的 in_ratio/order_ratio 等已是百分比形式（17.85 表示 17.85%），无需乘100
  const percentage = isAlreadyPercent ? value : value * 100

  // 保留一位小数
  const formattedValue = percentage.toFixed(1)

  // 如果需要箭头，添加箭头和百分号
  if (withArrow) {
    if (value > 0) {
      return `▲ ${formattedValue}%` // 涨了用实心向上三角形
    } else if (value < 0) {
      return `▼ ${Math.abs(percentage).toFixed(1)}%` // 降了用实心向下三角形，并取绝对值
    }
  }

  return `${formattedValue}%`
}

// 获取对比数据的样式（涨=红色，降=绿色）
const getCompareStyle = (val: any) => {
  if (val > 0) {
    return { color: '#ff4d4f', fontSize: '16px', fontWeight: '500' } // 涨了用红色
  } else if (val < 0) {
    return { color: '#67c23a', fontSize: '16px', fontWeight: '500' } // 降了用绿色
  } else {
    return { color: '#909399', fontSize: '16px' } // 持平用灰色
  }
}

const copyData = async (content: any) => {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch {
    if (!navigator.clipboard) {
      try {
        const input = document.createElement('textarea')
        input.value = content
        input.style.position = 'absolute' // 隐藏元素
        input.style.left = '-9999px'
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        console.log('内容已通过备用方法复制到剪贴板')
        return true
      } catch (fallbackError) {
        console.error('备用复制方法失败:', fallbackError)
        return false
      }
    }
    return false
  }
}
const setShopTop = (row: any, state: boolean) => {
  let str = state ? '确认置顶此店铺吗？' : '确认取消置顶吗？'
  ElMessageBox.confirm(str, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    draggable: true
  })
    .then(() => {
      setShopIsTop({ shop: row.id, top: state }).then((res: any) => {
        if (res.code === 200) {
          let str2 = state ? '置顶成功！' : '取消置顶成功'
          gp.$baseMessage(str2, 'success', 'hey')
          queryData()
        }
      })
    })
    .catch(() => { })
}

const shopData = ref({})
const payTypeText = ref('')
const payDialogState = ref(false)
const payFunShow = (row: any, typeText: string) => {
  // 运营版单店续费：使用与“店铺多开”相同样式的 PayDialog 卡片
  shopData.value = row
  payTypeText.value = typeText
  payDialogState.value = true
}

const closePayDialog = () => {
  payDialogState.value = false
}

const paySuccess = () => {
  payDialogState.value = false
  emit('updatePage', {})
}
const saveAdBid = async (row: any) => {
  const bidding = row.extra_data?.ad_bid ?? 0

  if (row.shop_type === ShopType.美团闪购) {
    try {
      const parms: CallFuinctionParms = {
        ShopType: props.shopType as ShopType,
        FunctionCode: 'ZDTG',
        ShopId: row.id,
        Method: 'SetBidding',
        ParmsObj: JSON.stringify({ bidding }),
      }
      await apiManager.functionuserApi.CallFunction(parms)
      gp.$baseMessage('设置出价成功!', 'success', 'hey')
      updateShopExtraData(row)
    } catch (error: any) {
      gp.$baseMessage(error?.message ?? '设置出价失败', 'error', 'hey')
    } finally {
      emit('updatePage', {})
    }
    return
  }

  if (row.shop_type === ShopType.美团) {
    const dicCk = GetCookiesObj(row.cookies)
    const postData = {
      acctId: dicCk['acctId'],
      wmPoiId: dicCk['wmPoiId'],
      token: dicCk['token'],
      platform: '0',
      bid: bidding * 100
    }
    globalThis.electron
      .httpPostFormN('https://waimaieapp.meituan.com/ad/v2/plan/unit/bid/edit', JSON.stringify(postData))
      .then((res: any) => {
        if (!res) {
          return gp.$baseMessage(`设置出价失败`, 'error', 'hey')
        }
        const obj = JSON.parse(res)
        if (obj.code == 0) {
          gp.$baseMessage('设置出价成功!', 'success', 'hey')
          updateShopExtraData(row)
        } else {
          gp.$baseMessage(obj.msg ?? '设置出价失败', 'error', 'hey')
        }
      })
      .catch((error: any) => {
        gp.$baseMessage(error?.message ?? error ?? '设置出价失败', 'error', 'hey')
      })
      .finally(() => {
        emit('updatePage', {})
      })
    return
  }

  gp.$baseMessage('当前平台不支持设置出价', 'error', 'hey')
  emit('updatePage', {})
}
const updateShopExtraData = (row: any) => {
  updateShopExtra({
    id: row.id,
    UpdateVal: {
      ad_bid: row.extra_data.ad_bid
    }
  }).then(res => { })
}
// 打开店铺 开始 --------------------------------------------------------------
/**
 * 运营版列表中点击“门店名称”打开店铺
 * 内部直接复用公共的 openShopWin 工具方法，确保总是通过接口获取最新 cookies
 */
const openWindow = (row: any) => {
  openShopBackendWindow(row)
}
// 打开店铺 结束 --------------------------------------------------------------
const activetab_func = ref('1')
const listtabs_func = ref([{ label: '首页', name: '1' }])
const activwebv = ref([])
const activeName = ref('')
const loginApp = async (row: any) => {
  let arr = activwebv.value.filter(item => item.id == row.id)
  let arr1 = listtabs_func.value.filter(item => item.name == row.id)
  if (arr.length === 0) {
    activwebv.value.push({ ...row, muted: 0 })
  }
  if (arr1.length === 0) {
    listtabs_func.value.push({ label: row.name, name: row.id, muted: 0 })
  }
  activeName.value = row.id
  activetab_func.value = row.id
  if (arr.length === 0 && arr1.length === 0) {
    await nextTick(() => {
      const webview = document.querySelector(`#webview${row.id}`)
      webview.addEventListener('dom-ready', async () => {
        // 先清空该 partition 下的所有 cookies（与独立窗口打开保持一致）
        await globalThis.electron.clearCookies(`persist:webview_${row.id}`, '*')

        if (row.shop_type == 1) {
          // 美团外卖
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
        } else if (row.shop_type == 3) {
          // 美团闪购
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://shangoue.meituan.com')
        } else if (row.shop_type == 4) {
          // 美团医药
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://yiyao.meituan.com/main/frame')
        } else if (row.shop_type == 2) {
          globalThis.electron.setCookies(
            `persist:webview_${row.id}`,
            row.cookies,
            `https://melody.shop.ele.me/app/shop/${row.office_id}/dashboard#app.shop.dashboard`
          )
        } else if (row.shop_type == 5) {
          const out: {
            url: string
            name: string
            value: string
            domain: string
          }[] = []
          const jar = parseCookie(row.cookies)
          for (const [key, value] of jar) {
            if (key === `cna`) {
              continue
            }
            out.push({
              url: 'https://nr.ele.me',
              name: encodeURIComponent(key),
              value: encodeURIComponent(value),
              domain: '.ele.me'
            })
          }
          globalThis.electron.setCookies2(`persist:_${row.id}`, JSON.stringify(out), 'https://nr.ele.me')
          // globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://nr.ele.me');
          // globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://nrshop.ele.me/h5/mtop.ele.newretail.touch.notice.gettouchdomainlist*');
          // globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://nrshop.ele.me/h5/mtop.ele.newretail.ebai.accountreadmtopservice.getshopuserinfo*');
        } else if (row.shop_type == 6) {
          // 京东店铺设置cookies到所有相关子域名（包括品牌饭卡等活动页面）
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://store.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://order.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sff.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://trade.m.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://trade.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://api.m.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://log-o2o.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://wl.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://storage.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://stock-store.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://vender-center.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://passport.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sso.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://uranus.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sgm-w.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sff.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://storage.360buyimg.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://img30.360buyimg.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://img.360buyimg.com`)
        } else if (row.shop_type == 7) {
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://jsls.jinritemai.com')
        } else if (row.shop_type == 1000) {
          // 美团团购：需向多个域名设置 Cookie
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://ecom.meituan.com')
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://dianping.com')
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.dianping.com')
        } else if (row.shop_type == 1001) {
          // 京东团购（暂用京东到家域名）
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://store.jddj.com`)
        }
      })
    })
  }
}
const parseCookie = (cookie: string) => {
  const map = new Map<string, string>()
  for (const item of cookie.split(/\s*;\s*/)) {
    if (item.length === 0) {
      continue
    }
    const [key, value] = <(string | undefined)[]>item.split(/\s*=\s*/)
    if (key === undefined || value === undefined || key.length === 0) {
      continue
    }
    map.set(decodeURIComponent(key), decodeURIComponent(value))
  }
  return map
}
const removetab_func = (name: any) => {
  listtabs_func.value = listtabs_func.value.filter(item => item.name != name)
  activwebv.value = activwebv.value.filter(item => item.id != name)
  activetab_func.value = '1'
}
const setMute = (key: any, acc: any) => {
  nextTick(() => {
    if (activwebv.value[key - 1]) {
      activwebv.value[key - 1]['muted'] = acc.muted === 1 ? 0 : 1
    }
    if (listtabs_func.value[key]) {
      listtabs_func.value[key]['muted'] = acc.muted === 1 ? 0 : 1
    }
    const webview = document.querySelector(`#webview${acc.name}`)
    webview.setAudioMuted(acc.muted === 1)
  })
}
// 后台打开 结束 --------------------------------------------------------------
// 修复店铺相关 开始------------------------------------------------------------
const openApp = (name: any) => {
  const invokeMap: Record<number, string> = {
    1: 'open-mt-wm',
    2: 'open-elm-wm',
    3: 'open-mt-wm',
    4: 'open-mt-wm',
    5: 'open-elm-retail',
    6: 'open-jd-home',
    7: 'open-dy-retail',
    8: 'open-elm-wm',
    1000: 'open-mt-groupbuy',
    1001: 'open-jd-home',
    1002: 'open-dy-tuangou-capture',
  }
  const params = {
    name: name || '',
    shop_type: props.shopType
  }
  globalThis.electron.openBrowser(invokeMap[props.shopType as number], params, async (res: any) => {
    let data = {
      shop_type: params.shop_type,
      // shop_user: res?.info?.u,
      // shop_pwd: res?.info?.p,
      shop_user: '',
      shop_pwd: '',
      cookies: res.cookies
    }
    addShop(data).then((res1: any) => {
      if (res1.code === 200) {
        if (params.name) {
          gp.$baseMessage('店铺修复成功!', 'success', 'hey')
        }
        emit('updatePage', {})
      }
    })
  })
}
// 添加店铺相关 结束------------------------------------------------------------
onActivated(() => {
  tableRef.value?.doLayout()
})
// 监听 shopList 变化，恢复本地缓存的分组信息
watch(() => props.shopList, (newList) => {
  if (!newList || !Array.isArray(newList) || newList.length === 0) return

  // 如果服务器返回的数据中 group_name 为 null，但本地缓存中有，则恢复
  newList.forEach((shop: any) => {
    if (shop && shop.id && !shop.group_name && shopGroupCache.value.has(shop.id)) {
      const cachedGroupName = shopGroupCache.value.get(shop.id)
      shop.group_name = cachedGroupName
    }
  })
}, { deep: true, immediate: false })

onBeforeMount(() => {
  columns.value.forEach((item: any) => {
    if (item.checked) checkList.value.push(item.label)
  })
  // 获取分组与城市列表
  getGroupList()
  getCityList()
})

// 暴露方法供父组件调用（用于分组管理创建/删除后刷新分组选项）
defineExpose({
  getGroupList,
})
</script>
<style scoped lang="scss">
// 店铺信息单元格
.shop-info-cell {
  position: relative;
}

.item-shop {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 5px;
  gap: 12px;
}

.item-avatar {
  flex-shrink: 0;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-action-btn {
    width: 65px;
    background-color: var(--el-color-primary);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    padding: 1px 0;
    border-radius: 4px;
    text-align: center;
    transition: all 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    line-height: 1.4;

    &:hover {
      background-color: #79bbff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: scale(0.97);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }
}

.fun-renew {
  color: var(--el-color-primary);
  font-size: 14px;
  cursor: pointer;
}

.item-right {
  .item-name {
    width: 100%;
    height: 24px;
    white-space: wrap;
    font-weight: 600;
    display: flex;
    align-items: flex-start;
    color: var(--el-color-primary);
    margin-bottom: 0;

    .name-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
  }

  .item-shop-state {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;

    .shop-state {
      font-size: 13px;
    }
  }

  .item-business-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    font-size: 13px;
    color: #606266;

    .business-item {
      line-height: 1.4;
    }
  }

  .item-id-state-row {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    margin-top: 8px;
    width: 100%;
    gap: 8px;
  }

  .divider-line {
    width: 1px;
    height: 14px;
    background-color: #dcdfe6;
    flex-shrink: 0;
  }

  .item-office-id {
    font-size: 13px;
    line-height: 1.4;

    .city-name {
      margin-left: 8px;
    }
  }
}

.item-remark {
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.4;
  position: relative;

  span {
    color: var(--el-color-primary);
  }

  .edit-hint {
    color: var(--el-color-primary);
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .edit-hint {
    opacity: 1;
  }
}

.bind-code {
  font-size: 14px;

  span {
    color: var(--el-color-primary);
  }
}

.pointer {
  color: var(--el-color-primary);
  cursor: pointer;
}

.top-up-img {
  position: absolute;
  top: -26px;
  left: -12px;
  width: 40px;
  height: 40px;
}

.suc-dot {
  position: relative;
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 3px;
  vertical-align: middle;
  border-radius: 50%;
  background: var(--el-color-success);
}

.suc-dot:after {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  content: '';
  border-radius: 50%;
  animation: vabDot 1.2s ease-in-out infinite;
  background: var(--el-color-success);
}

.err-dot {
  background: var(--el-color-danger);
}

.err-dot:after {
  background: var(--el-color-danger);
}

.state-text {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0 6px 0 0;
}

.pinned-img {
  height: 24px;
  width: auto;
  margin-top: 6px;
  cursor: pointer;
}

@keyframes vabDot {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }

  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}

.tg-column {
  text-align: left;
  width: 140px;
}

// 对比数据样式优化（让箭头更明显）
.compare-data {
  font-weight: 600 !important;
  display: inline-flex;
  align-items: center;
  gap: 2px;

  // 优化箭头显示
  &::first-letter {
    font-size: 13px;
    font-weight: 900;
    line-height: 0.8;
    transform: scaleX(1.3); // 横向拉伸，让箭头更粗
    display: inline-block;
  }
}

// 实时指标列表头排序图标样式（与功能版保持一致）
.realtime-sort-header {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.realtime-sort-icons {
  display: inline-flex;
  flex-direction: column;
  margin-left: 2px;
}

.realtime-sort-icons .sort-icon {
  cursor: pointer;
  font-size: 12px;
  color: #c0c4cc;
  line-height: 10px;
}

.realtime-sort-icons .sort-icon.active {
  color: var(--el-color-primary);
}

// 点金出价容器样式
.ad-bid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;

  .ad-bid-input {
    width: 100px !important;

    // 加减按钮宽度减小
    :deep(.el-input-number__decrease),
    :deep(.el-input-number__increase) {
      width: 26px !important;
      min-width: 26px !important;
      padding: 0 !important;

      .el-icon {
        font-size: 11px !important;
      }
    }

    // 中间输入框容器
    :deep(.el-input) {
      flex: 1;
    }

    // 中间输入框宽度增大
    :deep(.el-input__wrapper) {
      padding-left: 22px !important;
      padding-right: 22px !important;
    }

    :deep(.el-input__inner) {
      text-align: center !important;
      padding: 0 6px !important;
      font-size: 13px !important;
    }
  }
}

:deep {
  .w-table {
    // width: 100%;
    // height: 100%;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    // 表格占据剩余空间
    .el-table {
      flex: 1;
      overflow: auto;
    }

    // 翻页组件固定在底部
    .vab-pagination {
      flex-shrink: 0;
      margin-top: 2px;
      padding: 8px 0;
      border-top: 1px solid #f0f0f0;
      background-color: #fff;
    }

    .el-table .darg_start {
      background-color: #f3f3f3;
    }

    .el-table th {
      padding: 0px 0;
      color: #000 !important;

      .cell {
        color: #000 !important;
      }

      .virtual {
        position: fixed;
        display: block;
        width: 0;
        height: 0;
        margin-left: -10px;
        margin-top: -13px;
        // top: 0;
        // margin-bottom: 10px;
        background: none;
        border: none;
      }

      &.darg_active_left {
        .virtual {
          border-left: 2px dotted #666;
          z-index: 99;
        }
      }

      &.darg_active_right {
        .virtual {
          border-right: 2px dotted #666;
          z-index: 99;
        }
      }
    }

    .thead-cell {
      padding: 0;
      display: inline-flex;
      flex-direction: column;
      align-items: left;
      cursor: pointer;
      overflow: initial;

      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }
    }

    &.w-table_moving {
      .el-table th .thead-cell {
        cursor: move !important;
      }

      .el-table__fixed {
        cursor: not-allowed;
      }
    }
  }
}

.name-text {
  cursor: pointer;
}

// 演示模式模糊样式
.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

:deep(.blur-text) {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.blur-image {
  filter: blur(8px) !important;
  user-select: none !important;
}

:deep(.blur-image) {
  filter: blur(8px) !important;
  user-select: none !important;
}

// 表头筛选样式（与功能版保持一致）
.shop-info-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  .header-label {
    white-space: nowrap;
    color: #000;
  }

  .header-filter {
    display: flex;
    justify-content: center;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .filter-button {
    padding: 4px 8px;
    font-size: 12px;
    background-color: #ecf5ff !important;
    color: #409eff !important;
    border: 1px solid #c6e2ff !important;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #d9ecff !important;
      color: #337ecc !important;
      border-color: #a0cfff !important;
    }

    &:focus {
      background-color: #ecf5ff !important;
      color: #409eff !important;
      border-color: #c6e2ff !important;
    }

    .el-icon {
      color: #409eff;
    }

    &:hover .el-icon {
      color: #337ecc;
    }
  }

  // 运营版：筛选按钮显示在标题下方（与功能版一致）
  &.is-operational {
    flex-direction: column;
    align-items: center;
    padding: 0 0 0;
    margin-bottom: 0px;

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
    }

    .operational-filter {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      transform: none !important;
      max-width: none !important;
      margin-top: 0;
    }

    // 授权状态：标题与筛选按钮都居中
    &.auth-status-header {
      .header-content {
        justify-content: center;
      }
    }

    // 门店分组：标题与筛选按钮都居中
    &.group-header {
      .header-content {
        justify-content: center;
      }
    }
  }

  &.auth-status-header,
  &.group-header,
  &.basic-info-header,
  &.city-weather-header {
    width: 100%;

    .header-label {
      text-align: center;
      width: 100%;
    }

    .header-filter {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}

// 筛选下拉菜单样式
:deep(.basic-info-filter-menu) {
  .el-dropdown-menu__item {
    &.is-selected {
      background-color: #ecf5ff;
      color: #409eff;
      font-weight: 500;
    }
  }
}

// 授权状态容器样式
.auth-status-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;

  .auth-status-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .auth-prefix-label {
      font-size: 13px;
      color: #606266;
      white-space: nowrap;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .auth-normal-btn {
      border-color: #67c23a;
      color: #67c23a;

      &:hover {
        background-color: #f0f9ff;
        border-color: #67c23a;
        color: #67c23a;
      }
    }

    .auth-error-btn {
      &:hover {
        background-color: #fef0f0;
      }
    }
  }

  .auth-time-row {
    display: flex;
    justify-content: center;
    align-items: center;

    .auth-time-content {
      .auth-time-text {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.auth-time-inline {
  font-size: 12px;
  color: #909399;
  margin-left: 6px;
  white-space: nowrap;
}

// 门店分组单元格包装
.group-cell-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

// 分组显示样式
.group-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .group-name {
    font-size: 14px;
    color: #606266;
  }

  .group-edit-icon {
    cursor: pointer;
    color: var(--el-color-primary);
    font-size: 16px;

    &:hover {
      opacity: 0.8;
    }
  }
}

// 到期时间样式
.group-expire-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.group-renew-btn {
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

// 分组选择框紧凑样式
.group-select-compact {
  width: 95px !important;
  min-width: 95px !important;
  max-width: 95px !important;

  :deep(.el-input) {
    width: 60px !important;
    min-width: 60px !important;
  }

  :deep(.el-input__wrapper) {
    width: 60px !important;
    min-width: 60px !important;
    padding-left: 2px !important;
    padding-right: 2px !important;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset !important;
  }

  :deep(.el-input__inner) {
    padding: 0 2px !important;
    text-align: center;
    font-size: 12px;
    width: 100% !important;
  }

  :deep(.el-input__suffix) {
    margin-right: 0 !important;
  }

  :deep(.el-input__suffix-inner) {
    gap: 0 !important;
  }

  :deep(.el-select__caret) {
    font-size: 12px;
    margin-left: 0 !important;
  }

  :deep(.el-icon) {
    width: 12px !important;
  }
}

// 门店城市显示样式
.city-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;

  .city-name {
    margin-left: 4px;
  }
}

.pinned-actions {
  display: flex;
  justify-content: center;
  align-items: center;

  .pinned-img {
    height: 24px;
    width: auto;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>