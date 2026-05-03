<template>
  <div class="shop-table" :class="{ 'batch-mode-active': props.batchRenewMode }">
    <el-tabs v-if="listtabs_func.length > 1" v-model="activetab_func" @tab-remove="removetab_func">
      <el-tab-pane v-for="(item, k) in filteredTabs" :key="item.name" :closable="true" :label="item.label"
        :name="item.name">
        <template #label>
          <span>
            <span>{{ item.label }}</span>
            <vab-icon :icon="item.muted === 1 ? 'notification-off-fill' : 'notification-4-fill'"
              @click.stop="setMute(tabIndexMap.get(item.name) ?? -1, item)" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 这是多开店铺的店铺后台显示区域 -->
    <div v-show="activetab_func !== '1' && Array.isArray(activwebv) && activwebv.length > 0">
      <div v-for="item in activwebv" v-show="activetab_func === item.id" :key="item.id"
        style="width: 100%; height: calc(100vh - 260px)">
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
                        : ''
            " style="height: 100%; width: 100%"
          useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
          webpreferences="nativeWindowOpen=yes, spellcheck=no, contextIsolation=no" />
      </div>
    </div>
    <div v-if="activetab_func === '1'" class="table-wrapper">
      <el-table ref="tableRef" v-loading="listLoading" :border="border" :data="props.shopList" height="100%"
        :size="lineHeight" :stripe="stripe"
        :class="['smooth-scroll-table', 'shop-table-content', { 'is-restoring-scroll': isRestoringUI }]"
        @selection-change="handleBatchSelectionChange" @sort-change="handleSortChange">
        <!-- 批量续费模式的选择列 -->
        <el-table-column v-if="props.batchRenewMode" type="selection" width="55" fixed="left" />
        <el-table-column v-for="(item, index) in finallyColumns" :key="index" :align="item.align" :fixed="item.fixed"
          :label="item.label" :width="item.width" :min-width="item.minWidth || (item.width ? undefined : 100)"
          :prop="item.prop"
          :show-overflow-tooltip="item.label !== '门店基本信息' && item.label !== '授权状态' && item.label !== '实时收入/订单'"
          :sortable="item.sortable">
          <template #header>
            <!-- 删除店铺多开 / 实时收入/订单专用表头 -->
            <div v-if="item.label === '门店基本信息'" class="shop-info-header" :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">门店基本信息</span>
                <el-dropdown v-if="!isFunctional" trigger="hover" placement="bottom" class="header-filter-dropdown"
                  @command="handleBasicInfoFilter">
                  <el-button type="primary" size="small" text class="filter-button"
                    :class="{ 'is-filtered': !!basicInfoFilter }">
                    <el-icon style="margin-right: 4px">
                      <Filter />
                    </el-icon>
                    {{ basicInfoFilterText }}
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
              <el-dropdown v-if="isFunctional" trigger="hover" placement="bottom"
                class="header-filter-dropdown functional-filter" @command="handleBasicInfoFilter">
                <el-button type="primary" size="small" text class="filter-button"
                  :class="{ 'is-filtered': !!basicInfoFilter }">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ basicInfoFilterText }}
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
            <!-- 店铺多开列筛选（基础版和功能版都显示） -->
            <div v-else-if="item.label === '店铺多开'" class="shop-info-header multi-open-header"
              :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">店铺多开</span>
              </div>
              <el-dropdown trigger="hover" placement="bottom" class="header-filter-dropdown multi-open-filter"
                @command="handleMultiOpenFilter">
                <el-button type="primary" size="small" text class="filter-button"
                  :class="{ 'is-filtered': multiOpenFilter !== undefined && multiOpenFilter !== 0 }">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getMultiOpenFilterText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="basic-info-filter-menu">
                    <el-dropdown-item :command="0"
                      :class="{ 'is-selected': multiOpenFilter === 0 || multiOpenFilter === undefined }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="5" :class="{ 'is-selected': multiOpenFilter === 5 }">
                      已到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="2" :class="{ 'is-selected': multiOpenFilter === 2 }">
                      即将到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="1" :class="{ 'is-selected': multiOpenFilter === 1 }">
                      未到期
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div v-else-if="item.label === '城市天气'" class="shop-info-header city-weather-header"
              :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">城市天气</span>
              </div>
              <el-popover v-model:visible="cityFilterPopoverVisible" placement="bottom" :width="500" trigger="click"
                class="city-weather-filter-popover" @show="initCityFilter">
                <template #reference>
                  <el-button type="primary" size="small" text class="filter-button"
                    :class="{ 'is-filtered': cityWeatherFilter && cityWeatherFilter.length > 0 }">
                    <el-icon style="margin-right: 4px">
                      <Filter />
                    </el-icon>
                    {{ getCityWeatherFilterText() }}
                  </el-button>
                </template>
                <div class="city-filter-content">
                  <div class="city-filter-header">
                    <span class="filter-title">选择城市</span>
                    <el-button type="primary" size="small" text @click="clearCityFilter">清空</el-button>
                  </div>
                  <div class="city-filter-body">
                    <div class="city-selector-panel">
                      <!-- 左侧：省份列表 -->
                      <div class="city-selector-left">
                        <div class="city-selector-header">省份</div>
                        <div class="city-selector-list">
                          <div v-for="province in cityList" :key="province.value" class="city-selector-item"
                            :class="{ 'is-active': selectedProvince === province.value }"
                            @click="selectProvince(province.value)">
                            <el-checkbox :model-value="isProvinceSelected(province.value)"
                              :indeterminate="isProvinceIndeterminate(province.value)"
                              @change="(checked: any) => toggleProvince(province.value, !!checked)" @click.stop />
                            <span class="province-label" @click.stop="selectProvince(province.value)">
                              {{ province.label }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <!-- 右侧：城市列表 -->
                      <div class="city-selector-right">
                        <div class="city-selector-header">
                          {{selectedProvince ? cityList.find(p => p.value === selectedProvince)?.label || '城市' : '城市'
                          }}
                        </div>
                        <div class="city-selector-list">
                          <div v-if="!selectedProvince" class="city-selector-empty">
                            请先选择省份
                          </div>
                          <div v-else-if="currentProvinceCities.length === 0" class="city-selector-empty">
                            该省份暂无城市
                          </div>
                          <div v-else class="city-checkbox-list">
                            <el-checkbox v-for="city in currentProvinceCities" :key="city.value"
                              :model-value="isCitySelected(city)" @change="() => toggleCity(city)">
                              {{ city.label }}
                            </el-checkbox>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="city-filter-footer">
                    <el-button size="small" @click="clearCityFilter">清空</el-button>
                    <el-button type="primary" size="small" @click="confirmCityFilter">确认</el-button>
                  </div>
                </div>
              </el-popover>
            </div>
            <!-- 实时收入/订单表头，使用筛选按钮（和其他列一样） -->
            <div v-else-if="item.label === '实时收入/订单'" class="shop-info-header realtime-header"
              :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">实时收入/订单</span>
              </div>
              <el-dropdown trigger="hover" placement="bottom"
                class="header-filter-dropdown functional-filter realtime-filter" @command="handleRealtimeSort"
                popper-class="realtime-sort-dropdown">
                <el-button type="primary" size="small" text class="filter-button"
                  :class="{ 'is-filtered': !!realtimeSort.prop }">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getRealtimeSortText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="basic-info-filter-menu realtime-sort-menu">
                    <el-dropdown-item :command="'全部'" :class="{ 'is-selected': !realtimeSort.prop }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="'income:asc'"
                      :class="{ 'is-selected': realtimeSort.prop === 'income' && realtimeSort.order === 'asc' }">
                      收入升序
                    </el-dropdown-item>
                    <el-dropdown-item :command="'income:desc'"
                      :class="{ 'is-selected': realtimeSort.prop === 'income' && realtimeSort.order === 'desc' }">
                      收入降序
                    </el-dropdown-item>
                    <el-dropdown-item :command="'order_num:asc'"
                      :class="{ 'is-selected': realtimeSort.prop === 'order_num' && realtimeSort.order === 'asc' }">
                      订单升序
                    </el-dropdown-item>
                    <el-dropdown-item :command="'order_num:desc'"
                      :class="{ 'is-selected': realtimeSort.prop === 'order_num' && realtimeSort.order === 'desc' }">
                      订单降序
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div v-else-if="item.label === '授权状态'" class="shop-info-header auth-status-header"
              :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">授权状态</span>
                <el-dropdown v-if="!isFunctional" trigger="hover" placement="bottom"
                  class="header-filter-dropdown auth-status-filter" @command="handleAuthStatusFilter">
                  <el-button type="primary" size="small" text class="filter-button"
                    :class="{ 'is-filtered': !!authStatusFilter }">
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
              <el-dropdown v-if="isFunctional" trigger="hover" placement="bottom"
                class="header-filter-dropdown auth-status-filter functional-filter" @command="handleAuthStatusFilter">
                <el-button type="primary" size="small" text class="filter-button"
                  :class="{ 'is-filtered': !!authStatusFilter }">
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
            <div v-else-if="item.label === '门店分组'" class="shop-info-header group-header"
              :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">门店分组</span>
                <el-dropdown v-if="!isFunctional" trigger="hover" placement="bottom"
                  class="header-filter-dropdown group-filter" @command="handleGroupFilter">
                  <el-button type="primary" size="small" text class="filter-button"
                    :class="{ 'is-filtered': !!groupFilter }">
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
              <el-dropdown v-if="isFunctional" trigger="hover" placement="bottom"
                class="header-filter-dropdown group-filter functional-filter" @command="handleGroupFilter">
                <el-button type="primary" size="small" text class="filter-button"
                  :class="{ 'is-filtered': !!groupFilter }">
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
            <!-- 功能列：仅功能版在标题下方增加筛选按钮（字段与左侧筛选保持一致：func_code / func_state） -->
            <div v-else-if="item.funcCode" class="shop-info-header func-header"
              :class="{ 'is-functional': isFunctional }">
              <div class="header-content">
                <span class="header-label">{{ item.label }}</span>
              </div>
              <!-- 运营版（APPDATA）美团餐饮、美团闪购、京东到家才显示筛选按钮 -->
              <el-dropdown
                v-if="isFunctional && (item.funcCode !== 'APPDATA' || props.shopType === ShopType.美团 || props.shopType === ShopType.美团闪购 || props.shopType === ShopType.京东到家)"
                trigger="hover" placement="bottom" class="header-filter-dropdown functional-filter"
                @command="(val: number) => handleFuncColumnFilter(item.funcCode, val)">
                <el-button type="primary" size="small" text class="filter-button"
                  :class="{ 'is-filtered': funcColumnFilters[item.funcCode] !== undefined && funcColumnFilters[item.funcCode] !== 0 }">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getFuncColumnFilterText(item.funcCode) }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="basic-info-filter-menu">
                    <el-dropdown-item :command="0"
                      :class="{ 'is-selected': funcColumnFilters[item.funcCode] === 0 || !funcColumnFilters[item.funcCode] }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="1" :class="{ 'is-selected': funcColumnFilters[item.funcCode] === 1 }">
                      未到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="2" :class="{ 'is-selected': funcColumnFilters[item.funcCode] === 2 }">
                      即将到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="3" :class="{ 'is-selected': funcColumnFilters[item.funcCode] === 3 }">
                      已开启
                    </el-dropdown-item>
                    <el-dropdown-item :command="4" :class="{ 'is-selected': funcColumnFilters[item.funcCode] === 4 }">
                      已关闭
                    </el-dropdown-item>
                    <el-dropdown-item :command="5" :class="{ 'is-selected': funcColumnFilters[item.funcCode] === 5 }">
                      已到期
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div v-if="item.label === '操作'">
              <span style="margin-right: 10px">操作</span><el-popover popper-class="custom-table-checkbox">
                <template #reference>
                  <el-button size="small" class="operation-settings-btn">
                    <vab-icon icon="settings-line" />
                  </el-button>
                </template>
                <el-checkbox-group v-model="checkList">
                  <el-checkbox v-for="item in columns" :key="item.label" :disabled="item.disableCheck"
                    :label="item.label" :value="item.label">
                    {{ item.label }}
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
                </div>
                <div class="item-right">
                  <div class="item-name" @click="openWindow(row)">
                    <vab-icon class="logo" :icon="getPlatformIcon(row.shop_type)" is-custom-svg />
                    <div class="name-text" :class="{ 'blur-text': demoMode }">
                      {{ row.name }}
                    </div>
                    <!-- 复制店铺信息提示框 -->
                    <div class="copy-shop-tooltip" @click.stop="copyShopNameInfo(row)">
                      <span class="tooltip-text">复制店铺信息</span>
                      <el-icon class="tooltip-icon">
                        <DocumentCopy />
                      </el-icon>
                    </div>
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
                    <span class="remark-label">门店备注：</span>
                    <el-tooltip v-if="row.notes && row.notes.trim()" :content="row.notes" placement="top"
                      :disabled="!isRemarkOverflow(row)" effect="dark" :show-after="200">
                      <span class="remark-content" :class="{ 'blur-text': demoMode }">{{ row.notes }}</span>
                    </el-tooltip>
                    <span v-else class="remark-content" :class="{ 'blur-text': demoMode }">暂无</span>
                    <span class="edit-hint">修改</span>
                  </div>
                </div>
              </div>
              <img v-if="row ? row.is_top : false" class="top-up-img" src="/@/assets/shop_images/icon_001.png" />
            </div>
            <div v-if="item.label === '城市天气'">
              <div v-if="row.city" class="item-office-id">
                <vab-icon icon="map-pin-fill" /><span class="city-name">{{ row.city }}</span>
              </div>
            </div>
            <!-- 实时收入/订单（合并列，同时显示收入和订单） -->
            <div v-if="item.label === '实时收入/订单'">
              <!-- 直接检查后端返回的 income 和 order_num 是否有有效数据 -->
              <div v-if="!hasRealtimeData(row)" class="realtime-data-cell">
                <div class="realtime-no-data">暂无数据</div>
              </div>
              <div v-else class="realtime-data-cell">
                <div class="realtime-data-item">
                  <span class="realtime-data-number">
                    {{ formatIncomeNumber(row.income ?? row.extra_data?.income) }}
                  </span>
                  <span class="realtime-data-unit">元</span>
                </div>
                <div class="realtime-data-item">
                  <span class="realtime-data-number">
                    {{ formatOrderNumber(row.order_num ?? row.extra_data?.order_num) }}
                  </span>
                  <span class="realtime-data-unit">单</span>
                </div>
              </div>
            </div>
            <!-- 店铺多开列（显示到期时间和续费按钮） -->
            <div v-if="item.label === '店铺多开'" class="multi-open-cell">
              <div class="multi-open-expire-text">
                功能{{ formatFuncExpireTime(row.EndTime) }}
              </div>
              <!-- 功能版：调用全功能续费；基础版：调用店铺多开续费 -->
              <div class="multi-open-renew-btn"
                @click="payFunShow(row, isFunctional ? null : 'OPENSHOP', isFunctional ? '全功能' : '店铺多开')">
                功能续费
              </div>
            </div>
            <div v-if="item.label === '授权状态'">
              <div class="auth-status-container" :class="{ 'is-functional': isFunctional }">
                <div class="auth-status-row">
                  <span class="auth-prefix-label">
                    {{ isEleCopyShopType ? 'API授权：' : '插件授权：' }}
                  </span>
                  <div class="auth-buttons">
                    <el-button :type="row.state == 3 ? 'danger' : 'success'" size="small" plain
                      :class="{ 'auth-normal-btn': row.state != 3, 'auth-error-btn': row.state == 3 }">
                      {{ row.state == 3 ? '授权异常' : '授权正常' }}
                    </el-button>
                    <el-button v-if="row.state == 3" type="danger" size="small" @click="openApp(row.name)"
                      style="margin-left: 4px;">
                      修复
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
            <div v-if="item.label === '门店分组'">
              <!-- 直接显示选择框，不使用编辑模式，参考运营版样式 -->
              <el-select :model-value="getGroupIdByName(row.group_name)" placeholder="选择分组" size="default" clearable
                class="group-select-compact"
                :key="`group-select-${row.id}-${row.group_name || 'empty'}-${flatGroupOptions.length}`"
                @change="(value: any) => handleGroupChange(row, value)">
                <el-option v-for="group in flatGroupOptions" :key="group.value" :label="group.label"
                  :value="String(group.value)">
                </el-option>
              </el-select>
            </div>
            <!-- 功能版：功能列显示开关和续费（基础版不显示这些） -->
            <!-- 排除店铺多开（OPENSHOP），因为店铺多开列已有专门的渲染逻辑 -->
            <div
              v-if="isFunctional && item.funcCode && item.funcCode !== 'OPENSHOP' && FRONTEND_FUNC_SET.has(item.funcCode)">
              <el-switch v-if="FRONTEND_FUNC_CONFIG[item.funcCode]?.hasSwitch" v-model="row[item.funcCode]"
                active-color="var(--el-color-primary)" inactive-color="#D8D8D8"
                @change="setFunEnable(row, item.funcCode)" />
              <div class="pointer" @click="openDrawer(row, item.funcCode)">
                {{ FRONTEND_FUNC_CONFIG[item.funcCode]?.settingText || (item.label + '设置') }}
              </div>
              <div style="font-size: 12px">{{ formatFuncExpireTime(row[item.funcCode + 'time']) }}</div>
              <span class="pointer" style="font-size: 14px"
                @click="payFunShow(row, item.funcCode, FRONTEND_FUNC_CONFIG[item.funcCode]?.payTypeText || item.label)">续费</span>
            </div>
            <!-- 后端动态功能且 hasBlazorUI：开关 + 功能配置 + 到期时间 + 续费，配置按钮统一为「功能配置」 -->
            <!-- 排除店铺多开（OPENSHOP），因为店铺多开列已有专门的渲染逻辑 -->
            <div v-else-if="isFunctional && item.funcCode && item.funcCode !== 'OPENSHOP' && item.hasBlazorUI">
              <el-switch v-model="row[item.funcCode]" active-color="var(--el-color-primary)" inactive-color="#D8D8D8"
                @change="setFunEnable(row, item.funcCode)" />
              <div class="pointer" @click="openDrawer(row, item.funcCode)">功能配置</div>
              <div style="font-size: 12px">{{ formatFuncExpireTime(row[item.funcCode + 'time']) }}</div>
              <span class="pointer" style="font-size: 14px"
                @click="payFunShow(row, item.funcCode, item.label)">续费</span>
            </div>
            <!-- 其它动态功能（无 Blazor 设置入口）：开关 + 到期时间 + 续费 -->
            <!-- 排除店铺多开（OPENSHOP），因为店铺多开列已有专门的渲染逻辑 -->
            <div v-else-if="isFunctional && item.funcCode && item.funcCode !== 'OPENSHOP'">
              <el-switch v-model="row[item.funcCode]" active-color="var(--el-color-primary)" inactive-color="#D8D8D8"
                @change="setFunEnable(row, item.funcCode)" />
              <div v-if="row[item.funcCode + 'time']" style="font-size: 12px">{{ formatFuncExpireTime(row[item.funcCode
                +
                'time']) }}</div>
              <span v-else style="font-size: 12px">—</span>
              <span class="pointer" style="font-size: 14px"
                @click="payFunShow(row, item.funcCode, item.label)">续费</span>
            </div>
            <div v-if="item.label === '操作'">
              <div class="action-buttons-grid">
                <div class="action-item" @click="openWindow(row)">
                  <el-icon class="action-icon backend-icon">
                    <Monitor />
                  </el-icon>
                  <span class="action-text">打开后台</span>
                </div>
                <div class="action-item" @click="handleToggleTop(row)">
                  <el-icon class="action-icon star-icon" :class="{ 'star-active': row.is_top }">
                    <Star />
                  </el-icon>
                  <span class="action-text">{{ row.is_top ? '取消置顶' : '置顶' }}</span>
                </div>
                <div class="action-item" @click="handleShare(row)">
                  <el-icon class="action-icon share-icon">
                    <Share />
                  </el-icon>
                  <span class="action-text">分享</span>
                </div>
                <div class="action-item delete-item" @click="handleDelete(row)">
                  <el-icon class="action-icon delete-icon">
                    <Delete />
                  </el-icon>
                  <span class="action-text delete-text">删除</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty class="vab-data-empty" description="暂无数据" />
        </template>
      </el-table>
    </div>
    <vab-pagination :current-page="props.page" :page-size="props.pageSize" :total="props.total" class="shop-pagination"
      @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    <pay-dialog v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="payTypeText"
      :shop-data="shopData" @close-dialog="closePayDialog" @pay-success="paySuccess" />
    <all-func-setting v-if="drawerState" :current-row="currentRow" :drawer-fun="drawerFun" :drawer-state="drawerState"
      @close-drawer="closeDrawer" />
    <blazor-config-drawer v-model="blazorDrawerVisible" :icon="blazorDrawerIcon" :shop-img="blazorDrawerShopImg"
      :shop-name="blazorDrawerShopName" :title="blazorDrawerTitle" :url="blazorDrawerUrl"
      @close="blazorDrawerVisible = false" />
    <!-- 分享门店对话框 -->
    <el-dialog v-model="shareDialogVisible" width="480px" :close-on-click-modal="false">
      <template #header>
        <div class="share-dialog-header">
          <span class="share-dialog-title">分享门店</span>
          <el-tooltip v-if="currentShareShop" :content="currentShareShop.name" placement="top"
            :disabled="!isShopNameOverflow">
            <span ref="shopNameRef" class="share-shop-name">{{ currentShareShop.name }}</span>
          </el-tooltip>
          <el-button v-if="currentShareShop" type="primary" size="small" class="copy-shop-info-btn"
            @click="copyShopInfo">
            <el-icon style="margin-right: 4px">
              <DocumentCopy />
            </el-icon>
            复制门店信息
          </el-button>
        </div>
      </template>
      <div class="share-dialog-content">
        <div class="share-code-section">
          <div class="share-label">分享码</div>
          <div class="share-code-input-wrapper">
            <el-input v-model="shareCode" readonly class="share-code-input" />
            <el-button type="primary" class="copy-share-btn" @click="copyShareCode">
              <el-icon style="margin-right: 4px">
                <DocumentCopy />
              </el-icon>
              复制分享码
            </el-button>
          </div>
        </div>
        <div class="share-tips">
          <el-icon class="tips-icon">
            <InfoFilled />
          </el-icon>
          <span class="tips-text">分享码有效期为5分钟,其他用户可通过绑定门店按钮添加该门店</span>
        </div>
      </div>
      <template #footer>
        <div class="share-dialog-footer">
          <el-button @click="closeShareDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <!--  添加店铺相关 开始-------------------------------------------------------------->
    <set-only-bind v-if="showShopMsgState" :add-shop-after-obj="showShopMsg" :add-shop-after-state="showShopMsgState"
      :is-bind="isBind" @close-shop-after="closeShopAfter" />
    <!--  添加店铺相关 结束-------------------------------------------------------------->
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onActivated, onMounted, onBeforeMount, onBeforeUnmount, watch, nextTick, onDeactivated } from 'vue'
import { addShop, createBindCode, enableFunc, setShopIsTop, unBindShop, updateShopMsg, getGroup, getCity, getShopListHas } from '/@/api/shop.ts'
import { connectShopUserGroup, connectShopUserRemoveGroup } from '/@/api/group.ts'
import AllFuncSetting from '/@/views/shop/componentsV2/AllFuncSetting.vue'
import PayDialog from '/@/views/shop/PayDialog.vue'
// EditDialog 已不再从“操作列”入口打开（改为打开后台），如需编辑功能请在其它入口实现
import { gp } from '/@vab/plugins/vab.ts'
import type { TableInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import { openWindow } from '/@/utils/openShopWin.ts'
import { getFunctionList, getShopListFunctionColumns } from '/@/utils/functionCache.ts'
import { getCachedGroupList, getCachedCityList, getCachedBindCode, clearGroupListCache } from '/@/utils/dataCache.ts'
import { getToken } from '/@/utils/token'
import BlazorConfigDrawer from '/@/views/shop/componentsV2/BlazorConfigDrawer.vue'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'
import { DocumentCopy, Filter, ArrowUp, Edit, Star, Share, Delete, ArrowRight, InfoFilled, Monitor, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { useTableScroll } from '/@/composables/useTableScroll'

const props = defineProps({
  shopTypeStr: String,
  shopType: Number,
  listLoading: Boolean,
  shopList: Array,
  total: Number,
  page: Number,
  pageSize: Number,
  isFunctional: {
    type: Boolean,
    default: false
  },
  batchRenewMode: {
    type: Boolean,
    default: false
  }
})

// 是否为饿了么复制版（仅该类型展示“API授权”，其他类型展示“插件授权”）
const isEleCopyShopType = computed(() => props.shopType === ShopType.饿了么官方)
// 支持 API 授权的平台：饱了么餐饮、饱了么官方(复制版)、京东到家、京东团购
const hasApiAuth = computed(() => [2, 8, 6, 1001].includes(props.shopType as number))

/**
 * 根据店铺类型获取图标名称
 * @param shopType - 店铺类型（数字或可转换为数字的值）
 * @returns 图标名称字符串
 */
const getPlatformIcon = (shopType: number | undefined | null): string => {
  // 确保 shopType 是有效的数字类型
  const type = shopType != null ? Number(shopType) : NaN

  // 如果转换失败或不是有效数字，使用 fallback
  if (isNaN(type)) {
    return props.shopTypeStr?.replaceAll(/-feature|-operate/g, '') || ''
  }

  switch (type) {
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
      // 如果没有匹配的shopType，使用shopTypeStr作为fallback
      return props.shopTypeStr?.replaceAll(/-feature|-operate/g, '') || ''
  }
}

const icon = props.shopTypeStr?.replaceAll(/-feature|-operate/g, '') || ''
const functionInfoMap = ref<Record<string, t_wmt_function>>({})

// 门店基本信息筛选状态
const basicInfoFilter = ref<string | undefined>(undefined)
// 城市天气筛选状态（使用数组存储选中的城市路径）
const cityWeatherFilter = ref<any[]>([])
// 城市列表（级联结构）
const cityList = ref<Array<any>>([])
// 选中的城市（临时状态，用于弹窗内选择）
const selectedCities = ref<Set<string>>(new Set())
// 用于触发响应式更新的计数器
const selectedCitiesUpdateTrigger = ref(0)
// 当前选中的省份
const selectedProvince = ref<string | null>(null)
// 城市筛选弹窗显示状态
const cityFilterPopoverVisible = ref(false)

// 实时收入/订单二级菜单显示状态
// 创建省份值到省份对象的映射表（优化性能）
const provinceMap = computed(() => {
  const map = new Map<string, any>()
  cityList.value.forEach(province => {
    if (province.value) {
      map.set(province.value, province)
    }
  })
  return map
})

// 当前省份的城市列表（使用映射表优化性能）
const currentProvinceCities = computed(() => {
  if (!selectedProvince.value) return []
  const province = provinceMap.value.get(selectedProvince.value)
  return province?.children || []
})
// 按店铺类型存储筛选状态
interface FilterState {
  basicInfoFilter?: string
  cityWeatherFilter: any[]
  authStatusFilter?: string
  groupFilter?: string
  multiOpenFilter?: number
  funcColumnFilters: Record<string, number>
}

// 店铺类型筛选状态存储 Map<shopType, FilterState>
const shopTypeFilterStates = ref<Map<number, FilterState>>(new Map())

// 获取指定店铺类型的筛选状态
const getShopTypeFilterState = (shopType: number): FilterState => {
  if (!shopTypeFilterStates.value.has(shopType)) {
    shopTypeFilterStates.value.set(shopType, {
      basicInfoFilter: undefined,
      cityWeatherFilter: [],
      authStatusFilter: undefined,
      groupFilter: undefined,
      multiOpenFilter: undefined,
      funcColumnFilters: {}
    })
  }
  return shopTypeFilterStates.value.get(shopType)!
}

/**
 * 保存指定店铺类型的筛选状态
 * @param shopType - 店铺类型（可选，默认使用当前 props.shopType）
 */
const saveCurrentFilterState = (shopType?: number) => {
  const targetShopType = shopType ?? props.shopType
  if (!targetShopType) return

  const state = getShopTypeFilterState(targetShopType as number)
  state.basicInfoFilter = basicInfoFilter.value
  state.cityWeatherFilter = [...cityWeatherFilter.value]
  state.authStatusFilter = authStatusFilter.value
  state.groupFilter = groupFilter.value
  state.multiOpenFilter = multiOpenFilter.value
  state.funcColumnFilters = { ...funcColumnFilters.value }
}

/**
 * 恢复指定店铺类型的筛选状态
 * @param shopType - 店铺类型
 */
const restoreFilterState = (shopType: number) => {
  const state = getShopTypeFilterState(shopType)

  // 批量更新，减少响应式触发次数
  basicInfoFilter.value = state.basicInfoFilter
  cityWeatherFilter.value = state.cityWeatherFilter.length > 0 ? [...state.cityWeatherFilter] : []
  authStatusFilter.value = state.authStatusFilter
  groupFilter.value = state.groupFilter
  multiOpenFilter.value = state.multiOpenFilter
  funcColumnFilters.value = { ...state.funcColumnFilters }
}

// 授权状态筛选状态
const authStatusFilter = ref<string | undefined>(undefined)
// 门店分组筛选状态
const groupFilter = ref<string | undefined>(undefined)
// 店铺多开筛选状态
const multiOpenFilter = ref<number | undefined>(undefined)
// 功能列筛选状态（funcCode -> funcState 的映射）
const funcColumnFilters = ref<Record<string, number>>({})

// 分组相关
const groupOptions = ref<any[]>([])
const flatGroupOptions = ref<any[]>([])

// 保存已设置分组的店铺映射（shopId -> groupName），用于刷新后恢复
const shopGroupCache = ref<Map<string, string>>(new Map())

// 防重复请求标志
const isGroupListLoading = ref(false)
const isCityListLoading = ref(false)

// 获取分组列表（带缓存）
const getGroupList = async () => {
  // 防止重复请求
  if (isGroupListLoading.value) {
    return
  }

  try {
    isGroupListLoading.value = true

    // 使用缓存获取分组列表
    const cachedData = await getCachedGroupList(async () => {
      const res: any = await getGroup({
        grouptype: 1,
        recursionchild: true
      })
      if (res.code === 200) {
        return res.data
      }
      return null
    })

    if (cachedData) {
      groupOptions.value = cachedData

      // 处理分组数据，参考Screen组件的factory函数
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
  } finally {
    isGroupListLoading.value = false
  }
}

// 已移除编辑模式，直接使用选择框（参考团队管理页面的逻辑）

// 处理分组变更（完全按照团队管理页面的逻辑实现）
const handleGroupChange = (row: any, groupId: string | null) => {
  // 参考团队管理页面的 confirmRelevanceShop 逻辑
  const shopIds = [row.id]
  const shopOfficeIds = [row.office_id]

  if (groupId) {
    // 添加到分组（参考团队管理页面：organizationValue === '未关联分组'）
    connectShopUserGroup({
      groupId: String(groupId),
      shopIds,
      shopOfficeIds
    }).then((res: any) => {

      if (res.code === 200) {
        gp.$baseMessage('关联成功！', 'success', 'hey')

        // 更新本地 group_name（使用映射表优化性能）
        const groupIdStr = String(groupId)
        // 创建分组ID到分组对象的映射（临时，因为需要按ID查找）
        const groupByIdMap = new Map<string, any>()
        flatGroupOptions.value.forEach(g => {
          groupByIdMap.set(String(g.value), g)
        })
        const selectedGroup = groupByIdMap.get(groupIdStr)
        if (selectedGroup) {
          row.group_name = selectedGroup.label
          shopGroupCache.value.set(row.id, selectedGroup.label)
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
        })

        // 清除分组列表缓存并刷新
        clearGroupListCache()
        getGroupList().then(() => {
          // 刷新店铺列表显示
          emit('updatePage', {})
        })
      } else {
        gp.$baseMessage(`关联失败: ${res.msg || res.message}`, 'error', 'hey')
      }
    }).catch((error: any) => {
      console.error('关联失败:', error)
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

          if (res.code === 200) {
            gp.$baseMessage('关联成功！', 'success', 'hey')

            // 更新本地 group_name
            row.group_name = ''
            shopGroupCache.value.delete(row.id)

            // 刷新列表
            getShopListHas({
              hasGroup: false,
              page: 1,
              pageSize: 20,
              shop_type: props.shopType || 1,
              shop_city: [],
              word: ''
            }).then(() => {
            })

            // 清除分组列表缓存并刷新
            clearGroupListCache()
            getGroupList().then(() => {
              emit('updatePage', {})
            })
          } else {
            gp.$baseMessage(`移除失败: ${res.msg || res.message}`, 'error', 'hey')
          }
        }).catch((error: any) => {
          console.error('移除失败:', error)
          gp.$baseMessage('移除失败', 'error', 'hey')
        })
      }
    }
  }
}

// 创建分组名称到ID的映射表（优化性能，避免每次查找都遍历数组）
const groupNameToIdMap = computed(() => {
  const map = new Map<string, string>()
  flatGroupOptions.value.forEach(g => {
    if (g.label) {
      // 精确匹配
      map.set(g.label, g.value)
      // 去除空格后的匹配
      const trimmed = g.label.trim()
      if (trimmed !== g.label) {
        map.set(trimmed, g.value)
      }
    }
  })
  return map
})

// 根据分组名称获取分组ID（使用映射表优化性能）
const getGroupIdByName = (groupName: string | null | undefined): string | null => {
  if (!groupName) return null

  // 先尝试精确匹配
  const groupId = groupNameToIdMap.value.get(groupName)
  if (groupId) return groupId

  // 如果精确匹配失败，尝试去除首尾空格后匹配
  const trimmedName = groupName.trim()
  const trimmedGroupId = groupNameToIdMap.value.get(trimmedName)
  if (trimmedGroupId) {
    return trimmedGroupId
  }

  // 如果还是找不到，输出调试信息（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.warn('未找到匹配的分组:', {
      groupName,
      availableGroups: Array.from(groupNameToIdMap.value.keys())
    })
  }
  return null
}

// 获取门店基本信息筛选显示文本（改为计算属性，避免在模板中重复调用函数）
const basicInfoFilterText = computed(() => basicInfoFilter.value || '全部')

// 初始化城市筛选（弹窗打开时）
const initCityFilter = () => {
  // 将已选中的城市同步到 selectedCities
  selectedCities.value.clear()
  if (cityWeatherFilter.value && cityWeatherFilter.value.length > 0) {
    cityWeatherFilter.value.forEach((path: any[]) => {
      if (path && path.length > 1) {
        selectedCities.value.add(path[1])
      }
    })
  }
  // 如果有选中的城市，自动选择第一个城市所在的省份
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
  // 触发响应式更新
  selectedCitiesUpdateTrigger.value++
}

// 选择省份
const selectProvince = (provinceValue: string) => {
  selectedProvince.value = provinceValue
}

// 切换省份全选（使用映射表优化性能）
const toggleProvince = (provinceValue: string, checked: boolean) => {
  const province = provinceMap.value.get(provinceValue)
  if (!province || !province.children) return

  // 选中/操作省份时，确保右侧城市列表跟随显示当前省份
  selectedProvince.value = provinceValue

  if (checked) {
    // 全选该省份下的所有城市
    province.children.forEach((city: any) => {
      selectedCities.value.add(city.value)
    })
  } else {
    // 取消选择该省份下的所有城市
    province.children.forEach((city: any) => {
      selectedCities.value.delete(city.value)
    })
  }
  // 触发响应式更新
  selectedCitiesUpdateTrigger.value++
}

// 判断省份是否全选（使用映射表优化性能）
const isProvinceSelected = (provinceValue: string): boolean => {
  // 读取 selectedCitiesUpdateTrigger 以确保响应式追踪
  const _ = selectedCitiesUpdateTrigger.value
  const province = provinceMap.value.get(provinceValue)
  if (!province || !province.children || province.children.length === 0) return false
  return province.children.every((city: any) => selectedCities.value.has(city.value))
}

// 判断省份是否是部分选中（indeterminate 状态）（使用映射表优化性能）
const isProvinceIndeterminate = (provinceValue: string): boolean => {
  // 读取 selectedCitiesUpdateTrigger 以确保响应式追踪
  const _ = selectedCitiesUpdateTrigger.value
  const province = provinceMap.value.get(provinceValue)
  if (!province || !province.children || province.children.length === 0) return false

  const selectedCount = province.children.filter((city: any) =>
    selectedCities.value.has(city.value)
  ).length

  // 部分选中：有选中的城市，但不是全部
  return selectedCount > 0 && selectedCount < province.children.length
}

// 切换城市选择
const toggleCity = (city: any) => {
  if (selectedCities.value.has(city.value)) {
    selectedCities.value.delete(city.value)
  } else {
    selectedCities.value.add(city.value)
  }
  // 触发响应式更新，确保省份复选框状态能够更新
  selectedCitiesUpdateTrigger.value++
}

// 判断城市是否选中
const isCitySelected = (city: any): boolean => {
  return selectedCities.value.has(city.value)
}

// 清空城市筛选
const clearCityFilter = () => {
  selectedCities.value.clear()
  cityWeatherFilter.value = []
  selectedProvince.value = null
  // 触发响应式更新
  selectedCitiesUpdateTrigger.value++
}

// 确认城市筛选
const confirmCityFilter = () => {
  if (selectedCities.value.size === 0) {
    cityWeatherFilter.value = []
    emit('updateFilter', { citys: undefined })
  } else {
    // 将选中的城市转换为级联选择器的格式
    const selectedPaths: any[] = []
    const cityNames: string[] = []
    cityList.value.forEach((province: any) => {
      if (province.children) {
        province.children.forEach((city: any) => {
          if (selectedCities.value.has(city.value)) {
            selectedPaths.push([province.value, city.value])
            cityNames.push(city.value)
          }
        })
      }
    })
    cityWeatherFilter.value = selectedPaths
    emit('updateFilter', { citys: cityNames })
  }
  // 保存当前店铺类型的筛选状态
  saveCurrentFilterState()
  // 关闭筛选弹窗
  nextTick(() => {
    cityFilterPopoverVisible.value = false
  })
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

// 授权状态筛选文本
const getAuthStatusFilterText = () => {
  return authStatusFilter.value || '全部'
}

// 门店分组筛选文本
const getGroupFilterText = () => {
  return groupFilter.value || '全部'
}

// 实时收入/订单排序筛选文本
const getRealtimeSortText = () => {
  if (!realtimeSort.value.prop) {
    return '全部'
  }
  if (realtimeSort.value.prop === 'income') {
    return realtimeSort.value.order === 'asc' ? '收入升序' : '收入降序'
  }
  if (realtimeSort.value.prop === 'order_num') {
    return realtimeSort.value.order === 'asc' ? '订单升序' : '订单降序'
  }
  return '全部'
}

// 处理实时收入/订单排序筛选
const handleRealtimeSort = (command: string) => {
  if (command === '全部') {
    realtimeSort.value = { prop: '', order: null }
    emit('sortChange', { field: '', order: null })
    return
  }

  // 处理排序命令：income:asc, income:desc, order_num:asc, order_num:desc
  if (command.includes(':')) {
    const [prop, order] = command.split(':')
    const orderValue = order === 'asc' ? 'asc' : 'desc'
    realtimeSort.value = { prop: prop as 'income' | 'order_num', order: orderValue }
    emit('sortChange', { field: prop, order: orderValue })
  }
}

// 店铺多开筛选文本
const getMultiOpenFilterText = () => {
  if (multiOpenFilter.value === undefined || multiOpenFilter.value === 0) {
    return '全部'
  } else if (multiOpenFilter.value === 1) {
    return '未到期'
  } else if (multiOpenFilter.value === 2) {
    return '即将到期'
  } else if (multiOpenFilter.value === 5) {
    return '已到期'
  }
  return '全部'
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

  emit('updateFilter', { state: stateValue })
  // 保存当前店铺类型的筛选状态
  saveCurrentFilterState()
}

// 获取功能列筛选显示文本
const getFuncColumnFilterText = (funcCode: string): string => {
  const state = funcColumnFilters.value[funcCode]
  if (state === undefined || state === 0) {
    return '全部'
  }
  const stateMap: Record<number, string> = {
    1: '未到期',
    2: '即将到期',
    3: '已开启',
    4: '已关闭',
    5: '已到期'
  }
  return stateMap[state] || '全部'
}

// 功能列筛选（功能版）：与左侧菜单筛选字段一致（func_code / func_state）
// 自动出餐、自动回复、自动回评、智能推广这四个功能只能单项筛选
const handleFuncColumnFilter = (funcCode: string, value: number) => {
  // 这四个功能代码：只能单项筛选
  const singleSelectFuncCodes = ['ZDCC', 'IMZDHF', 'ZDHP', 'ZDTG']

  if (value === 0) {
    // 选择"全部"时，清除该功能列的筛选
    delete funcColumnFilters.value[funcCode]
    emit('updateFilter', { func_code: undefined, func_state: undefined })
  } else {
    // 如果是这四个功能之一，清除其他三个功能的筛选状态
    if (singleSelectFuncCodes.includes(funcCode)) {
      singleSelectFuncCodes.forEach(code => {
        if (code !== funcCode) {
          delete funcColumnFilters.value[code]
        }
      })
    }
    // 更新筛选状态
    funcColumnFilters.value[funcCode] = value
    emit('updateFilter', { func_code: funcCode, func_state: value })
  }
  // 保存当前店铺类型的筛选状态
  saveCurrentFilterState()
}

// 城市天气筛选改变
const handleCityWeatherFilter = (value: any) => {
  if (!value || value.length === 0) {
    cityWeatherFilter.value = []
    emit('updateFilter', { citys: undefined })
  } else {
    cityWeatherFilter.value = value
    // 将级联选择器的值转换为城市名称数组
    const cityNames = value.map((item: any[]) => item[1])
    emit('updateFilter', { citys: cityNames })
  }
}

// 授权状态筛选改变
const handleAuthStatusFilter = (value: string) => {
  authStatusFilter.value = value === '全部' ? undefined : value

  if (value === '全部') {
    emit('updateFilter', { ck_online: undefined, state: undefined })
  } else if (value === '授权正常') {
    emit('updateFilter', { ck_online: true, state: undefined })
  } else if (value === '授权异常') {
    emit('updateFilter', { ck_online: undefined, state: 3 })
  }
  // 保存当前店铺类型的筛选状态
  saveCurrentFilterState()
}

// 门店分组筛选改变
const handleGroupFilter = (value: string) => {
  groupFilter.value = value === '全部' ? undefined : value

  if (value === '全部') {
    emit('updateFilter', { group: undefined })
  } else {
    // 需要根据分组名称找到分组ID（使用映射表优化性能）
    const groupId = groupNameToIdMap.value.get(value)
    emit('updateFilter', { group: groupId || value })
  }
  // 保存当前店铺类型的筛选状态
  saveCurrentFilterState()
}

// 店铺多开筛选改变
const handleMultiOpenFilter = (value: number) => {
  multiOpenFilter.value = value === 0 ? undefined : value

  if (value === 0) {
    // 选择"全部"时，清除筛选
    emit('updateFilter', { func_code: undefined, func_state: undefined, time_state: undefined })
  } else {
    // 店铺多开使用EndTime字段，需要同时设置func_code和time_state
    // func_state用于功能筛选，time_state用于店铺到期时间筛选
    // 映射关系：未到期(1) -> time_state=1, 即将到期(2) -> time_state=2, 已到期(5) -> time_state=3
    let timeState: number | undefined
    if (value === 1) {
      timeState = 1 // 未到期
    } else if (value === 2) {
      timeState = 2 // 即将到期
    } else if (value === 5) {
      timeState = 3 // 已到期
    }
    emit('updateFilter', { func_code: 'OPENSHOP', func_state: value, time_state: timeState })
  }
  // 保存当前店铺类型的筛选状态
  saveCurrentFilterState()
}

// 获取城市列表
// 获取城市列表（带缓存）
const getCityList = async () => {
  // 防止重复请求
  if (isCityListLoading.value) {
    return
  }

  try {
    isCityListLoading.value = true

    // 使用缓存获取城市列表
    const cachedData = await getCachedCityList(async () => {
      const res: any = await getCity()
      if (res.code === 200) {
        // 将城市数据转换为级联选择器需要的格式
        const arr: any[] = []
        const data = res.data || {}
        for (const key in data) {
          const children = data[key].map((item: any) => {
            return { value: item, label: item }
          })
          arr.push({ value: key, label: key, children })
        }
        return arr
      }
      return null
    })

    if (cachedData) {
      cityList.value = cachedData
    }
  } catch (error) {
    console.error('获取城市列表失败:', error)
  } finally {
    isCityListLoading.value = false
  }
}

/**
 * 前端已实现配置 UI 的功能（AllFuncSetting）：配置驱动，新增时只改此处 + AllFuncSetting 即可
 * hasSwitch: 是否显示开关；settingText: 设置链接文案；payTypeText: 续费弹窗展示名
 */
const FRONTEND_FUNC_CONFIG: Record<string, { hasSwitch: boolean; settingText: string; payTypeText: string }> = {
  ZDCC: { hasSwitch: true, settingText: '防漏单设置', payTypeText: '自动出餐' },
  IMZDHF: { hasSwitch: true, settingText: '回复设置', payTypeText: 'IM自动回复' },
  ZDHP: { hasSwitch: true, settingText: '回评设置', payTypeText: '自动回评' },
  ZDTG: { hasSwitch: true, settingText: '点金设置', payTypeText: '智能推广' },
  CPDT: { hasSwitch: false, settingText: '动图设置', payTypeText: '菜品动图' }
}
const FRONTEND_FUNC_SET = new Set(Object.keys(FRONTEND_FUNC_CONFIG))
/** 功能列元数据：code -> { hasBlazorUI, name }，用于 openDrawer 判断是否用 Blazor */
const functionColumnsMeta = ref<Map<string, { hasBlazorUI: boolean; name: string }>>(new Map())

/** 获取 API 线路（与 ApiManager 一致） */
function getApiBaseUrl(): string {
  try {
    const s = localStorage.getItem('baseUrl')
    if (!s) return ''
    const o = JSON.parse(s)
    return o?.default ?? ''
  } catch {
    return ''
  }
}

/** 构建 Blazor 配置 UI 地址：{线路}/config/{店铺类型}/{店铺id}/{功能代码}?token={jwt_token} */
function getBlazorConfigUrl(shopType: number, shopId: string, funcCode: string): string {
  const base = getApiBaseUrl().replace(/\/$/, '')
  const token = getToken() || ''
  return `${base}/config/${shopType}/${shopId}/${funcCode}?token=${encodeURIComponent(token)}`
}

const blazorDrawerVisible = ref(false)
const blazorDrawerUrl = ref('')
const blazorDrawerTitle = ref('功能设置')
const blazorDrawerShopName = ref('')
const blazorDrawerIcon = ref('')
const blazorDrawerShopImg = ref('')

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)
// 固定列（非功能列 + 操作），功能列由 GetShopListFunctionColumns 动态生成
const getFixedNonFuncColumns = (): any[] => {
  const baseColumns: any[] = []

  // 功能版：店铺多开列放在门店基本信息前面（除了美团闪购、美团医药、饿百零售，这三个放在门店基本信息后面）
  if (props.isFunctional) {
    // 部分店铺类型不显示"店铺多开"列
    const excludeMultiRenewTypes: ShopType[] = [
      // 所有类型都显示店铺多开列
    ]
    // 这些平台的店铺多开列放在门店基本信息后面
    const multiOpenAfterBasicInfoTypes = [
      ShopType.美团闪购,
      ShopType.美团医药,
      ShopType.饿百零售,
      ShopType.抖店即时零售
    ]
    // 饿了么复制版（饿了么官方=8）不支持激活任何功能：不显示店铺多开列
    const shouldShowMultiOpenBefore = props.shopType
      ? props.shopType !== ShopType.饿了么官方 &&
      !excludeMultiRenewTypes.includes(props.shopType) &&
      !multiOpenAfterBasicInfoTypes.includes(props.shopType)
      : true

    if (shouldShowMultiOpenBefore) {
      baseColumns.push(
        { label: '店铺多开', sortable: false, checked: true, minWidth: 130, align: 'center' as const, funcCode: 'OPENSHOP' }
      )
    }
  } else {
    // 基础版：饿了么复制版不展示多开，其它类型展示
    if (props.shopType !== ShopType.饿了么官方) {
      baseColumns.push(
        { label: '店铺多开', sortable: false, checked: true, minWidth: 110, align: 'center' as const, funcCode: 'OPENSHOP' }
      )
    }
  }

  // 门店基本信息列
  baseColumns.push(
    { label: '门店基本信息', sortable: false, checked: true, minWidth: 360, align: 'left' as const, fixed: 'left' as const, disableCheck: true, funcCode: null }
  )

  // 功能版：美团闪购、美团医药、饿百零售、抖音即时零售的店铺多开列放在门店基本信息后面
  if (props.isFunctional) {
    const multiOpenAfterBasicInfoTypes = [
      ShopType.美团闪购,
      ShopType.美团医药,
      ShopType.饿百零售,
      ShopType.抖店即时零售
    ]
    // 饿了么复制版（饿了么官方=8）不显示店铺多开列
    if (props.shopType && props.shopType !== ShopType.饿了么官方 && multiOpenAfterBasicInfoTypes.includes(props.shopType)) {
      baseColumns.push(
        { label: '店铺多开', sortable: false, checked: true, minWidth: 130, align: 'center' as const, funcCode: 'OPENSHOP' }
      )
    }
  }

  // 在门店基本信息后面添加：实时收入/订单（合并列）、城市天气、授权状态、门店分组
  if (props.isFunctional) {
    // 功能版：饿了么复制版不展示实时收入/实时订单，其它类型全部展示
    if (props.shopType === ShopType.饿了么官方) {
      baseColumns.push(
        { label: '城市天气', sortable: false, checked: true, minWidth: 110, align: 'center' as const, funcCode: null },
        { label: '授权状态', checked: true, minWidth: 190, align: 'center' as const, funcCode: null },
        { label: '门店分组', sortable: false, checked: true, minWidth: 130, align: 'center' as const, funcCode: null }
      )
    } else {
      baseColumns.push(
        { label: '实时收入/订单', sortable: false, checked: true, minWidth: 160, align: 'center' as const, funcCode: null, prop: 'realtime' },
        { label: '城市天气', sortable: false, checked: true, minWidth: 110, align: 'center' as const, funcCode: null },
        { label: '授权状态', checked: true, minWidth: 190, align: 'center' as const, funcCode: null },
        { label: '门店分组', sortable: false, checked: true, minWidth: 130, align: 'center' as const, funcCode: null }
      )
    }
  } else {
    // 基础版：饿了么复制版不展示实时收入/实时订单，其它类型全部展示
    if (props.shopType === ShopType.饿了么官方) {
      baseColumns.push(
        { label: '城市天气', sortable: false, checked: true, minWidth: 100, align: 'center' as const, funcCode: null },
        { label: '授权状态', checked: true, minWidth: 140, align: 'center' as const, funcCode: null },
        { label: '门店分组', sortable: false, checked: true, minWidth: 110, align: 'center' as const, funcCode: null }
      )
    } else {
      baseColumns.push(
        { label: '实时收入/订单', sortable: false, checked: true, minWidth: 160, align: 'center' as const, funcCode: null, prop: 'realtime' },
        { label: '城市天气', sortable: false, checked: true, minWidth: 100, align: 'center' as const, funcCode: null },
        { label: '授权状态', checked: true, minWidth: 140, align: 'center' as const, funcCode: null },
        { label: '门店分组', sortable: false, checked: true, minWidth: 110, align: 'center' as const, funcCode: null }
      )
    }
  }

  return baseColumns
}

const fixedNonFuncColumns = computed(() => getFixedNonFuncColumns())
const fixedEndColumn = { label: '操作', checked: true, width: 130, align: 'center' as const, fixed: 'right' as const, disableCheck: true, funcCode: null as string | null }
const columns = ref<any>([])
const showFunctionPausedMessage = () => {
  gp.$baseMessage('功能暂停使用', 'error', 'hey')
}
const isFunctionActive = (funcCode?: string) => {
  if (!funcCode) {
    return true
  }
  const funcInfo = functionInfoMap.value[funcCode]
  if (!funcInfo) {
    return true
  }
  return funcInfo.avtag
}
const checkList = ref<any>([])
// 优化：使用 Set 来加速查找，避免每次 filter 都执行 includes
const checkListSet = computed(() => new Set(checkList.value))
const finallyColumns = computed(() => {
  const set = checkListSet.value
  return columns.value.filter((item: any) => set.has(item.label))
})

// 标记是否已经初始化过列（必须在 watch 之前定义）
const columnsInitialized = ref(false)
const border = ref<boolean>(false)
const lineHeight = ref<any>('default')
const stripe = ref<boolean>(true)
const emit = defineEmits(['updatePage', 'updateFilter', 'sortChange', 'save-scroll', 'shopSelectionChange'])
const selectRows = ref<any>([])
const drawerState = ref(false)
const currentRow = ref({})

// 批量续费选中的店铺（使用 Element Plus 原生选择）
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

// 监听批量续费模式变化，清空选中
watch(() => props.batchRenewMode, (newVal) => {
  if (!newVal && tableRef.value) {
    // 清空表格选择
    tableRef.value.clearSelection()
    emit('shopSelectionChange', [])
  }
})
const drawerFun = ref('')

// 处理表格排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  // 将排序信息传递给父组件
  const sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : null
  emit('sortChange', {
    field: prop || '',
    order: sortOrder as 'asc' | 'desc' | null
  })
}

// 基础版：实时列排序状态（只允许点排序图标触发）
const realtimeSort = ref<{ prop: 'income' | 'order_num' | ''; order: 'asc' | 'desc' | null }>({ prop: '', order: null })

const toggleRealtimeSort = (prop: 'income' | 'order_num', order: 'asc' | 'desc') => {
  // 同一列同一方向再点一次 -> 取消排序
  if (realtimeSort.value.prop === prop && realtimeSort.value.order === order) {
    realtimeSort.value = { prop: '', order: null }
    emit('sortChange', { field: '', order: null })
    return
  }
  realtimeSort.value = { prop, order }
  emit('sortChange', { field: prop, order })
}

// 标签页类型定义
interface TabItem {
  label: string
  name: string
  muted?: number
}

// Webview 多开相关状态声明
const activetab_func = ref('1')
const listtabs_func = ref<TabItem[]>([{ label: '首页', name: '1' }])
const activwebv = ref<any[]>([])
const activeName = ref('')
const initializedWebviews = new Set<string>()

// 优化：过滤后的标签页列表（避免在模板中重复 filter）
const filteredTabs = computed(() => listtabs_func.value.filter(tab => tab.name !== '1'))

// 优化：标签页名称到索引的映射表（避免在模板中重复 findIndex）
const tabIndexMap = computed(() => {
  const map = new Map<string, number>()
  listtabs_func.value.forEach((tab, index) => {
    map.set(tab.name, index)
  })
  return map
})
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
// 平台类型名称映射
const SHOP_TYPE_NAME_MAP: Record<number, string> = {
  [ShopType.美团]: '美团外卖',
  [ShopType.饿了么]: '饿了么外卖',
  [ShopType.美团闪购]: '美团闪购',
  [ShopType.美团医药]: '美团医药',
  [ShopType.饿百零售]: '饿百零售',
  [ShopType.京东到家]: '京东到家',
  [ShopType.抖店即时零售]: '抖音即时零售',
  [ShopType.饿了么官方]: '饿了么官方'
}

/**
 * 获取平台类型名称
 */
const getShopTypeName = (shopType: number): string => {
  return SHOP_TYPE_NAME_MAP[shopType] || ''
}

/**
 * 格式化到期时间，如果为空或已过期则显示"已到期"
 * @param time 时间字符串
 * @returns 格式化后的时间字符串或"已到期"
 */
const formatExpireTime = (time: any): string => {
  // 如果时间为空、undefined、null 或空字符串，返回"已到期"
  if (!time || time === 'undefined' || time === 'null' || time === '') {
    return '已到期'
  }

  // 尝试解析时间并检查是否已过期
  try {
    const endDate = new Date(time)
    // 检查日期是否有效
    if (isNaN(endDate.getTime())) {
      return '已到期'
    }

    // 与当前时间比较
    const now = new Date()
    // 如果到期时间已过（小于当前时间），返回"已到期"
    if (endDate.getTime() < now.getTime()) {
      return '已到期'
    }

    // 如果未过期，返回原时间字符串
    return time
  } catch {
    // 如果解析失败，返回"已到期"
    return '已到期'
  }
}

/**
 * 复制门店信息到剪贴板
 * @param row 门店数据
 */
const copyshop = async (row: any) => {
  // 构建门店信息文本
  const shopInfoLines = [
    `平台：${getShopTypeName(row.shop_type)}`,
    `店铺名称：${row.name}`,
    `门店ID：${row.office_id}`,
    `店铺ID：${row.id}`
  ]

  // 功能代码到显示名称的映射
  const funcNameMap: Record<string, string> = {
    'ZDCC': '自动出餐',
    'IMZDHF': '自动回复',
    'ZDHP': '自动回评',
    'ZDTG': '自动点金',
    'PJSS': '评价申诉',
    'CHATPUSH': '日报推送'
  }

  // 功能代码到时间字段的映射
  const funcTimeFieldMap: Record<string, string> = {
    'ZDCC': 'ZDCCtime',
    'IMZDHF': 'IMZDHFtime',
    'ZDHP': 'ZDHPtime',
    'ZDTG': 'ZDTGtime',
    'PJSS': 'PJSStime',
    'CHATPUSH': 'CHATPUSHtime'
  }

  try {
    // 获取平台支持的功能列表
    const supportedFunctions = await getShopListFunctionColumns(row.shop_type as ShopType)
    const supportedFuncCodes = new Set(supportedFunctions.map(f => f.code))

    // 按顺序添加支持的功能到期时间
    const funcOrder = ['ZDCC', 'IMZDHF', 'ZDHP', 'ZDTG', 'PJSS', 'CHATPUSH']
    for (const funcCode of funcOrder) {
      const timeField = funcTimeFieldMap[funcCode]
      const isSupported = supportedFuncCodes.has(funcCode)

      // 对于 CHATPUSH（门店推送），无论是否激活，只要平台支持或数据中有时间字段就显示
      // 对于其他功能，只有平台支持才显示
      let shouldShow = false
      if (funcCode === 'CHATPUSH') {
        // CHATPUSH：平台支持就显示，或者数据中有时间字段就显示（即使值为 undefined）
        // 使用多种方法检测字段是否存在，确保能检测到值为 undefined 的字段
        let hasTimeField = false
        if (timeField) {
          hasTimeField = timeField in row ||
            Object.prototype.hasOwnProperty.call(row, timeField) ||
            Object.keys(row).includes(timeField)
        }
        shouldShow = isSupported || hasTimeField
      } else {
        // 其他功能：只有平台支持才显示
        shouldShow = isSupported
      }

      if (shouldShow) {
        const funcName = funcNameMap[funcCode] || funcCode
        // formatExpireTime 会处理 undefined/null/空值，返回"已到期"
        const expireTime = formatExpireTime(row[timeField])
        shopInfoLines.push(`${funcName}到期时间：${expireTime}`)
      }
    }
  } catch (error) {
    console.error('获取平台支持的功能列表失败:', error)
    // 如果获取失败，使用默认的功能列表（向后兼容，仅显示常见功能）
    // 注意：这里不判断平台支持情况，因为无法获取到支持列表
    shopInfoLines.push(`防漏单到期时间：${formatExpireTime(row.ZDCCtime)}`)
    shopInfoLines.push(`自动回复到期时间：${formatExpireTime(row.IMZDHFtime)}`)
    shopInfoLines.push(`自动回评到期时间：${formatExpireTime(row.ZDHPtime)}`)
    shopInfoLines.push(`自动点金到期时间：${formatExpireTime(row.ZDTGtime)}`)
  }

  // 获取绑定码（使用缓存）
  let bindCode = row.codeStr
  if (!bindCode) {
    try {
      const code = await getCachedBindCode(row.id, async () => {
        const res: any = await createBindCode(row.id)
        return res
      })
      if (code) {
        bindCode = `${code}(5分钟有效)`
      }
    } catch (error) {
      console.error('获取绑定码失败:', error)
    }
  }

  // 添加绑定码到信息列表
  if (bindCode) {
    shopInfoLines.push(`门店绑定码：${bindCode}`)
  }

  // 复制到剪贴板
  const data = shopInfoLines.join('\n')
  const success = await copyData(data)

  if (success) {
    gp.$baseMessage('复制成功', 'success', 'hey')
  } else {
    gp.$baseMessage('复制失败', 'error', 'hey')
  }
}
const openDrawer = (row: any, fun_code: string) => {
  if (!isFunctionActive(fun_code)) {
    showFunctionPausedMessage()
    return
  }

  // 前端已实现的 5 个功能：用 AllFuncSetting；需校验续费
  if (FRONTEND_FUNC_SET.has(fun_code)) {
    if (row[`${fun_code}time`] === '已到期') {
      return gp.$baseMessage('请先续费再使用设置功能', 'error', 'hey')
    }
    drawerState.value = true
    currentRow.value = row
    drawerFun.value = fun_code
    return
  }

  // 后端 Blazor 配置 UI：hasBlazorUI 为 true 时用抽屉打开
  const meta = functionColumnsMeta.value.get(fun_code)
  if (meta?.hasBlazorUI) {
    blazorDrawerUrl.value = getBlazorConfigUrl(row.shop_type, row.id, fun_code)
    blazorDrawerTitle.value = `${meta.name}设置`
    blazorDrawerShopName.value = row.name ?? ''
    blazorDrawerIcon.value = icon
    blazorDrawerShopImg.value = row.img ?? ''
    blazorDrawerVisible.value = true
    return
  }

  gp.$baseMessage('该功能暂不支持设置', 'info', 'hey')
}
const closeDrawer = () => {
  drawerState.value = false
}
const setSelectRows = (value: any) => {
  selectRows.value = value
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
// 存储每个店铺名的文本溢出状态
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

// 检测备注是否溢出（简单判断：如果备注长度超过一定字符数，认为可能溢出）
const isRemarkOverflow = (row: any) => {
  if (!row.notes || !row.notes.trim()) return false
  // 根据列宽估算，如果备注超过25个字符，可能溢出
  // 这里使用一个简单的判断，实际可以根据列宽动态计算
  return row.notes.length > 25
}
const viewBindCode = (row: any) => {
  createBindCode(row.id).then(async (res: any) => {
    if (res.code === 200) {
      row.codeStr = `${res.data}(5分钟内有效)`
      row.code = res.data
      if (await copyData(row.code)) {
        gp.$baseMessage('复制成功(绑定码5分钟有效)', 'success', 'hey')
      } else {
        gp.$baseMessage('复制失败', 'error', 'hey')
      }
    }
  })
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
        return true
      } catch (fallbackError) {
        console.error('备用复制方法失败:', fallbackError)
        return false
      }
    }
    return false
  }
}
/**
 * 计算剩余天数（不显示小时）
 * @param timeStr 时间字符串，可能是日期格式或"已到期"等文本
 * @returns 返回"X天"或"已到期"或"未购买"
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

/**
 * 格式化授权时间，去除秒数
 * @param timeStr 时间字符串，格式如 "2026-01-27 14:33:55"
 * @returns 返回格式化的时间字符串，如 "2026-01-27 14:33" 或 "暂无"
 */
// 格式化收入显示（带单位）
const formatIncome = (income: number | undefined | null): string => {
  // 处理 null、undefined、-1 的情况
  if (income == null || income === undefined || income === -1) {
    return '0元'
  }
  // 转换为数字并检查是否为有效数字
  const incomeNum = Number(income)
  if (isNaN(incomeNum)) {
    return '0元'
  }
  return `${incomeNum}元`
}

// 检查店铺是否有任意有效的功能
const hasAnyValidFunction = (row: any): boolean => {
  // 检查 extra_data.func_enable 或 func_info
  const funcList = row.extra_data?.func_enable || row.func_info || []

  if (!Array.isArray(funcList) || funcList.length === 0) {
    return false
  }

  // 检查是否有任意功能是启用且未到期的
  const now = new Date()
  return funcList.some((func: any) => {
    if (!func.enable) return false
    if (!func.end_time) return false

    const endTime = new Date(func.end_time)
    return endTime > now  // 未到期
  })
}

/**
 * 检查是否有实时数据（收入或订单）
 * @param row - 店铺数据行
 * @returns 如果 income 或 order_num 有有效值，返回 true
 */
const hasRealtimeData = (row: any): boolean => {
  // 兼容两种数据结构：row.income 或 row.extra_data?.income
  const income = row.income ?? row.extra_data?.income
  const order_num = row.order_num ?? row.extra_data?.order_num

  // 判断是否为有效值（不为 null/undefined/-1）
  const hasIncome = income != null && income !== -1
  const hasOrderNum = order_num != null && order_num !== -1

  return hasIncome || hasOrderNum
}

/**
 * 格式化收入数字（不带单位）
 * @param income - 收入金额
 * @returns 格式化后的收入字符串
 */
const formatIncomeNumber = (income: number | undefined | null): string => {
  if (income == null || income === -1) {
    return '0'
  }
  const incomeNum = Number(income)
  return isNaN(incomeNum) ? '0' : String(incomeNum)
}

// 格式化订单数显示（带单位）
const formatOrderNum = (orderNum: number | undefined | null): string => {
  // 处理 null、undefined、-1 的情况
  if (orderNum == null || orderNum === undefined || orderNum === -1) {
    return '0单'
  }
  // 转换为数字并检查是否为有效数字
  const orderNumValue = Number(orderNum)
  if (isNaN(orderNumValue)) {
    return '0单'
  }
  return `${orderNumValue}单`
}

/**
 * 格式化订单数字（不带单位）
 * @param orderNum - 订单数量
 * @returns 格式化后的订单字符串
 */
const formatOrderNumber = (orderNum: number | undefined | null): string => {
  if (orderNum == null || orderNum === -1) {
    return '0'
  }
  const orderNumValue = Number(orderNum)
  return isNaN(orderNumValue) ? '0' : String(orderNumValue)
}

const formatAuthTime = (time: string | Date | undefined | null): string => {
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

/**
 * 格式化功能到期时间显示
 * @param timeStr 时间字符串
 * @returns 返回格式化的显示文本，如"功能剩余X天"或"功能已到期"或"功能未购买"
 */
const formatFuncExpireTime = (timeStr: string | undefined | null): string => {
  const remaining = getRemainingDays(timeStr)
  if (remaining === '已到期' || remaining === '未购买') {
    return `${remaining}`
  }
  return `剩余 ${remaining}`
}

// 基础版实时收入/实时订单对比数据处理函数（与运营版一致）
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

const setShopTop = (row: any, state: boolean) => {
  setShopIsTop({ shop: row.id, top: state }).then((res: any) => {
    if (res.code === 200) {
      row.is_top = state
      let str2 = state ? '置顶成功！' : '取消置顶成功'
      gp.$baseMessage(str2, 'success', 'hey')
      queryData()
    }
  })
}

const shopData = ref({})
const payTypeText = ref('')
const payDialogState = ref(false)
const payFunShow = (row: any, funcCode: string | null, typeText: string) => {
  if (funcCode && !isFunctionActive(funcCode)) {
    showFunctionPausedMessage()
    return
  }
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
const setFunEnable = async (row: any, fun_code: string) => {
  const isEnableAction = !!row[fun_code]
  if (isEnableAction && !isFunctionActive(fun_code)) {
    row[fun_code] = false
    showFunctionPausedMessage()
    return
  }
  try {
    const res: any = await enableFunc({ shop: row.id, code: fun_code, enable: row[fun_code] })
    if (res.code === 200) {
      gp.$baseMessage('操作成功!', 'success', 'hey')
      emit('updatePage', {})
    }
  } catch (error) {
    // 处理请求失败的情况
    row[fun_code] = !row[fun_code]
    console.error('请求失败:', error, row)
    gp.$baseMessage('请求失败，请重试!', 'error', 'hey')
  }
}

const removeShop = (row: any) => {
  unBindShop({
    recycle_bin: true,
    shopIds: [row.id]
  }).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('已移除，可在回收站查看!', 'success', 'hey')
      // 刷新列表
      emit('updatePage', {})
    }
  })
}

// 切换置顶
const handleToggleTop = (row: any) => {
  setShopTop(row, !row.is_top)
}

// 分享店铺对话框状态
const shareDialogVisible = ref(false)
const shareCode = ref('')
const currentShareShop = ref<any>(null)
const shopNameRef = ref<HTMLElement | null>(null)
const isShopNameOverflow = ref(false)

// 检测店铺名是否溢出
const checkShopNameOverflow = () => {
  nextTick(() => {
    if (shopNameRef.value) {
      isShopNameOverflow.value = shopNameRef.value.scrollWidth > shopNameRef.value.clientWidth
    }
  })
}

// 监听分享弹窗显示和店铺变化
watch([shareDialogVisible, currentShareShop], () => {
  if (shareDialogVisible.value && currentShareShop.value) {
    checkShopNameOverflow()
  }
})

// 分享店铺
const handleShare = async (row: any) => {
  currentShareShop.value = row
  // 如果已有分享码且未过期，直接使用
  if (row.codeStr && row.code) {
    shareCode.value = row.code
    shareDialogVisible.value = true
    checkShopNameOverflow()
  } else {
    // 生成新的分享码
    await generateShareCode(row)
  }
}

// 生成分享码
const generateShareCode = async (row: any) => {
  try {
    const res: any = await createBindCode(row.id)
    if (res.code === 200) {
      shareCode.value = res.data
      row.codeStr = `${res.data}(5分钟内有效)`
      row.code = res.data
      shareDialogVisible.value = true
      checkShopNameOverflow()
    } else {
      gp.$baseMessage('生成分享码失败', 'error', 'hey')
    }
  } catch (error) {
    console.error('生成分享码失败:', error)
    gp.$baseMessage('生成分享码失败', 'error', 'hey')
  }
}

// 重新生成分享码
const regenerateShareCode = async () => {
  if (currentShareShop.value) {
    await generateShareCode(currentShareShop.value)
  }
}

// 复制分享码
const copyShareCode = async () => {
  try {
    await navigator.clipboard.writeText(shareCode.value)
    gp.$baseMessage('复制成功', 'success', 'hey')
  } catch (error) {
    // 备用复制方法
    try {
      const input = document.createElement('textarea')
      input.value = shareCode.value
      input.style.position = 'absolute'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      gp.$baseMessage('复制成功', 'success', 'hey')
    } catch (fallbackError) {
      gp.$baseMessage('复制失败', 'error', 'hey')
    }
  }
}

// 复制门店信息（在分享弹窗中使用）
const copyShopInfo = async () => {
  if (!currentShareShop.value) return
  await copyshop(currentShareShop.value)
}

// 复制门店信息（在门店名称悬停按钮中使用）
const copyShopNameInfo = async (row: any) => {
  await copyshop(row)
}

// 关闭分享对话框
const closeShareDialog = () => {
  shareDialogVisible.value = false
  currentShareShop.value = null
}

// 删除店铺
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除此店铺吗？删除后可在回收站查看', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true
  }).then(() => {
    removeShop(row)
  }).catch(() => { })
}
// 添加店铺相关 开始------------------------------------------------------------
const showShopMsg = ref({})
const showShopMsgState = ref(false)
const isBind = ref(false)
const closeShopAfter = () => {
  showShopMsgState.value = false
}
const openApp = async (name: any) => {
  // 饿了么官方（复制版）使用后端授权地址，不使用 electron.openBrowser
  if (props.shopType === ShopType.饿了么官方) {
    try {
      const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方)
      window.open(authResult.Url, '_blank')
      gp.$baseMessage('请在打开的页面中完成授权', 'info', 'hey')
    } catch (error: any) {
      gp.$baseMessage('获取授权地址失败: ' + (error.message || '未知错误'), 'error', 'hey')
    }
    return
  }

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
    ; (globalThis as any).electron.openBrowser(invokeMap[props.shopType as number], params, async (res: any) => {
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
          } else {
            gp.$baseMessage('店铺添加成功!', 'success', 'hey')
            showShopMsg.value = {
              name: res1.data.name,
              office_id: res1.data.office_id,
              shop_type: params.shop_type,
              // shop_user: res?.info?.u,
              // shop_pwd: res?.info?.p,
              shop_user: '',
              shop_pwd: '',
              cookies: res.cookies,
              reset_power: false
            }
            showShopMsgState.value = true
            isBind.value = false
          }
          emit('updatePage', {})
        }
      })
    })
}
// 添加店铺相关 结束------------------------------------------------------------
// 后台打开 开始 --------------------------------------------------------------
// 状态管理：为每个店铺类型保存独立的 webview 状态
const getWebviewStateKey = (shopType: number) => `webview-state-${shopType}`
const saveWebviewState = (shopType: number) => {
  try {
    const state = {
      activetab_func: activetab_func.value,
      listtabs_func: listtabs_func.value,
      activwebv: activwebv.value,
      activeName: activeName.value,
      initializedWebviews: Array.from(initializedWebviews)
    }
    sessionStorage.setItem(getWebviewStateKey(shopType), JSON.stringify(state))
  } catch (e) {
    console.error('保存 webview 状态失败:', e)
  }
}
const loadWebviewState = (shopType: number) => {
  try {
    const saved = sessionStorage.getItem(getWebviewStateKey(shopType))
    if (saved) {
      const state = JSON.parse(saved)
      activetab_func.value = state.activetab_func || '1'
      listtabs_func.value = state.listtabs_func || [{ label: '首页', name: '1' }]
      activwebv.value = state.activwebv || []
      activeName.value = state.activeName || ''
      initializedWebviews.clear()
      if (state.initializedWebviews) {
        state.initializedWebviews.forEach((id: string) => initializedWebviews.add(id))
      }
      return true
    }
  } catch (e) {
    console.error('加载 webview 状态失败:', e)
  }
  return false
}

// 初始化：尝试从保存的状态恢复
const hasRestoredState = loadWebviewState(props.shopType as number)
if (!hasRestoredState) {
  // 如果没有保存的状态，使用默认值
  activetab_func.value = '1'
  listtabs_func.value = [{ label: '首页', name: '1' }]
  activwebv.value = []
  activeName.value = ''
}

// 监听 shopType 变化，保存和恢复 webview 状态，并重新过滤功能列
// 按店铺类型保存滚动位置的 Map
const shopTypeScrollPositions = ref<Map<number, number>>(new Map())

// 查找滚动容器
const findScrollContainer = (): HTMLElement | null => {
  if (!tableRef.value?.$el) {
    return null
  }

  const tableEl = tableRef.value.$el
  const possibleContainers = [
    tableEl?.querySelector('.el-scrollbar__wrap'),
    tableEl?.querySelector('.el-table__body-wrapper'),
    tableEl?.querySelector('.el-table__body'),
    tableEl
  ].filter(Boolean) as HTMLElement[]

  // 找到可滚动高度最大的容器（这才是真正的滚动容器）
  let maxScrollableContainer: HTMLElement | null = null
  let maxScrollHeight = 0

  possibleContainers.forEach(container => {
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const canScroll = scrollHeight > clientHeight

    if (canScroll && scrollHeight > maxScrollHeight) {
      maxScrollHeight = scrollHeight
      maxScrollableContainer = container
    }
  })

  // 优先使用可滚动的容器
  return maxScrollableContainer || possibleContainers[0] || null
}

// 保存指定店铺类型的滚动位置
const saveShopTypeScrollPosition = (shopType: number) => {
  if (activetab_func.value === '1') {
    const scrollContainer = findScrollContainer()
    if (scrollContainer) {
      const scrollTop = scrollContainer.scrollTop
      shopTypeScrollPositions.value.set(shopType, scrollTop)
    }
  }
}

// 恢复指定店铺类型的滚动位置
const restoreShopTypeScrollPosition = (shopType: number) => {
  if (activetab_func.value === '1') {
    const savedPosition = shopTypeScrollPositions.value.get(shopType)
    if (savedPosition !== undefined) {
      nextTick(() => {
        const scrollContainer = findScrollContainer()
        if (scrollContainer) {
          // 使用 requestAnimationFrame 确保在浏览器下一帧渲染前设置滚动位置
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = savedPosition
          })
        }
      })
    } else {
      // 如果没有保存的位置，重置为顶部
      nextTick(() => {
        const scrollContainer = findScrollContainer()
        if (scrollContainer) {
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = 0
          })
        }
      })
    }
  }
}

// 设置滚动监听器，实时保存当前店铺类型的滚动位置
let scrollListener: ((e: Event) => void) | null = null
const setupScrollListener = () => {
  // 移除旧的监听器
  if (scrollListener) {
    const oldContainer = findScrollContainer()
    if (oldContainer) {
      oldContainer.removeEventListener('scroll', scrollListener)
    }
  }

  // 只有在首页且表格已挂载时才添加监听器
  if (activetab_func.value !== '1' || !tableRef.value || !props.shopType) {
    return
  }

  const scrollContainer = findScrollContainer()
  if (!scrollContainer) {
    return
  }

  // 节流保存滚动位置，在边界时跳过处理以提升性能
  let throttleTimer: ReturnType<typeof setTimeout> | null = null
  let lastSavedScrollLeft = -1
  let cachedScrollWidth = 0
  let cachedClientWidth = 0
  let cacheTimestamp = 0
  const CACHE_DURATION = 100 // 缓存100ms

  scrollListener = () => {
    if (throttleTimer) return

    const scrollLeft = scrollContainer.scrollLeft
    const now = Date.now()

    // 缓存 scrollWidth 和 clientWidth，避免频繁读取（这些属性读取会触发重排）
    if (now - cacheTimestamp > CACHE_DURATION) {
      cachedScrollWidth = scrollContainer.scrollWidth
      cachedClientWidth = scrollContainer.clientWidth
      cacheTimestamp = now
    }

    // 快速检测是否在边界且位置未变化，如果是则跳过
    const isAtEdge = scrollLeft <= 1 || scrollLeft >= cachedScrollWidth - cachedClientWidth - 1

    // 如果在边界且横向滚动位置未变化，跳过保存
    if (isAtEdge && Math.abs(scrollLeft - lastSavedScrollLeft) < 0.5) {
      return
    }

    lastSavedScrollLeft = scrollLeft

    throttleTimer = setTimeout(() => {
      if (props.shopType) {
        saveShopTypeScrollPosition(props.shopType as number)
      }
      throttleTimer = null
    }, 100) // 100ms 节流
  }

  scrollContainer.addEventListener('scroll', scrollListener, { passive: true })
}

// 移除滚动监听器
const removeScrollListener = () => {
  if (scrollListener) {
    const scrollContainer = findScrollContainer()
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', scrollListener)
    }
    scrollListener = null
  }
}

/**
 * 根据 GetShopListFunctionColumns 和 getFunctionList 过滤/构建列
 * 功能列由后端动态返回；hasBlazorUI 为 true 时显示「设置」并可用 Blazor 配置 UI
 * 使用 functionCache.ts 的缓存机制，避免重复请求
 */
const filterColumnsByFunction = async () => {
  const fallbackColumns = () => {
    columns.value = [...fixedNonFuncColumns.value, { ...fixedEndColumn }]
    functionColumnsMeta.value = new Map()
    functionInfoMap.value = {}
  }

  if (!props.shopType) {
    fallbackColumns()
    return
  }

  try {
    // 🚀 使用 functionCache.ts 提供的缓存工具
    const [colList, funcList] = await Promise.all([
      getShopListFunctionColumns(props.shopType as ShopType),
      getFunctionList(props.shopType as ShopType)
    ])

    const funcMap: Record<string, t_wmt_function> = {}
    funcList.forEach((f) => { funcMap[f.code] = f })
    functionInfoMap.value = funcMap

    const meta = new Map<string, { hasBlazorUI: boolean; name: string }>()
    // 功能版显示功能列，基础版不显示
    let functionCols: any[] = []
    if (props.isFunctional) {
      functionCols = colList
        .slice()
        .filter((f) => f.code !== 'CPDT' && f.code !== 'OPENSHOP') // 功能版不显示菜品动图列和店铺多开列（店铺多开列已有专门的列）
        .sort((a, b) => a.index - b.index)
        .map((f) => {
          meta.set(f.code, { hasBlazorUI: f.hasBlazorUI, name: f.name })
          // ZDTG 功能列标题改为"点金推广"
          const label = f.code === 'ZDTG' ? '点金推广' : f.name
          return {
            label: label,
            funcCode: f.code,
            hasBlazorUI: f.hasBlazorUI,
            checked: true,
            minWidth: 100,
            align: 'center' as const,
            sortable: false
          }
        })
    }

    functionColumnsMeta.value = meta
    // 列顺序：
    // - 基础版：固定列 + 功能列（基础版目前不显示功能列）+ 操作
    // - 功能版：店铺多开 -> 门店基本信息 -> 实时收入等5列 -> 功能列 -> 操作
    if (props.isFunctional) {
      const fixedCols = fixedNonFuncColumns.value
      // 店铺多开列（在门店基本信息前面）
      const multiOpenCol = fixedCols.find((c: any) => c.label === '店铺多开')
      // 门店基本信息列
      const basicCol = fixedCols.find((c: any) => c.label === '门店基本信息')
      // 需要紧跟在门店基本信息后面的列
      const immediateAfterBasicCols = ['实时收入/订单', '城市天气', '授权状态', '门店分组']
      const immediateCols = fixedCols.filter((c: any) => immediateAfterBasicCols.includes(c.label))
      // 组合：店铺多开 -> 门店基本信息 -> 实时收入等5列 -> 功能列 -> 操作
      const cols = []
      if (multiOpenCol) cols.push(multiOpenCol)
      if (basicCol) cols.push(basicCol)
      cols.push(...immediateCols)
      columns.value = [...cols, ...functionCols, { ...fixedEndColumn }]
    } else {
      columns.value = [...fixedNonFuncColumns.value, ...functionCols, { ...fixedEndColumn }]
    }

    const currentChecked = new Set(checkList.value)
    columns.value.forEach((item: any) => {
      if (item.checked && !currentChecked.has(item.label)) checkList.value.push(item.label)
    })
    checkList.value = checkList.value.filter((label: string) =>
      columns.value.some((col: any) => col.label === label)
    )
  } catch (error) {
    console.error('❌ [ShopTable.filterColumnsByFunction] 获取功能列表失败:', error)
    fallbackColumns()
  }
}

// 监听 isFunctional 和 shopType 的组合变化，确保列正确显示
watch([() => props.isFunctional, () => props.shopType], async ([newIsFunctional, newShopType], [oldIsFunctional, oldShopType]) => {
  // 🚀 优化：只在真正需要时才重新加载
  const shouldReload =
    (!columnsInitialized.value && newIsFunctional === true && newShopType) || // 首次初始化
    (columnsInitialized.value && newIsFunctional !== oldIsFunctional) || // isFunctional 变化
    (columnsInitialized.value && newShopType !== oldShopType && newShopType) // shopType 变化

  if (shouldReload) {
    await filterColumnsByFunction()
    columnsInitialized.value = true
  }
}, { immediate: true })

/**
 * 监听店铺类型变化，保存和恢复状态
 */
watch(() => props.shopType, (newShopType, oldShopType) => {
  // 当店铺类型变化时，保存旧类型的滚动位置
  if (oldShopType !== undefined && oldShopType !== null && activetab_func.value === '1') {
    saveShopTypeScrollPosition(oldShopType as number)
  }

  // 店铺类型真正变化时，保存旧状态并恢复新状态
  if (oldShopType !== undefined && newShopType !== undefined && oldShopType !== newShopType) {
    // 保存旧店铺类型的筛选状态和 webview 状态（使用 oldShopType）
    saveCurrentFilterState(oldShopType as number)
    saveWebviewState(oldShopType as number)

    // 恢复新店铺类型的筛选状态
    restoreFilterState(newShopType as number)

    // 重新过滤功能列（根据新店铺类型的功能列表）
    // 使用 nextTick 延迟执行，避免阻塞主线程
    nextTick(() => {
      filterColumnsByFunction()

      // 加载新店铺类型的 webview 状态
      const hasState = loadWebviewState(newShopType as number)
      if (!hasState) {
        // 如果没有保存的状态，重置为默认值
        activetab_func.value = '1'
        listtabs_func.value = [{ label: '首页', name: '1' }]
        activwebv.value = []
        activeName.value = ''
        initializedWebviews.clear()
      }

      // 恢复新店铺类型的滚动位置（使用 requestAnimationFrame 优化）
      if (activetab_func.value === '1') {
        requestAnimationFrame(() => {
          setTimeout(() => {
            restoreShopTypeScrollPosition(newShopType as number)
            setupScrollListener()
          }, 50) // 减少延迟时间
        })
      }
    })
  }
}, { immediate: false })

// 监听 activetab_func 变化，设置或移除滚动监听器
watch(() => activetab_func.value, (newTab) => {
  if (newTab === '1') {
    // 切换到首页时，设置滚动监听器
    nextTick(() => {
      setupScrollListener()
    })
  } else {
    // 切换到其他标签页时，移除滚动监听器
    removeScrollListener()
  }
})

// 使用滚动管理组合式函数
const { saveScrollPosition, restoreScrollPosition, isRestoringUI, cleanup: cleanupScroll } = useTableScroll({
  tableRef: tableRef as any,
  activeTab: activetab_func,
  isLoading: computed(() => props.listLoading),
  dataList: computed(() => props.shopList)
})

// 设置店铺 cookies 的通用函数
const setShopCookies = async (row: any) => {
  const electron = (globalThis as any).electron
  // 先清空该 partition 下的所有 cookies（与独立窗口打开保持一致）
  await electron.clearCookies(`persist:webview_${row.id}`, '*')

  if (row.shop_type == 1) {
    // 美团外卖
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
  } else if (row.shop_type == 3) {
    // 美团闪购 - 需要设置到多个美团相关域名
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://shangoue.meituan.com')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://waimaie.meituan.com')
  } else if (row.shop_type == 4) {
    // 美团医药 - 需要设置到多个美团相关域名
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://yiyao.meituan.com/main/frame')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://waimaie.meituan.com')
  } else if (row.shop_type == 2) {
    await electron.setCookies(
      `persist:webview_${row.id}`,
      row.cookies,
      `https://melody.shop.ele.me/app/shop/${row.office_id}/dashboard#app.shop.dashboard`
    )
  } else if (row.shop_type == 5) {
    // 饿百零售：需要拆解 cookies 组装成浏览器使用的数据结构
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
    // 饿百零售需要设置到多个饿了么相关域名
    await electron.setCookies2(`persist:webview_${row.id}`, JSON.stringify(out), 'https://nr.ele.me')
    await electron.setCookies2(`persist:webview_${row.id}`, JSON.stringify(out), 'https://melody.shop.ele.me')
    await electron.setCookies2(`persist:webview_${row.id}`, JSON.stringify(out), 'https://ele.me')
  } else if (row.shop_type == 6) {
    // 京东店铺设置cookies到所有相关子域名（包括品牌饭卡等活动页面）
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://store.jddj.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://order.jddj.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sff.jddj.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://trade.m.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://trade.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://api.m.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://log-o2o.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://wl.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://storage.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://stock-store.jddj.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://vender-center.jddj.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://passport.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sso.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://uranus.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sgm-w.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sff.jd.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://storage.360buyimg.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://img30.360buyimg.com`)
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://img.360buyimg.com`)
  } else if (row.shop_type == 7) {
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://jsls.jinritemai.com')
  } else if (row.shop_type == 1000) {
    // 美团团购：需向多个域名设置 Cookie
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://ecom.meituan.com')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://dianping.com')
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.dianping.com')
  } else if (row.shop_type == 1001) {
    // 京东团购（暂用京东到家域名）
    await electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://store.jddj.com`)
  }
}

const loginApp = async (row: any) => {
  // 改为打开独立窗口，不再使用内置 webview
  openWindow(row)
}

const removeStartEnd = (str: any) => {
  if (str && str.length > 0) {
    if (str.charAt(0) == '"') {
      str = str.substring(1)
    }
    if (str.at(-1) == '"') {
      str = str.substring(0, str.length - 1)
    }
  }
  return str
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
  // 保存状态
  saveWebviewState(props.shopType as number)
  // 标签页关闭后，滚动位置会自动通过组合式函数恢复
}
const setMute = (key: any, acc: any) => {
  nextTick(() => {
    if (activwebv.value[key - 1]) {
      activwebv.value[key - 1]['muted'] = acc.muted === 1 ? 0 : 1
    }
    if (listtabs_func.value[key]) {
      listtabs_func.value[key].muted = acc.muted === 1 ? 0 : 1
    }
    const webview = document.querySelector(`#webview${acc.name}`) as any
    if (webview && typeof webview.setAudioMuted === 'function') {
      webview.setAudioMuted(acc.muted === 1)
    }
  })
}
// 后台打开 结束 --------------------------------------------------------------
// 组件激活时恢复滚动位置
onActivated(async () => {
  tableRef.value?.doLayout()

  // 组件激活时，确保列已正确初始化（keep-alive 缓存可能导致列未初始化）
  await nextTick()

  // 优化：只在列真正缺失时才重新初始化，避免重复请求
  if (props.isFunctional === true && props.shopType && !columnsInitialized.value) {
    await filterColumnsByFunction()
    columnsInitialized.value = true
  } else if (!columnsInitialized.value && props.shopType) {
    // 基础版也需要初始化
    await filterColumnsByFunction()
    columnsInitialized.value = true
  }

  // 组件激活时，确保恢复当前店铺类型的筛选状态和 webview 状态
  // 这很重要，因为 keep-alive 缓存可能导致状态丢失
  const currentShopType = props.shopType as number
  if (currentShopType !== undefined) {
    // 恢复筛选状态
    restoreFilterState(currentShopType)

    const hasState = loadWebviewState(currentShopType)
    if (!hasState) {
      // 如果没有保存的状态，重置为默认值
      activetab_func.value = '1'
      listtabs_func.value = [{ label: '首页', name: '1' }]
      activwebv.value = []
      activeName.value = ''
      initializedWebviews.clear()
    }
  }

  // 组件激活时，如果当前在首页且有保存的滚动位置，尝试恢复
  if (activetab_func.value === '1' && currentShopType !== undefined) {
    // 延迟恢复滚动位置，确保表格已渲染
    setTimeout(() => {
      restoreShopTypeScrollPosition(currentShopType)
      // 设置滚动监听器
      setupScrollListener()
    }, 100)
  }
})

// 组件失活时保存滚动位置
onDeactivated(() => {
  if (activetab_func.value === '1' && props.shopType) {
    saveShopTypeScrollPosition(props.shopType as number)
  }
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  cleanupScroll()
  removeScrollListener()
})

// 监听 shopList 变化，确保分组信息正确显示（使用 flush: 'post' 避免在滚动时触发）
watch(() => props.shopList, (newList) => {
  if (!newList || !Array.isArray(newList) || newList.length === 0) return

  // 如果服务器返回的数据中 group_name 为 null，但本地缓存中有，则恢复
  // 使用 requestIdleCallback 或 setTimeout 延迟执行，避免阻塞滚动
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      newList.forEach((shop: any) => {
        if (shop && shop.id && !shop.group_name && shopGroupCache.value.has(shop.id)) {
          const cachedGroupName = shopGroupCache.value.get(shop.id)
          shop.group_name = cachedGroupName
        }
      })
    })
  } else {
    setTimeout(() => {
      newList.forEach((shop: any) => {
        if (shop && shop.id && !shop.group_name && shopGroupCache.value.has(shop.id)) {
          const cachedGroupName = shopGroupCache.value.get(shop.id)
          shop.group_name = cachedGroupName
        }
      })
    }, 0)
  }
}, { deep: true, immediate: false, flush: 'post' })

// 同步固定列的滚动位置（使用节流和 requestAnimationFrame 优化性能）
let syncScrollFrameId: number | null = null
let lastScrollTop = 0
let lastScrollLeft = 0
let syncThrottleTimer: ReturnType<typeof setTimeout> | null = null
// 缓存 DOM 元素引用，避免每次滚动都查询 DOM
let cachedMainBodyWrapper: HTMLElement | null = null
let cachedFixedRightBodyWrapper: HTMLElement | null = null
// 缓存尺寸属性，避免频繁读取（这些属性读取会触发重排）
let cachedScrollWidth = 0
let cachedClientWidth = 0
let cachedSizeTimestamp = 0
const SIZE_CACHE_DURATION = 100 // 缓存100ms

// 清除缓存的 DOM 元素引用
const clearCachedElements = () => {
  cachedMainBodyWrapper = null
  cachedFixedRightBodyWrapper = null
}

// 获取或缓存 DOM 元素
const getCachedElements = () => {
  // 如果元素已缓存且仍然有效，直接返回
  if (cachedMainBodyWrapper && cachedFixedRightBodyWrapper &&
    cachedMainBodyWrapper.isConnected && cachedFixedRightBodyWrapper.isConnected) {
    return { mainBodyWrapper: cachedMainBodyWrapper, fixedRightBodyWrapper: cachedFixedRightBodyWrapper }
  }

  // 否则重新查询并缓存
  if (!tableRef.value?.$el) {
    return { mainBodyWrapper: null, fixedRightBodyWrapper: null }
  }

  const tableEl = tableRef.value.$el
  cachedMainBodyWrapper = tableEl?.querySelector('.el-table__body-wrapper') as HTMLElement
  cachedFixedRightBodyWrapper = tableEl?.querySelector('.el-table__fixed-right .el-table__fixed-body-wrapper') as HTMLElement

  return {
    mainBodyWrapper: cachedMainBodyWrapper,
    fixedRightBodyWrapper: cachedFixedRightBodyWrapper
  }
}

const syncFixedColumnScroll = () => {
  // 节流：避免在快速滚动时频繁执行
  if (syncThrottleTimer) {
    return
  }

  syncThrottleTimer = setTimeout(() => {
    syncThrottleTimer = null

    // 如果已经有待执行的帧，取消它
    if (syncScrollFrameId !== null) {
      cancelAnimationFrame(syncScrollFrameId)
    }

    // 使用 requestAnimationFrame 优化滚动同步性能
    syncScrollFrameId = requestAnimationFrame(() => {
      const { mainBodyWrapper, fixedRightBodyWrapper } = getCachedElements()

      if (!mainBodyWrapper || !fixedRightBodyWrapper) {
        syncScrollFrameId = null
        return
      }

      const currentScrollTop = mainBodyWrapper.scrollTop
      const currentScrollLeft = mainBodyWrapper.scrollLeft

      // 缓存尺寸属性，避免频繁读取（这些属性读取会触发重排）
      const now = Date.now()
      if (now - cachedSizeTimestamp > SIZE_CACHE_DURATION) {
        cachedScrollWidth = mainBodyWrapper.scrollWidth
        cachedClientWidth = mainBodyWrapper.clientWidth
        cachedSizeTimestamp = now
      }

      const scrollWidth = cachedScrollWidth
      const clientWidth = cachedClientWidth

      // 检测是否到达横向滚动边界（最左边或最右边）
      const isAtLeftEdge = currentScrollLeft <= 1
      const isAtRightEdge = currentScrollLeft >= scrollWidth - clientWidth - 1

      // 如果到达横向滚动边界，且滚动位置没有变化，完全跳过处理
      if ((isAtLeftEdge || isAtRightEdge) && Math.abs(currentScrollLeft - lastScrollLeft) < 0.5) {
        syncScrollFrameId = null
        return
      }

      lastScrollLeft = currentScrollLeft

      // 只在垂直滚动位置真正改变时才同步，避免不必要的DOM操作
      if (Math.abs(currentScrollTop - lastScrollTop) > 0.5) {
        fixedRightBodyWrapper.scrollTop = currentScrollTop
        lastScrollTop = currentScrollTop
      }

      // 确保固定列不能水平滚动（只在必要时设置）
      if (fixedRightBodyWrapper.scrollLeft !== 0) {
        fixedRightBodyWrapper.scrollLeft = 0
      }

      syncScrollFrameId = null
    })
  }, 16) // 约60fps的节流间隔，约16ms
}

// 标记分组和城市列表是否已加载
const isGroupListLoaded = ref(false)
const isCityListLoaded = ref(false)

onBeforeMount(() => {
  // 优化：只加载一次分组和城市列表
  if (!isGroupListLoaded.value) {
    getGroupList()
    isGroupListLoaded.value = true
  }

  if (!isCityListLoaded.value) {
    getCityList()
    isCityListLoaded.value = true
  }
})

// 在 onMounted 中初始化列，确保 props 已经正确传递
onMounted(async () => {
  // 使用 nextTick 确保 props.isFunctional 和 props.shopType 都已经正确传递
  await nextTick()

  // 优化：只在未初始化时加载列配置
  if (!columnsInitialized.value) {
    await filterColumnsByFunction()
    columnsInitialized.value = true
  }

  // 恢复当前店铺类型的筛选状态
  if (props.shopType) {
    restoreFilterState(props.shopType as number)
  }

  // 初始化缓存 DOM 元素
  nextTick(() => {
    getCachedElements()

    if (cachedMainBodyWrapper) {
      // 监听主表格的滚动事件
      cachedMainBodyWrapper.addEventListener('scroll', syncFixedColumnScroll, { passive: true })
    }
  })
})

onBeforeUnmount(() => {
  // 清理节流定时器
  if (syncThrottleTimer !== null) {
    clearTimeout(syncThrottleTimer)
    syncThrottleTimer = null
  }

  // 清理 requestAnimationFrame
  if (syncScrollFrameId !== null) {
    cancelAnimationFrame(syncScrollFrameId)
    syncScrollFrameId = null
  }

  // 移除事件监听器并清除缓存
  if (cachedMainBodyWrapper) {
    cachedMainBodyWrapper.removeEventListener('scroll', syncFixedColumnScroll)
  }
  clearCachedElements()
})

// 暴露方法给父组件
defineExpose({
  getGroupList
})
</script>
<style scoped lang="scss">
::v-deep.shop-table {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .el-table .cell {
    overflow: visible !important;
  }

  .el-table {
    margin-top: 0;
  }

  .el-table td.el-table__cell {
    padding: 2px 0;
  }

  .el-table th.el-table__cell {
    padding: 3px 0;
    color: #000 !important;
  }

  // 修复固定列（右侧操作列）的偏移和卡顿问题
  :deep(.el-table__fixed-right) {
    z-index: 10;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);

    .el-table__fixed-body-wrapper {
      overflow: hidden !important;
      // 禁用水平滚动，只允许垂直滚动
      overflow-x: hidden !important;
      overflow-y: auto;
      // 防止固定列独立滚动
      touch-action: pan-y;
    }

    .el-table__fixed-header-wrapper {
      overflow: hidden !important;
      // 禁用水平滚动
      overflow-x: hidden !important;
    }

    // 确保固定列单元格内容不溢出，但允许文字完整显示
    .el-table__cell {
      overflow: visible !important; // 允许内容完整显示

      .cell {
        overflow: visible !important; // 允许内容完整显示
      }
    }
  }

  // 确保固定列和普通列的高度同步
  :deep(.el-table__fixed-right-patch) {
    background-color: #fff;
  }

  // 优化操作列单元格，防止内容溢出导致偏移
  :deep(.el-table__fixed-right) {
    // 确保固定列的宽度固定不变（增加到130px以容纳"取消置顶"等文字）
    width: 130px !important;
    min-width: 130px !important;
    max-width: 130px !important;

    .el-table__cell {
      width: 130px !important;
      min-width: 130px !important;
      max-width: 130px !important;
      padding: 2px 4px !important;
      box-sizing: border-box !important;
      overflow: visible !important; // 允许内容完整显示

      .cell {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow: visible !important; // 允许内容完整显示
      }

      .action-buttons-grid {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .shop-table-content {
    height: 100%;

    // 优化表格横向滚动性能
    :deep(.el-table__body-wrapper) {
      // 防止横向滚动到底部时的回弹和卡顿
      overscroll-behavior-x: none !important; // 完全禁用横向滚动边界回弹
      overscroll-behavior-y: contain;
      // 优化移动端滚动性能
      -webkit-overflow-scrolling: touch;
      // 使用硬件加速
      transform: translateZ(0);
      backface-visibility: hidden;
      // 优化滚动性能
      will-change: scroll-position;
      // 减少重绘和重排
      contain: layout style paint;
      // 优化触摸滚动
      touch-action: pan-x pan-y;
    }

    // 优化滚动条容器
    :deep(.el-scrollbar__wrap) {
      overscroll-behavior-x: none !important; // 完全禁用横向滚动边界回弹
      overscroll-behavior-y: contain;
      -webkit-overflow-scrolling: touch;
      // 优化触摸滚动
      touch-action: pan-x pan-y;
    }
  }

}

// 店铺信息单元格
.shop-info-cell {
  position: relative;
  z-index: 1; // 确保门店基本信息列在店铺多开列之下
  // 不设置 overflow: hidden，允许店铺名溢出显示
}

// 批量续费模式下的选择列样式优化
.batch-mode-active {
  :deep(.el-table-column--selection) {
    .cell {
      padding-left: 14px;
      padding-right: 14px;
    }
  }
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
}

.item-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
}

.fun-renew {
  color: var(--el-color-primary);
  font-size: 14px;
  cursor: pointer;
}

.item-right {
  flex: 1;
  min-width: 0; // 允许 flex 收缩
  // 不设置 overflow: hidden，允许店铺名溢出显示

  .item-name {
    width: 100%;
    height: 24px;
    white-space: wrap;
    font-weight: 600;
    display: flex;
    align-items: flex-start;
    color: var(--el-color-primary);
    margin-bottom: 0;
    position: relative;
    // 保持可点击，因为有点击事件 @click="openWindow(row)"

    .name-text {
      flex: 1;
      // 移除 overflow: hidden，允许店铺名完整显示
      white-space: nowrap;
      min-width: 0;
    }

    .copy-shop-tooltip {
      position: absolute;
      top: -40px;
      left: 25%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      z-index: 1000;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      overflow: visible;

      .tooltip-text {
        color: #fff;
      }

      .tooltip-icon {
        font-size: 14px;
        color: #fff;
      }

      // 小三角形箭头
      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(0, 0, 0, 0.85);
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.95);
        transform: translateX(-50%) translateY(-2px);
      }
    }

    &:hover .copy-shop-tooltip {
      opacity: 1;
      pointer-events: auto;
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
  // 允许备注完整显示，不限制溢出
  display: flex;
  align-items: center;
  gap: 4px;

  .remark-label {
    flex-shrink: 0;
    color: #606266;
  }

  .remark-content {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    // 允许完整显示，不截断
    overflow: visible;
    color: var(--el-color-primary);
  }

  span {
    color: var(--el-color-primary);
  }

  .edit-hint {
    color: var(--el-color-primary);
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }

  &:hover .edit-hint {
    opacity: 1;
  }
}

.realtime-data {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: #606266;
}

// 基础版实时指标列样式（实时收入 / 实时订单）
.realtime-metric-value {
  font-weight: 500;
  font-size: 22px;
  color: #000;
}

.realtime-metric-subtitle {
  font-size: 14px;
  color: #999999;
}

.realtime-metric-compare {
  font-weight: 600;
}

// 基础版：店铺多开列样式
.multi-open-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  position: relative;
  z-index: 10; // 确保续费按钮在门店基本信息列内容之上
}

.multi-open-expire-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.multi-open-renew-btn {
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  z-index: 100; // 确保续费按钮可以点击，不被其他元素覆盖（提高 z-index）
  pointer-events: auto; // 确保可以接收点击事件

  &:hover {
    text-decoration: underline;
  }
}

.auth-status-container {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px; // 调小间距：从 8px 改为 4px

  .auth-time-row {
    width: 100%;
    justify-content: center;
  }

  .auth-status-row {
    width: 100%;
    justify-content: center;
  }
}

.auth-status-row {
  display: flex;
  align-items: center;
  gap: 0px; // 调小间距：从 8px 改为 4px
  justify-content: center;
}

.auth-prefix-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.auth-time-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .auth-time-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
}

.auth-label {
  font-size: 14px;
  color: #909399;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0px;
}

.auth-normal-btn {
  border-color: #67c23a !important;
  color: #67c23a !important;
  background-color: #fff !important;
  padding: 2px 5px !important; // 调小内边距
  min-width: auto !important; // 取消最小宽度限制
}

.auth-error-btn {
  border-color: #f56c6c !important;
  color: #f56c6c !important;
  background-color: #fff !important;
  padding: 2px 5px !important; // 调小内边距
  min-width: auto !important; // 取消最小宽度限制
}

.auth-time-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.auth-time-inline {
  font-size: 12px;
  color: #909399;
  margin-left: 6px;
  white-space: nowrap;
}

.auth-arrow {
  font-size: 12px;
  color: #909399;
  cursor: pointer;
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
  top: -10px;
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

.name-text {
  cursor: pointer;
  flex: 1;
  // 移除 overflow: hidden，允许店铺名完整显示
  white-space: nowrap;
  min-width: 0;
}

:deep(.blur-text) {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.blur-text {
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

// 平滑滚动优化
.smooth-scroll-table {
  :deep(.el-scrollbar__wrap) {
    // 使用 CSS scroll-behavior 让滚动更平滑（仅在非程序化滚动时生效）
    scroll-behavior: auto !important; // 程序化滚动时使用 auto，避免动画
  }

  // 在恢复滚动位置时防止闪现
  :deep(.el-table__body-wrapper) {
    // 使用 will-change 提示浏览器优化滚动性能
    will-change: scroll-position;
    // 优化横向滚动性能，防止滚动到底部时的卡顿
    overscroll-behavior-x: none !important; // 完全禁用横向滚动边界回弹
    overscroll-behavior-y: contain; // 防止纵向滚动到底部时的回弹效果
    -webkit-overflow-scrolling: touch; // 优化移动端滚动性能
    // 使用硬件加速优化滚动性能
    transform: translateZ(0);
    backface-visibility: hidden;
    // 优化滚动性能，减少重绘和重排
    contain: layout style paint;
    // 优化触摸滚动，允许横向和纵向滚动
    touch-action: pan-x pan-y;
    // 禁用滚动时的指针事件，减少边界时的计算（但允许点击）
    // pointer-events: auto; // 保持默认，允许交互
    // 优化滚动时的性能，但允许单元格内容选择文本
    // 注意：不在容器级别禁用 user-select，让单元格内容可以正常选择
    // 减少边界时的重绘
    isolation: isolate;
  }

  // 恢复滚动位置期间隐藏表格内容，避免看到"跳动"
  &.is-restoring-scroll {
    :deep(.el-table__body-wrapper) {
      opacity: 0;
      transition: opacity 0ms; // 立即隐藏，无过渡
    }
  }

  // 恢复完成后快速显示
  &:not(.is-restoring-scroll) {
    :deep(.el-table__body-wrapper) {
      opacity: 1;
      transition: opacity 30ms ease-out; // 快速淡入，30ms
    }
  }
}

// 门店基本信息表头样式
.shop-info-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .header-label {
    white-space: nowrap;
  }

  .header-filter-dropdown {
    position: absolute;
    left: calc(50% + 50px); // 从中心偏右开始，留出"门店基本信息"文字的空间
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    white-space: nowrap;
    max-width: calc(50% - 50px);
  }

  // 饿了么复制版（非功能版）：表头左对齐，与数据对齐
  &:not(.is-functional) {
    justify-content: flex-start;
    padding-left: 16px;

    .header-label {
      margin-right: auto;
    }

    .header-filter-dropdown {
      position: relative;
      left: auto;
      right: auto;
      top: auto;
      transform: none;
      max-width: none;
      margin-left: 8px;
    }
  }

  // 城市天气列标题和按钮（纵向排列，筛选按钮在标题下方）
  &.city-weather-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .city-weather-filter-popover {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      transform: none !important;
      max-width: none !important;
      margin-top: 4px;
    }

    .city-weather-filter-popover {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      transform: none !important;
      max-width: none !important;
    }

    // 饿了么复制版（非功能版）：横向布局
    &:not(.is-functional) {
      flex-direction: row;
      justify-content: center;
      gap: 8px;
      padding-left: 16px;

      .header-content {
        justify-content: flex-start;
      }

      .city-weather-filter-popover {
        margin-top: 0;
        margin-left: 0;
      }
    }
  }

  // 城市天气筛选按钮
  .city-weather-filter {
    left: calc(50% + 35px) !important;
    max-width: calc(50% - 40px) !important;
  }

  // 实时收入/订单列：总是使用列布局（因为只在功能版中显示）
  &.realtime-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .realtime-filter {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      transform: none !important;
      max-width: none !important;
      margin-top: 0;
    }
  }

  // 基础版：店铺多开（标题后紧贴筛选按钮，间距用 flex-gap 控制，最稳定）
  &.multi-open-filter-header:not(.is-functional) {
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px; // 这里调间距：往右更大就加大
    }

    // 取消之前 margin 方案，避免两边叠加导致不一致
    .header-label {
      margin-right: 0;
    }

    .multi-open-filter-popover {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      transform: none !important;
      max-width: none !important;
      width: auto !important;
      margin-left: 0 !important;
    }
  }

  // 基础版：店铺多开列表头（与授权状态/门店分组保持一致的布局）
  &.multi-open-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    标题和筛选按钮之间的间距 .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .multi-open-filter {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      transform: none !important;
      max-width: none !important;
      margin-left: 0 !important;
      margin-top: 0 !important;
    }
  }

  // 授权状态列：标题和筛选按钮居中显示
  &.auth-status-header {
    justify-content: center;
    padding-right: 12px; // 授权状态列往右边移动一点

    .header-content {
      justify-content: center;
    }

    .auth-status-filter {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      transform: none !important;
      max-width: none !important;
      margin-left: 8px; // 基础版：筛选按钮往右移动一点点
    }
  }

  // 门店分组列：标题和筛选按钮居中显示
  &.group-header {
    justify-content: center;
    padding-left: 0;

    .header-content {
      justify-content: center;
    }

    .header-label {
      margin-right: 8px;
    }

    .group-filter {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      transform: none !important;
      max-width: none !important;
    }
  }

  // 功能版：筛选按钮显示在标题下方
  &.is-functional {
    flex-direction: column;
    align-items: center;


    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .functional-filter {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      transform: none !important;
      max-width: none !important;
      margin-top: 0;
    }

    // 城市天气：功能版筛选按钮在标题下方（样式已在基础样式中统一设置）

    // 店铺多开：功能版（筛选按钮在标题下方），保持原有居中逻辑即可
    &.multi-open-filter-header {
      .header-content {
        justify-content: center;
      }
    }

    // 授权状态：标题与筛选按钮都居中
    &.auth-status-header {
      .header-content {
        justify-content: center;
      }
    }

    &.group-header {
      .header-content {
        justify-content: center;
        padding-left: 0;
      }
    }

    // 实时收入/订单：功能版筛选按钮在标题下方
    &.realtime-header {
      .header-content {
        justify-content: center;
      }

      .realtime-filter {
        position: relative !important;
        left: auto !important;
        right: auto !important;
        top: auto !important;
        transform: none !important;
        max-width: none !important;
        margin-top: 0;
      }
    }
  }
}

// 门店分组选择框紧凑样式（与运营版一致）
.group-select-compact {
  width: 105px !important;
  min-width: 105px !important;
  max-width: 105px !important;

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
}

// 实时收入/订单合并列样式
.realtime-data-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 8px;
  min-width: 160px;
  width: 100%;
}

.realtime-data-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.realtime-no-data {
  font-size: 14px;
  color: #909399;
  text-align: center;
  padding: 16px 0;
}

.realtime-data-label {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  white-space: nowrap;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

.realtime-data-number {
  font-weight: 600;
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
  min-width: 60px;
  flex-shrink: 0;
}

.realtime-data-unit {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  white-space: nowrap;
  margin-left: 2px;
  flex-shrink: 0;
}

// 兼容旧版（保留，以防其他地方使用）
.realtime-data-value {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
  line-height: 1.5;
  white-space: nowrap;
  text-align: right;
  min-width: 80px;
  flex-shrink: 0;
}

// 实时收入/订单表头样式（支持两个独立的排序按钮组）
.realtime-sort-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
}

.realtime-header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.realtime-sort-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.realtime-sort-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.realtime-sort-group .sort-label {
  font-size: 11px;
  color: #909399;
  line-height: 1;
}

.realtime-sort-icons {
  display: inline-flex;
  flex-direction: column;
  line-height: 1;
  gap: 2px;
}

.realtime-sort-icons .sort-icon {
  cursor: pointer;
  color: #c0c4cc;
  font-size: 12px;
  height: 12px;
  transition: color 0.2s;
}

.realtime-sort-icons .sort-icon:hover {
  color: var(--el-color-primary);
}

.realtime-sort-icons .sort-icon.active {
  color: var(--el-color-primary);
}

// 实时收入/订单筛选菜单样式（支持二级菜单）
:deep(.realtime-sort-dropdown) {
  .realtime-sort-menu {
    position: relative;
  }

}

// 筛选按钮样式
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

  // 筛选激活状态：使用橙色/警告色背景
  &.is-filtered {
    background-color: #fff7e6 !important;
    color: #e6a23c !important;
    border-color: #f5dab1 !important;

    .el-icon {
      color: #e6a23c;
    }

    &:hover {
      background-color: #fef0d9 !important;
      color: #cf9236 !important;
      border-color: #f0c78a !important;

      .el-icon {
        color: #cf9236;
      }
    }

    &:focus {
      background-color: #fff7e6 !important;
      color: #e6a23c !important;
      border-color: #f5dab1 !important;
    }
  }
}

// 筛选下拉菜单样式
:deep(.basic-info-filter-menu) {
  .el-dropdown-menu__item {
    &.is-selected {
      color: var(--el-color-primary);
      font-weight: 600;
      background-color: var(--el-color-primary-light-9);
    }
  }
}

// 城市筛选弹出框样式
.city-filter-content {
  padding: 0;
  min-width: 480px;
}

.city-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;

  .filter-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

.city-filter-body {
  padding: 0;
}

.city-selector-panel {
  display: flex;
  height: 400px;
  border-top: 1px solid #dcdfe6;
  overflow: hidden;
}

.city-selector-left,
.city-selector-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dcdfe6;

  &:last-child {
    border-right: none;
  }
}

.city-selector-header {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  flex-shrink: 0;
}

.city-selector-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.city-selector-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.is-active {
    background-color: #ecf5ff;
    color: #409eff;
  }

  .el-checkbox {
    width: auto;
    margin-right: 8px;
  }
}

.province-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.city-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;

  .el-checkbox {
    padding: 6px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.city-selector-empty {
  padding: 40px 16px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.city-filter-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

// 分享门店对话框样式
.share-dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;

  .share-dialog-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-left: 15px;
  }

  .share-shop-name {
    font-size: 14px;
    color: #606266;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-shop-info-btn {
    margin-left: 0px;
    background-color: #409eff !important;
    color: #fff !important;
    border-color: #409eff !important;
    padding: 4px 10px;
    border-radius: 4px;

    &:hover {
      background-color: #66b1ff !important;
      border-color: #66b1ff !important;
      color: #fff !important;
    }

    &:active {
      background-color: #3a8ee6 !important;
      border-color: #3a8ee6 !important;
      color: #fff !important;
    }
  }
}

.share-dialog-content {
  padding: 0;
}

.share-code-section {
  margin-bottom: 20px;

  .share-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 12px;
  }

  .share-code-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .share-code-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 2px;
      }
    }

    .copy-share-btn {
      flex-shrink: 0;
    }
  }
}

.share-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 16px;

  .tips-icon {
    color: #909399;
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .tips-text {
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

.share-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 门店分组显示样式
.group-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 8px;

  .group-name {
    font-size: 14px;
    color: #606266;
  }

  .group-edit-icon {
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}

// 分享门店对话框样式
.share-dialog-content {
  padding: 0;
}

.share-code-section {
  margin-bottom: 20px;

  .share-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 12px;
  }

  .share-code-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .share-code-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 2px;
      }
    }

    .copy-share-btn {
      flex-shrink: 0;
    }
  }
}

.share-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 16px;

  .tips-icon {
    color: #909399;
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .tips-text {
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

.share-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 操作按钮网格布局
.action-buttons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0px;
  padding: 0px;
  width: 100%;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ecf5ff;
  }

  .action-icon {
    font-size: 16px;
    margin-bottom: 1px;
    color: #409eff;
  }

  .action-text {
    font-size: 12px;
    color: #606266;
    white-space: nowrap; // 防止文字换行
    overflow: visible; // 允许文字完整显示
    text-overflow: clip; // 不使用省略号，直接显示完整文字
  }

  &.delete-item {
    .delete-icon {
      color: #f56c6c;
    }

    .delete-text {
      color: #f56c6c;
    }

    &:hover {
      background-color: #fef0f0;
    }
  }
}

.star-icon {
  color: #909399;
  transition: color 0.2s;

  &.star-active {
    color: #f5c518;
  }
}

.share-icon {
  color: #409eff;
}

// 操作列设置按钮样式
.operation-settings-btn {
  padding: 4px 8px;
  min-height: auto;

  :deep(.vab-icon) {
    font-size: 14px;
  }
}

.star-icon {
  color: #909399;
  transition: color 0.2s;

  &.star-active {
    color: #f5c518;
  }
}

.shop-pagination {
  margin-top: 6px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
</style>