<template>
  <div v-loading="pageLoading">
    <div class="search-top">
      <div class="search-left">
        <div class="state-text" style="margin-left: 0">
          选择商品上传的
          <span class="b-text">新店</span>
        </div>
        <div>
          <el-input v-model="shopDataCopy.name" class="filter-input" :class="{ 'blur-text': demoMode }" disabled
            placeholder="请输入门店ID" />
          <div>
            <div class="top-left" style="transform: translateX(-30px)">
              <img v-if="shopDataCopy.shop_type === 1" class="shop-type-icon"
                src="/@/assets/home_images/icon_001.png" />
              <img v-if="shopDataCopy.shop_type === 2" class="shop-type-icon"
                src="/@/assets/home_images/icon_002.png" />
              <img v-if="shopDataCopy.shop_type === 3" class="shop-type-icon"
                src="/@/assets/home_images/icon_003.png" />
              <img v-if="shopDataCopy.shop_type === 4" class="shop-type-icon"
                src="/@/assets/home_images/icon_004.png" />
              <img v-if="shopDataCopy.shop_type === 5" class="shop-type-icon"
                src="/@/assets/home_images/icon_005.png" />
              <img v-if="shopDataCopy.shop_type === 6" class="shop-type-icon"
                src="/@/assets/home_images/icon_006.png" />
              <img v-if="shopDataCopy.shop_type === 7" class="shop-type-icon"
                src="/@/assets/home_images/icon_007.png" />
              <span class="shop-office-id" @click="openShop(shopDataCopy.office_id, shopDataCopy.id)">店铺ID：<span
                  :class="{ 'blur-text': demoMode }">{{ shopDataCopy.office_id }}</span></span>
              <el-button v-if="taskId" type="primary" @click="updateNewShopData" size="small"
                style="margin-left: 10px;">更新新店数据</el-button>
            </div>
          </div>
        </div>
        <div class="state-text">
          选择需要同步的
          <span class="b-text">老店</span>
        </div>
        <div>
          <el-select ref="oldShopSelectRef" v-model.trim="filterInput" filterable :loading="oldShopLoading"
            placeholder="请输入门店ID" remote :remote-method="remoteMethod" reserve-keyword @change="getInputName"
            @visible-change="handleSelectVisibleChange" :class="{ 'blur-select': demoMode }">
            <el-option v-for="item in oldShopOptions" :key="item.id" :label="item.name" :value="item.office_id">
              <div class="shop-select" style="transform: translateX(-30px)">
                <img v-if="item.shop_type === 1" class="shop-type-icon" src="/@/assets/home_images/icon_001.png" />
                <img v-if="item.shop_type === 2" class="shop-type-icon" src="/@/assets/home_images/icon_002.png" />
                <img v-if="item.shop_type === 3" class="shop-type-icon" src="/@/assets/home_images/icon_003.png" />
                <img v-if="item.shop_type === 4" class="shop-type-icon" src="/@/assets/home_images/icon_004.png" />
                <img v-if="item.shop_type === 5" class="shop-type-icon" src="/@/assets/home_images/icon_005.png" />
                <img v-if="item.shop_type === 6" class="shop-type-icon" src="/@/assets/home_images/icon_006.png" />
                <img v-if="item.shop_type === 7" class="shop-type-icon" src="/@/assets/home_images/icon_007.png" />
                <span :class="{ 'blur-text': demoMode }"> {{ item.name }}</span>

              </div>

            </el-option>
          </el-select>
          <div>
            <div v-if="oldShop.name" class="top-left">
              <img v-if="oldShop.shop_type === 1" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_001.png" />
              <img v-if="oldShop.shop_type === 2" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_002.png" />
              <img v-if="oldShop.shop_type === 3" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_003.png" />
              <img v-if="oldShop.shop_type === 4" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_004.png" />
              <img v-if="oldShop.shop_type === 5" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_005.png" />
              <img v-if="oldShop.shop_type === 6" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_006.png" />
              <img v-if="oldShop.shop_type === 7" alt="" class="shop-type-icon"
                src="/@/assets/home_images/icon_007.png" />
              <span class="shop-office-id" @click="openShop(oldShop.office_id, oldShop.id)">店铺ID：<span
                  :class="{ 'blur-text': demoMode }">{{ oldShop.office_id }}</span></span>

              <el-button v-if="taskId" type="primary" @click="updateOldShopData" size="small"
                style="margin-left: 10px;">更新老店数据</el-button>
            </div>
          </div>
        </div>
        <div style="margin-left: 40px">
          <el-tooltip content="全自动后台复制模式，可在托管任务列表查看进度" placement="top">
            <el-button type="primary" @click="openCreateHostedTask" style="margin-right: 10px">创建托管任务</el-button>
          </el-tooltip>
          <el-button :loading="getDataLoading" type="primary" @click="getData">获取数据</el-button>

          <div class="top-right" @click="openLog">搬菜历史记录 ></div>
        </div>
      </div>
      <!-- v-if="showShopDetailsState" -->
      <!-- <div class="report-err" v-if="showShopDetailsState"> <el-button type="danger" @click="reportErr">上报错误</el-button>
      </div> -->
    </div>

    <div class="shop-main" :class="{ 'shop-info-collapsed': isShopInfoCollapsed }">
      <div class="shop-info-collapse-header" @click="isShopInfoCollapsed = !isShopInfoCollapsed">
        <div class="collapse-header-left">
          <el-icon class="collapse-icon">
            <ArrowUp v-if="!isShopInfoCollapsed" />
            <ArrowDown v-else />
          </el-icon>
          <span class="collapse-title">店招海报、活动列表、复制配置</span>
          <span class="collapse-tip">（点击展开/折叠）</span>
        </div>
      </div>
      <el-collapse-transition>
        <div v-show="!isShopInfoCollapsed" class="shop-info-collapse-content">
          <div class="shop-container">
            <div class="shop-img-content">
              <div class="content-img">
                <div class="shop-img content-img-1"><img alt="" :src="oldShopDetails.img" /></div>
                <div class="download-btn" @click="downImg(oldShopDetails.img)">下载logo</div>
              </div>
              <div class="content-main">
                <div class="shop-name" :class="{ 'blur-text': demoMode }">{{ oldShopDetails.name }}</div>
                <div class="shop-tips" style="height: 20px" />
                <div class="content-img-main">
                  <div v-if="decorateInfo.Top && decorateInfo.Top.ImgUrl && decorateInfo.Top.ImgUrl.Img"
                    class="content-img">
                    <div class="shop-img">
                      <img alt="" :src="handleImg(decorateInfo.Top)" style="width: 100%; height: 100%" />
                    </div>
                    <div class="download-btn" @click="downImg(decorateInfo.Top.ImgUrl.Img)">下载店招</div>
                  </div>
                  <div v-if="decorateInfo.Poster && decorateInfo.Poster.length > 0" class="content-img">
                    <el-carousel height="80px" indicator-position="none" style="width: 100%">
                      <el-carousel-item v-for="item in decorateInfo.Poster" :key="item.OfficeId">
                        <img alt="" :src="handleImg(item)" style="width: 100%; height: 100%" />
                        <div class="download-btn" style="position: absolute">下载海报</div>
                      </el-carousel-item>
                    </el-carousel>
                    <div class="download-btn" @click="openChange">下载海报</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="active-copyconf">
            <div class="active-panel">
              <div class="active-title">活动列表
                <el-button v-if="taskId" type="primary" size="small" style="margin-left: 10px;"
                  @click="pullActivityList">拉取活动列表</el-button>
              </div>
              <el-table :data="activityList" :height="activityList.length > 3 ? 300 : undefined" style="width: 100%">
                <el-table-column label="序号" width="180">
                  <template #default="scope">
                    {{ scope.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column label="活动名称">
                  <template #default="{ row }">
                    {{ row.Name }}
                  </template>
                </el-table-column>
                <el-table-column label="活动数量">
                  <template #default="{ row }">
                    {{ row.Total }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" prop="address">
                  <template #default="{ row }">
                    <el-button :loading="row.isLoading" type="text" @click="copyActive(row)">立即复制</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="日志" prop="address">
                  <template #default="{ row }">
                    <el-button type="text" @click="checkDetails(row)">查看日志</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="copyconf-panel">
              <div class="active-title">复制配置(如不明白保持默认即可)</div>
              <el-form class="copyconf-form" :model="copyConf" label-width="auto">
                <el-form-item label="同步库存">
                  <el-switch v-model="copyConf.SyncStock"></el-switch>
                  <span class="msg_copyconf">未打开默认9999</span>
                </el-form-item>
                <el-form-item label="同步老店上下架状态">
                  <el-switch v-model="copyConf.SyncOnSale"></el-switch>
                  <span class="msg_copyconf">未打开默认全上架</span>
                </el-form-item>
                <el-form-item>
                  <template #label>
                    <span>商品类目(平台推荐)</span>
                    <el-tooltip content="因商品类目问题报错可修改此开关状态尝试继续复制" placement="top">
                      <el-icon style="margin-left: 4px; cursor: help;">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </template>
                  <el-switch v-model="copyConf.CategoryUseRecomend" />
                  <span class="msg_copyconf">未打开使用系统AI映射</span>
                </el-form-item>
                <!-- 类目属性AI推荐已隐藏，但功能默认开启 (attr_recomend: true) -->
                <el-form-item v-if="oldShop.shop_type === 1" label="智能去水印">
                  <el-switch v-model="copyConf.RemoveWaterMark"></el-switch>
                  <span class="msg_copyconf">美团菜品右下角有多层水印建议开启</span>

                </el-form-item>


              </el-form>
              <el-form v-if="shopDataCopy.shop_type === 6 || oldShop.shop_type === 6" class="copyconf-form"
                :model="otherConf" label-width="auto">

                <el-form-item v-if="shopDataCopy.shop_type === 6" label="使用表格方式上传">
                  <el-switch v-model="otherConf.use_excel" @change="handleExcelChange"></el-switch>
                  <span class="msg_copyconf">
                    适用老版京东后台
                    <span class="view-link" @click="showJdImageDialog('old')">点击查看</span>
                  </span>

                </el-form-item>

                <el-form-item label="京东新版后台">
                  <el-switch v-model="otherConf.use_newjd" @change="handleNewJdChange"></el-switch>
                  <span class="msg_copyconf">
                    适用新版京东后台
                    <span class="view-link" @click="showJdImageDialog('new')">点击查看</span>
                  </span>

                </el-form-item>

              </el-form>
            </div>
          </div>
        </div>
      </el-collapse-transition>
    </div>
    <div v-if="showShopDetailsState">
      <div class="btn-nav">
        <div class="btn-nav-right">
          <el-button type="danger" @click="openWarningTip">一键清空新店商品</el-button>
          <el-button type="warning" @click="exportErrorFoods">导出异常商品</el-button>
        </div>
        <div class="btn-nav-left">

          <el-button v-if="shopDataCopy.shop_type !== 6" type="primary" @click="copyShopPoster">
            <img alt="" class="btn-left-img" src="/@/assets/foodMove_images/icon_003.png" />
            一键复制店招海报
          </el-button>
          <el-button type="primary" @click="copyGoods">
            <img alt="" class="btn-left-img" src="/@/assets/foodMove_images/icon_002.png" />
            一键复制商品
          </el-button>
          <el-button type="primary" @click="copyAllActive">
            <img alt="" class="btn-left-img" src="/@/assets/foodMove_images/icon_004.png" />
            一键复制活动
          </el-button>
          <el-button type="primary" @click="updateAllPrice">
            <img alt="" class="btn-left-img" src="/@/assets/foodMove_images/icon_001.png" />
            一键修改商品价格
          </el-button>
        </div>
      </div>
      <div class="table-main">
        <div class="active-title">商品列表</div>
        <div class="good-container">
          <div class="good-list">
            <div style="height: 40px; opacity: 0.6">商品总数（{{ allGoodsCount }}）</div>
            <!-- 全选/取消全选按钮，仅在存在"复制异常商品"时显示 -->
            <div style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
              <el-button size="small" type="primary" @click="selectAllGroups">全选</el-button>
              <el-button size="small" @click="unselectAllGroups">取消全选</el-button>
            </div>
            <group-menu :current-group-id="currentGroupId" :food-groups="foodGroups"
              :food-group-data-list="foodGroupDataList" @item-click="getGroupGoodList"
              @checkbox-change="handleGroupCheckboxChange" />
            <!--            <div v-for="(item, index) in foodGroups" :key="item.Group.id" class="list-item" :class="{'group-is-active': currentGroupIndex === index}" @click="getGroupGoodList(item, index)">-->
            <!--              <el-checkbox v-model="item.Group.check"/>-->
            <!--              <div style="width: calc(100% - 14px);box-sizing: border-box;padding-left: 10px">-->
            <!--                <div :class="{'error-text': !item.id}" style="color: #999999;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{ item.Group.Name }}</div>-->
            <!--                <div :class="{'error-text': !item.id}" style="font-weight: 400;font-size: 12px;color: #999999;margin-top: 4px;">商品（{{ item.Group.FoodCount }}）</div>-->
            <!--              </div>-->
            <!--            </div>-->
          </div>
          <div class="good-detail-list" v-loading="goodsLoading">
            <!-- 团购商品管理组件 -->
            <groupon-food-manager ref="grouponManagerRef" v-if="isGrouponState" :task-id="taskId || ''"
              :food-groups="foodGroups" :real-groupon-group="realGrouponGroup" :is-groupon-group="isGrouponGroup"
              @groupon-single-copy="handleGrouponSingleCopy" />
            <template v-else>
              <div class="food-filter-container">
                <el-input v-model="foodNameFilter" class="food-filter-input" placeholder="这里支持过滤商品名" clearable
                  @clear="handleFoodNameFilterClear" @input="handleFoodNameFilter">
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <div v-for="item in groupForGoodList" :key="item.index" class="good-detail">
                <div class="detail-left">
                  <div class="detail-img">
                    <img v-if="item.ImageUrls && item.ImageUrls[0] && item.ImageUrls[0].Img" alt=""
                      :src="item.ImageUrls[0].Img" />
                  </div>
                  <div class="ai-btn">AI去水印</div>
                  <div class="ai-btn">AI美化</div>
                </div>
                <div class="detail-right">
                  <el-popover :content="item.err_msg" placement="bottom" title="错误提示" trigger="click" width="500">
                    <template #reference>
                      <div>
                        <el-tag v-if="item.err_msg" :disable-transitions="true"
                          style="margin-bottom: 10px; max-width: 100%; overflow: hidden" type="danger">
                          {{ item.err_msg }}
                        </el-tag>
                      </div>
                    </template>
                  </el-popover>
                  <div class="detail-line" style="display: flex; align-items: center; justify-content: space-between">
                    <el-select v-model="item.Status" disabled style="width: 200px">
                      <el-option v-for="option in stateOptions" :key="option.value" :label="option.label"
                        :value="option.value" />
                    </el-select>
                    <div style="position: relative; width: calc(100% - 210px)">
                      <el-input v-model="item.Name" />
                      <el-button :loading="item.isLoading" plain
                        style="position: absolute; top: 50%; right: 0; transform: translateY(-50%); margin-top: 0"
                        type="primary" @click="singleReplication(item)">
                        单个复制
                      </el-button>
                    </div>
                  </div>
                  <div class="detail-line">
                    <el-input v-model="item.Description" style="width: calc(100% - 230px)" />
                    <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">最小购买数</div>
                    <el-input v-model="item.MinBuyCount" disabled style="width: 120px" />
                  </div>
                  <div v-for="(_item, _index) in item.Specifications" :key="_index" class="detail-line specs-other">
                    <div class="specification-type">
                      <!--                    <div v-if="shopType === 2">-->
                      <!--                      <el-tag type="info" v-if="_item.SpecType === 1">规格</el-tag>-->
                      <!--                      <el-tag v-if="_item.SpecType === 2">属性</el-tag>-->
                      <!--                      <el-tag type="warning" v-if="_item.SpecType === 3">小料</el-tag>-->
                      <!--                    </div>-->
                      <el-tag>{{ _item.Name }}</el-tag>
                    </div>
                    <div v-for="(__item, __index) in _item.Options" :key="__index"
                      style="display: flex; width: 100%; margin-bottom: 10px">
                      <div class="specs-item">
                        <div class="specs-name">名称</div>
                        <el-input v-model="__item.Name" />
                      </div>
                      <div v-if="_item.Name === '份量'" class="specs-item">
                        <div class="specs-name">份量</div>
                        <el-input v-if="__item.WeightType > 34 && __item.WeightType < 45" v-model="replaceStr"
                          :disabled="true" />
                        <el-input v-else v-model="__item.Weight" />
                        <el-select v-if="_index === 0" v-model="__item.WeightType"
                          style="position: absolute; top: 50%; transform: translateY(-50%); right: 0; width: 80px">
                          <el-option v-for="option in UnitType" :key="option.value" :label="option.name"
                            :value="option.value" />
                        </el-select>
                      </div>
                      <div class="specs-item" style="margin-right: 0">
                        <div class="specs-name">原价（元）</div>
                        <el-input v-model="__item.Price" @input="handlePriceChange(item)" />
                      </div>
                      <el-icon @click="delSpec(item, item.Specifications, _item.Options, _index, __index)">
                        <delete />
                      </el-icon>
                    </div>
                    <!--                    份量 SpecType === 1-->
                    <template v-if="_item.SpecType === 1 && false">
                      <div v-for="(__item, __index) in _item.Options" :key="__index"
                        style="display: flex; width: 100%; margin-bottom: 10px">
                        <div class="specs-item">
                          <div class="specs-name">名称</div>
                          <el-input v-model="__item.Name" />
                        </div>
                        <div v-if="JSON.stringify(__item.Price)" class="specs-item">
                          <div class="specs-name">份量</div>
                          <el-input v-if="__item.WeightType > 34 && __item.WeightType < 45" v-model="replaceStr"
                            :disabled="true" />
                          <el-input v-else v-model="__item.Weight" />
                          <el-select v-if="_index === 0" v-model="__item.WeightType"
                            style="position: absolute; top: 50%; transform: translateY(-50%); right: 0; width: 80px">
                            <el-option v-for="option in UnitType" :key="option.value" :label="option.name"
                              :value="option.value" />
                          </el-select>
                        </div>
                        <div class="specs-item" style="margin-right: 0">
                          <div class="specs-name">原价（元）</div>
                          <el-input v-model="__item.Price" />
                        </div>
                      </div>
                    </template>
                    <!--                    属性 SpecType === 2-->
                    <template v-if="_item.SpecType === 2 && false">
                      <div class="specs-item" style="width: 100%">
                        <div class="specs-name">属性组名称</div>
                        <el-input v-model="_item.Name" />
                        <div class="specs-name" style="margin-left: 10px">选项</div>
                        <div v-for="(__item, __index) in _item.Options" :key="__index" class="litItemInput">
                          <el-input v-model="__item.Name" />
                        </div>
                      </div>
                    </template>
                    <!--                  小料 SpecType === 3-->
                    <template v-if="_item.SpecType === 3 && false">
                      <div class="specs-item" style="width: 100%">
                        <div class="specs-name">属性组名称</div>
                        <el-input v-model="_item.Name" />
                        <div class="specs-name" style="margin-left: 10px">选项</div>
                        <div v-for="(__item, __index) in _item.Options" :key="__index" class="litItemInput">
                          <el-input v-model="__item.Name" />
                          <el-input v-model="__item.Price" class="price-input" />
                        </div>
                      </div>
                    </template>
                  </div>
                  <div v-if="item.isUpdate" class="confirm-update">
                    <div class="confirm-update-tips">
                      <span>注意：</span>
                      您操作了商品数据的编辑，如果商品数据已经确认无误，请点击修改按钮，然后再执行搬菜操作，否则搬菜后新数据不会生效!
                    </div>
                    <div class="confirm-update-btn" @click="confirmUpdate(item)">确认修改商品数据</div>
                  </div>
                  <div v-if="item.CopyTask && item.CopyTask.try_count" class="copy-state">
                    <img alt="" :src="item.CopyTask.succeed ? sussIcon : errorIcon" />
                    <span>{{ item.CopyTask.succeed ? '复制成功' : '复制失败' }}</span>
                  </div>
                </div>
              </div>
              <el-pagination v-if="groupForGoodList.length > 0 && !isErrorListState"
                v-model:current-page="groupGoodParams.page" v-model:page-size="groupGoodParams.pagesize"
                v-model:total="groupForGoodTotal" background layout="total, prev, pager, next"
                @current-change="getGoodForGroupList" />
              <el-pagination v-if="groupForGoodList.length > 0 && isErrorListState"
                v-model:current-page="errorParams.page" v-model:page-size="errorParams.pagesize"
                v-model:total="groupForGoodTotal" background layout="total, prev, pager, next"
                @current-change="getErrorCopyList" />
            </template>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="changeImgState" :close-on-click-modal="false" :modal="false" modal-class="dialog-model"
      title="选择图片下载" width="30%">
      <div style="width: 100%; overflow-x: auto; display: flex; align-items: center; padding-bottom: 20px">
        <div v-for="(item, index) in decorateInfo.Poster" :key="index"
          style="width: 210px; height: 140px; margin-right: 10px; display: flex; align-items: center; flex-wrap: wrap">
          <img alt="" :src="item.ImgUrl.Img" style="width: 100%; height: 80px" />
          <div class="download-btn" @click="downImg(item.ImgUrl.Img)">下载海报</div>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="loadingState" :close-on-click-modal="false" :modal="false" modal-class="dialog-model"
      :title="isGetData ? '获取数据进度' : '复制进度'" width="40%">
      <!-- <div v-if="isGetData" class="loading-main">
        <el-progress :percentage="progressNum" type="circle" />
      </div> -->
      <div style="width: 100%; box-sizing: border-box; padding: 0 60px">
        <div v-if="progressNum === 100" style="font-size: 16px; text-align: center; margin-bottom: 10px">
          复制完成!
        </div>
        <div v-else style="font-size: 16px; text-align: center; margin-bottom: 10px">正在执行...请稍等</div>
        <!-- <div style="width: 100%; box-sizing: border-box; height: 30vh; position: relative"> -->
        <div ref="scrollContainer" class="scroll-container"
          style="width: 100%; box-sizing: border-box; height: 30vh; position: relative; overflow: auto;">
          <div v-for="(item, index) in errMsgList" :key="index"
            style="color: #e02020; font-size: 14px; line-height: 1.2; margin-bottom: 10px">
            {{ item }}
          </div>

        </div>
        <el-progress :color="customColors" :percentage="progressNum"
          style="margin-top: 20px;  left: 50%; transform: translateX(-50%); bottom: 0; width: 100%" />
      </div>
      <template #footer>
        <span class="dialog-footer" style="display: flex; align-items: center; justify-content: center">
          <el-button type="primary" @click="closeProgress">关 闭</el-button>
          <el-button type="warning" @click="stopProgress">停止任务</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="warningTipState" :close-on-click-modal="false" :modal="false" modal-class="dialog-center"
      title="提示" width="30%" center>
      <span>{{ errorConfirmText }}</span>
      <template #footer>
        <span class="dialog-footer" style="display: flex; align-items: center; justify-content: center">
          <el-button @click="warningTipClose">取 消</el-button>
          <el-button :disabled="!(countDown === 0)" type="primary" @click="confirmShopUpdate">
            <span v-if="countDown">{{ countDown }}</span>
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="logState" :close-on-click-modal="false" :modal="false" modal-class="dialog-model" title="搬菜历史记录"
      width="70%">
      <div class="log-table">
        <el-table :data="logList" height="400" style="width: 100%">
          <el-table-column label="记录ID" width="180">
            <template #default="{ row }">
              {{ row.id }}
            </template>
          </el-table-column>
          <el-table-column label="新店名称">
            <template #default="{ row }">
              <div style="font-size: 16px" :class="{ 'blur-text': demoMode }">{{ row.new_name }}</div>
              <div style="font-size: 12px; opacity: 0.8">店铺ID：<span :class="{ 'blur-text': demoMode }">{{ row.new_offid
              }}</span></div>
            </template>
          </el-table-column>
          <el-table-column label="老店名称">
            <template #default="{ row }">
              <div style="font-size: 16px" :class="{ 'blur-text': demoMode }">{{ row.old_name }}</div>
              <div style="font-size: 12px; opacity: 0.8">店铺ID：<span :class="{ 'blur-text': demoMode }">{{ row.old_offid
              }}</span></div>
            </template>
          </el-table-column>
          <el-table-column label="复制时间" width="160">
            <template #default="{ row }">
              <div>{{ row.copy_time }}</div>
            </template>
          </el-table-column>
          <el-table-column label="成功数/失败数" width="140">
            <template #default="{ row }">
              <div>{{ row.ok_count }}/{{ row.fail_count }}</div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="logList.length > 0" v-model:current-page="logParams.page"
          v-model:page-size="logParams.pagesize" v-model:total="logTotal" background layout="total, prev, pager, next"
          style="margin-top: 10px" @current-change="openLog" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logClose">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="activeLogState" :close-on-click-modal="false" :modal="false" modal-class="dialog-model"
      title="活动复制日志" width="50%">
      <div class="log-table">
        <el-table :data="activeLogList" height="400" style="width: 100%">
          <el-table-column label="记录ID" width="180">
            <template #default="{ row }">
              {{ row.id }}
            </template>
          </el-table-column>
          <el-table-column label="活动类型" width="140">
            <template #default="{ row }">
              {{ getActiveType(row.act_type) }}
            </template>
          </el-table-column>
          <el-table-column label="复制状态" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.succeed" type="success">复制成功</el-tag>
              <el-tag v-else type="danger">复制失败</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="失败原因">
            <template #default="{ row }">
              <div v-if="row.succeed">（无）</div>
              <div v-else>{{ row.err_msg }}</div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ row.crtim }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="activeLogList.length > 0" v-model:current-page="activeLogParams.page"
          v-model:page-size="activeLogParams.pagesize" v-model:total="activeLogTotal" background
          layout="total, prev, pager, next" style="margin-top: 10px" @current-change="pageTurning" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logClose">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="changePriceState" :close-on-click-modal="false" :modal="true" modal-class="dialog-center"
      title="提示" width="40%" center align-center append-to-body>
      <div>
        <el-form ref="changePriceForm" class="demo-ruleForm" label-width="100px" :model="priceParams"
          :rules="priceRules">
          <el-form-item label="调整方式" prop="mark_up">
            <el-radio-group v-model="priceParams.mark_up">
              <el-radio :label="true">涨价</el-radio>
              <el-radio :label="false">降价</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="幅度类型" prop="change_mode">
            <el-radio-group v-model="priceParams.change_mode">
              <el-radio :label="1">百分比</el-radio>
              <el-radio :label="2">固定金额</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="priceParams.change_mode === 1" class="position-unit" label="百分比" prop="value">
            <el-input v-model="priceParams.value" placeholder="请输入百分比" @input="handleInput" />
            <span class="unit">%</span>
          </el-form-item>
          <el-form-item v-if="priceParams.change_mode === 2" class="position-unit" label="金额" prop="value">
            <el-input v-model="priceParams.value" placeholder="请输入金额" @input="handleInput" />
            <span class="unit">元</span>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePriceChange">取 消</el-button>
          <el-button :loading="changePriceLoading" type="primary" @click="confirmChangePrice">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 改价进度对话框 -->
    <el-dialog v-model="changePriceProgressVisible" :close-on-click-modal="false" :close-on-press-escape="false"
      title="改价进度" width="500px" center append-to-body>
      <div style="text-align: center; padding: 20px 0;">
        <el-progress :percentage="changePriceProgress" :status="changePriceProgressStatus" />
        <div style="margin-top: 20px; color: #666;">
          <span v-if="changePriceProgressStatus === 'success'">改价完成！正在刷新数据...</span>
          <span v-else-if="changePriceProgressStatus === 'exception'">改价失败，请重试</span>
          <span v-else>正在批量修改商品价格，请稍候...</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="changePriceProgressStatus === 'success' || changePriceProgressStatus === 'exception'"
            type="primary" @click="closeChangePriceProgress">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <CreateHostedTask v-model="createHostedTaskVisible" :task-id="taskId" :shop-data="shopDataCopy" :old-shop="oldShop"
      @created="handleHostedTaskCreated" />

    <!-- 京东后台示例图片弹窗 -->
    <el-dialog v-model="jdImageDialogVisible" :title="jdImageDialogTitle" width="600px" :close-on-click-modal="true">
      <div style="text-align: center;">
        <img :src="jdImageUrl" style="max-width: 100%; max-height: 600px;" alt="京东后台示例图" />
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import {
  beachUpdateFoodPrice,
  beginData,
  createTask,

  foodFailCount,
  getActivityTaskLog,
  getFoodMoveDataForTask,
  getShopWithOffId,
  getTaskQuery,
  queryFoodTask,
  resetNewShop,
  resetOldShopData,
  syncActivity,
  syncDecorate,
  syncFoods,
  syncFoodsProgress,
  updateFood,
  startTask,
  stopTask,
  taskProgress, reportError
} from '/@/api/foodMove.ts'
import { gp } from '/@vab/plugins/vab.ts'
import { ElMessageBox, ElNotification } from 'element-plus'
import { UnitType } from '/@/utils/unitType'
import type { FormInstance } from 'element-plus'
import GroupMenu from '/@/views/shopCopy/components/GroupMenu.vue'
import GrouponFoodManager from '/@/views/shopCopy/components/GrouponFoodManager.vue'
import sussIcon from '/@/assets/shop_images/suss.png'
import errorIcon from '/@/assets/shop_images/error.png'
import jdOldImage from '/@/icon/jdupload/old.png'
import jdNewImage from '/@/icon/jdupload/new.png'
import { Delete, Search, ArrowUp, ArrowDown, QuestionFilled } from '@element-plus/icons-vue'
import { newaxios } from '~/src/api/setaxios'
import { useUserStore } from '/@/store/modules/user'
import { openWindow } from '/@/utils/openShopWin.ts'
import { number } from 'echarts'
import { CreateTaskTypeEnum } from '~/src/types/foodMove'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { FoodMoveTaskApi } from '/@/TsModel/Api/Alien/Faster/Controllers/FoodMove/FoodMoveTaskApi'
import { TaskListSortType } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/TaskListSortType'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import CreateHostedTask from '/@/views/shopCopy/components/CreateHostedTask.vue'
import { debounce } from 'lodash-es'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { nextTick, watch } from 'vue'
import ExcelJS from 'exceljs'

const props = defineProps({
  shopData: Object,
  taskId: String,
  oldShop: Object,
  navItemId: String
})
const scrollContainer = ref(null); // 滚动容器的 ref
const releaseshow = ref(false)
const emit = defineEmits(['gettaskId', 'setreleaseshow', 'removePage', 'registerShopIds'])

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// 应用模糊效果到 el-select 输入框
const applyBlurToSelect = () => {
  if (!demoMode.value) return

  nextTick(() => {
    setTimeout(() => {
      // 优先使用 ref 引用
      let selectEl: Element | null = null
      if (oldShopSelectRef.value && oldShopSelectRef.value.$el) {
        selectEl = oldShopSelectRef.value.$el
      } else {
        // 备用方案：通过 class 查找
        selectEl = document.querySelector('.blur-select')
      }

      if (!selectEl) return

      // 查找输入框 wrapper
      const inputWrapper = selectEl.querySelector('.el-input__wrapper')
      if (!inputWrapper) return

      const wrapper = inputWrapper as HTMLElement

      // 对整个 wrapper 应用模糊
      wrapper.style.setProperty('filter', 'blur(4px)', 'important')

      // 排除后缀图标区域
      const suffix = wrapper.querySelector('.el-input__suffix')
      if (suffix) {
        (suffix as HTMLElement).style.setProperty('filter', 'none', 'important')
      }
    }, 100)
  })
}

// 处理下拉框显示/隐藏变化
const handleSelectVisibleChange = (visible: boolean) => {
  if (!visible && demoMode.value) {
    // 下拉框关闭后重新应用模糊效果
    applyBlurToSelect()
  }
}

// 初始化 shopDataCopy 的默认值
const shopDataCopy = ref<any>({
  id: '',
  name: '',
  office_id: '',
  shop_type: 1,
  img: ''
})
const filterInput = ref('')
const oldShopLoading = ref(false)
const oldShopOptions = ref<any>([])
const oldShopSelectRef = ref<any>(null)

const oldShop = ref({
  id: '',
  name: '',
  office_id: '',
  shop_type: 0  // 初始为0，只有选择美团外卖店铺时才为1
})

// 复制配置
const copyConf = ref<{ SyncStock: boolean, SyncOnSale: boolean, CategoryUseRecomend: boolean, attr_recomend: boolean, attr_recomend_s: number, RemoveWaterMark: boolean, OtherConf: string }>({
  SyncStock: true,// 同步库存,如果为false 新店数据库存全部为99999
  SyncOnSale: true,//同步老店的上下架状态 如果为false 哪到到新店的商品将全部为上架状态
  CategoryUseRecomend: true,//商品类目用推荐模式 - 默认开启
  attr_recomend: true,//ai属性推荐
  attr_recomend_s: 60,//ai 属性推荐最小相似度% 默认60
  RemoveWaterMark: true,//是否智能去水印
  OtherConf: ""
})

// 如果从任务列表进入，自动填充老店信息
if (props.oldShop) {
  oldShop.value = {
    id: props.oldShop.id || '',
    name: props.oldShop.name || '',
    office_id: props.oldShop.office_id || '',
    shop_type: props.oldShop.shop_type || 1
  }
  // 预置一条选项保证下拉框能以名称展示
  oldShopOptions.value = [{
    id: oldShop.value.id,
    name: oldShop.value.name,
    office_id: oldShop.value.office_id,
    shop_type: oldShop.value.shop_type
  }]
  filterInput.value = oldShop.value.office_id
  var t: Number = oldShop.value.shop_type;
  if (t == 3 || t == 4 || t == 5 || t == 7) {
    copyConf.value.RemoveWaterMark = false;
    console.log("水印默认不选中")
  }
}
const otherConf = ref<{ use_excel: boolean, use_newjd: boolean }>({
  use_excel: false,
  use_newjd: false
})

/**
 * 处理"使用表格方式上传"开关变化
 * 如果开启，则关闭"京东新版后台"
 */
const handleExcelChange = (value: boolean | string | number) => {
  if (value) {
    otherConf.value.use_newjd = false
    console.log('开启表格方式上传，自动关闭京东新版后台')
  }
}

/**
 * 处理"京东新版后台"开关变化
 * 如果开启，则关闭"使用表格方式上传"
 */
const handleNewJdChange = (value: boolean | string | number) => {
  if (value) {
    otherConf.value.use_excel = false
    console.log('开启京东新版后台，自动关闭表格方式上传')
  }
}

// 京东后台示例图片弹窗相关
const jdImageDialogVisible = ref(false)
const jdImageDialogTitle = ref('')
const jdImageUrl = ref('')

/**
 * 显示京东后台示例图片弹窗
 * @param type 'old' 老版后台 或 'new' 新版后台
 */
const showJdImageDialog = (type: 'old' | 'new') => {
  if (type === 'old') {
    jdImageDialogTitle.value = '老版京东后台示例'
    jdImageUrl.value = jdOldImage
  } else {
    jdImageDialogTitle.value = '新版京东后台示例'
    jdImageUrl.value = jdNewImage
  }
  jdImageDialogVisible.value = true
}

const bcurlId = ref('')
const createHostedTaskVisible = ref(false)

// 如果从任务列表进入，检查数据是否准备好并自动获取数据
onMounted(async () => {
  if (taskId.value && props.oldShop && oldShop.value.name) {
    try {
      const isReady = await apiManager.foodmoveApi.IsOldShopDataReady(taskId.value)
      if (isReady) {
        // 数据已准备好，自动获取数据
        emit('gettaskId', taskId.value)
        getDataForTask()
      } else {
        gp.$baseMessage('老店数据尚未准备好，请稍后再试', 'warning', 'hey')
      }
    } catch (error: any) {
      console.error('检查老店数据状态失败:', error)
      gp.$baseMessage(error?.message || '检查老店数据状态失败', 'error', 'hey')
    }
  }
  const electron = (window as any).electron
  if (electron?.onRemoteBrowserWindowClosed) {
    offRemoteBrowserWindowClosed = electron.onRemoteBrowserWindowClosed(() => {
      remoteBrowserOpenedForShopId.value = null
    })
  }
})
const remoteMethod = (query: any) => {
  if (query === '') {
    oldShopOptions.value = []
  } else {
    oldShopLoading.value = true
    apiManager.fdmvmanagerApi.QueryShops(query, ShopType.None, shopDataCopy.value.shop_type)
      .then((data: any) => {
        oldShopOptions.value = data
        oldShopLoading.value = false
      })
      .finally(() => {
        oldShopLoading.value = false
      })
      .catch(() => {
        oldShopLoading.value = false
      })
  }
}
const getInputName = (val: any) => {
  oldShop.value = oldShopOptions.value.find((item: any) => item.office_id === val)
  filterInput.value = oldShop.value.office_id
  // 应用模糊效果到 el-select 输入框
  if (demoMode.value) {
    nextTick(() => {
      applyBlurToSelect()
    })
  }
  var t: Number = oldShop.value.shop_type;
  if (t == 3 || t == 4 || t == 5 || t == 7) {
    copyConf.value.RemoveWaterMark = false;
    console.log("水印默认不选中")
  }
}

const getDataLoading = ref(false)
const taskId = ref(props.taskId || '')
/*
 拉取老店数据 = 1,
 拉取新店商品 = 2,
 复制所有商品到新店 = 3,
 复制折扣活动 = 4,
*/
const taskType = ref(0);
const allGoodsCount = ref(0)
const groupForGoodList = ref<any>([])
const loadingState = ref(false)
const isGetData = ref(true)
const progressNum = ref(0)
const errorFoodCopy = ref(0)
const errMsgList = ref<any>([])
const customColors = [{ color: '#67c23a', percentage: 100 }]
const activityList = ref([])
const decorateInfo = ref({})
const foodGroups = ref<any>([]) // 食品分组列表，存储所有商品分类
const foodGroupDataList = ref<any>([]) // 存储食品分组数据列表，用于显示和处理
const currentGroupIndex = ref(0)
// 存储所有已修改的商品（key: foodId, value: 商品数据），用于批量复制时更新所有分类的商品价格
const modifiedFoodsMap = ref<Map<string, any>>(new Map())
const showShopDetailsState = ref(false)
const isShopInfoCollapsed = ref(false)
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
const reportErr = () => {
  ElMessageBox.confirm(
    '操作将授权"极狐助手"将您此次任务数据(新老店商品数据,复制错误日志)上传到云端,技术部可能在未来三天内对新店进行增删改查操作,但老店不影响,请问您是否继续?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      reportError(taskId.value).then(data => {
        var msg = data.data;
        console.log(data);
        copyData(msg);

        ElMessageBox.alert(msg.replace(/\n/g, '<br>'), "报告成功", {
          dangerouslyUseHTMLString: true,
        })
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
}
const getData = () => {
  if (!oldShop.value.id) {
    return gp.$baseMessage('请先输入门店ID选择需要同步的老店,并且确认店铺名称!', 'error', 'hey')
  }

  errMsgList.value = [];
  const clientParams: any = {
    NewShop: shopDataCopy.value.id,
    OldShop: oldShop.value.id,
    MaxThreads: 50,
    KeepNewShops: true,
    SyncStock: true,
    SyncActivitys: true,
    SyncOnSale: true,
    TaskType: CreateTaskTypeEnum.OldToNew,
    ResetNewShop: false,
    SyncDecoration: false,
    CategoryUseRecomend: false,
    RemoveWaterMark: false
  }
  const baseUrl = JSON.parse(localStorage.getItem('baseUrl') as string)
  console.log(baseUrl);
  var urlType = JSON.parse(localStorage.getItem('urlType'));
  console.log("url模式：", urlType);
  if (!baseUrl.move || urlType != 'custom') {

    apiManager.fdmvmanagerApi.CreateClient(clientParams).then(async (serverUrl: string) => {
      baseUrl.move = baseUrl
      try {
        emit('setreleaseshow', true)
        // localStorage.setItem('baseUrl', JSON.stringify(baseUrl))
        await createShopTask()
      } catch { } finally {
        releaseshow.value = false
      }
    })
  } else {
    try {
      emit('setreleaseshow', true)
      //localStorage.setItem('baseUrl', JSON.stringify(baseUrl))
      createShopTask()
    } catch { } finally {
      releaseshow.value = false
    }
  }
}
const testtest = () => {
  loadingState.value = true
  isGetData.value = false
}
const closeProgress = () => {
  loadingState.value = false
  errMsgList.value = []
  progressNum.value = 0
}
const stopProgress = () => {
  /*
   拉取老店数据 = 1,
  拉取新店商品 = 2,
  复制所有商品到新店 = 3,
  复制折扣活动 = 4,
  */

  stopTask({ taskid: taskId.value, tasktype: taskType.value }).then(res => {


    ElNotification({
      title: '注意',
      message: '停止请求已发送,请等待任务自动停止!',
      type: 'warning',
    })
  })
}
const addTestMsg = () => {
  for (let index = 0; index < 10; index++) {
    errMsgList.value.push("aaaaa" + index);

  }

}
const createShopTask = async () => {
  allGoodsCount.value = 0
  groupGoodParams.page = 1
  errorParams.page = 1
  groupForGoodList.value = []
  loadingState.value = true
  createTask({
    NewShop: shopDataCopy.value.id,
    OldShop: oldShop.value.id,
    MaxThreads: 50,
    KeepNewShops: true,
    SyncStock: true,
    SyncActivitys: true,
    SyncOnSale: true,
    attr_recomend: true,
    attr_recomend_s: 60,
    TaskType: CreateTaskTypeEnum.OldToNew
  })
    .then((res: any) => {
      if (res.code === 200) {
        taskId.value = res.data.id
        emit('gettaskId', taskId.value)
        if (taskId.value) {
          isGetData.value = true
          prepareData()
          tryAutoOpenRemoteBrowser()
        }
      }
    })
    .catch(() => {
      loadingState.value = false
    })
}
const prepareData = () => {
  const checkProgress = async () => {
    taskType.value = 1;
    try {
      const res: any = await beginData(taskId.value)
      if (res.code === 200) {
        const { Progress, Total, IsFinished } = res.data
        progressNum.value = Progress ? Math.ceil((Progress / (Total + 5)) * 100) : 0

        if (IsFinished) {
          progressNum.value = 100
          // 显示成功消息
          setTimeout(() => {
            gp.$baseMessage('数据获取完成!', 'success', 'hey')
          }, 500)
          // 等待500ms后执行后续操作
          setTimeout(() => {
            getDataForTask()
            getFoodMoveShopWithOffId()
            loadingState.value = false
            progressNum.value = 0
          }, 1000)


        } else {
          // 如果任务未完成，设置一个定时器在800ms后再次尝试
          setTimeout(() => checkProgress(), 2000)
        }
      } else {
        // console.error("Unexpected response code:", res.code);
        // 处理非200响应码的情况
        loadingState.value = false
      }
    } catch {
      // console.error("Error occurred during polling:", error);
      // 发生错误时停止轮询，并设置加载状态为false
      loadingState.value = false
    }
  }
  // 开始轮询
  checkProgress()
}

// 判断是否存在"复制异常商品"
const hasErrorFoodGroup = computed(() => {
  return foodGroups.value && foodGroups.value.length > 0 &&
    foodGroups.value[0]?.Group?.id === 'error_food_id'
})

// 递归全选所有分组（包括一级和二级）
const selectAllGroupsRecursive = (list: any[]) => {
  if (list && list.length > 0) {
    list.forEach((item: any) => {
      if (item.Group) {
        item.Group.check = true
        // 清除半选状态
        if (item.Group.hasOwnProperty('indeterminate')) {
          item.Group.indeterminate = false
        }
      }
      // 递归处理子分组
      if (item.Children && item.Children.length > 0) {
        selectAllGroupsRecursive(item.Children)
      }
    })
  }
}

// 递归取消全选所有分组（包括一级和二级）
const unselectAllGroupsRecursive = (list: any[]) => {
  if (list && list.length > 0) {
    list.forEach((item: any) => {
      if (item.Group) {
        item.Group.check = false
        // 清除半选状态
        if (item.Group.hasOwnProperty('indeterminate')) {
          item.Group.indeterminate = false
        }
      }
      // 递归处理子分组
      if (item.Children && item.Children.length > 0) {
        unselectAllGroupsRecursive(item.Children)
      }
    })
  }
}

// 全选所有分组
const selectAllGroups = () => {
  if (foodGroups.value && foodGroups.value.length > 0) {
    selectAllGroupsRecursive(foodGroups.value)
  }
}

// 取消全选所有分组
const unselectAllGroups = () => {
  if (foodGroups.value && foodGroups.value.length > 0) {
    unselectAllGroupsRecursive(foodGroups.value)
  }
}

// 处理分组 checkbox 变化事件（保持一致性，MoveShop 中不需要特殊处理）
const handleGroupCheckboxChange = (item: any, checked: boolean) => {
  // MoveShop 中的分组状态已经通过 v-model 自动更新了
  // 这里可以添加其他需要的逻辑
}

// 递归添加属性
const groupAddCheck = (list: any) => {
  if (list && list.length > 0) {
    list.forEach((item: any) => {
      item.Group.check = true
      allGoodsCount.value += item.Group.FoodCount
      // 如果有子分组，先递归处理子分组
      if (item.Children && item.Children.length > 0) {
        groupAddCheck(item.Children)
        // 累加子分组的 FoodCount 到父分组
        item.Group.FoodCount += item.Children.reduce((sum: number, child: any) => sum + child.Group.FoodCount, 0)
      }
    })
  }
}

const getDataForTask = () => {
  getFoodMoveDataForTask(taskId.value).then((res: any) => {
    if (res.code === 200) {
      activityList.value = res.data.ActivityList
      activityList.value.forEach((item: any) => {
        item.isLoading = false
      })
      activityList.value.sort((a: any, b: any) => {
        // 如果 a.Type 是 3，则 a 排在前面
        if (a.Type === 3) return -1
        // 如果 b.Type 是 3，则 b 排在前面
        if (b.Type === 3) return 1
        // 如果两者都不是 3 或都是 3，则保持原有顺序
        return 0
      })
      decorateInfo.value = res.data.DecorateInfo
      // 过滤前先记录后端真实"团购商品"分组，供 GrouponFoodManager 加载/保存使用（永不被普通分组覆盖）
      trueGrouponGroup.value = (res.data.FoodGroups || []).find((g: any) =>
        g.Group?.OfficeId === 'tuangou_def' || g.Group?.Name === '团购商品'
      ) ?? null
      // 过滤掉后端返回的真实"团购商品"分组，由虚拟分组代替展示
      foodGroups.value = (res.data.FoodGroups || []).filter((g: any) =>
        g.Group?.OfficeId !== 'tuangou_def' && g.Group?.Name !== '团购商品'
      )
      if (res.data.FoodGroupDataStates) {
        foodGroupDataList.value = res.data.FoodGroupDataStates
      }
      allGoodsCount.value = 0
      if (foodGroups.value && foodGroups.value.length > 0) {
        groupAddCheck(foodGroups.value)
        copyError()
        ensureGrouponVirtualGroup()
        getGroupGoodList(foodGroups.value[currentGroupIndex.value])
      }
      console.log(foodGroups.value, 'foodGroupsfoodGroupsfoodGroups')
      copyError()
      ensureGrouponVirtualGroup()
      showShopDetailsState.value = true
    }
  })
}
const groupGoodParams = reactive({
  page: 1,
  pagesize: 10,
  groupid: '',
  taskid: ''
})
const currentGroupId = ref('')
const isErrorListState = ref(false)
const isGrouponState = ref(false)
// 是否处于真正的团购商品分组（控制 GrouponFoodManager 的新增/保存按钮显示）
const isGrouponGroup = ref(false)
// 后端返回的真实"团购商品"分组（加载时记录，永不被普通分组覆盖）
const trueGrouponGroup = ref<any>(null)
// 当前传给 GrouponFoodManager 的分组：团购模式用真实团购分组，普通分组检测模式用当前分组
const currentDetectedGrouponGroup = ref<any>(null)
const realGrouponGroup = computed(() =>
  isGrouponGroup.value ? trueGrouponGroup.value : currentDetectedGrouponGroup.value
)
const grouponManagerRef = ref<any>(null)

// 判断新店是否为团购类型（1000~1999 范围）
const isGrouponShop = computed(() => {
  const t = shopDataCopy.value?.shop_type
  return typeof t === 'number' && t >= 1000 && t < 2000
})

// 确保团购虚拟分组存在于 foodGroups 中（异常分组之后）
const ensureGrouponVirtualGroup = () => {
  if (!isGrouponShop.value) return
  const hasGroupon = foodGroups.value.some((g: any) => g.Group?.id === 'groupon_food_id')
  if (hasGroupon) return
  // 查找异常分组的位置，插到其后面；若没有则放到最前面
  const errIdx = foodGroups.value.findIndex((g: any) => g.Group?.id === 'error_food_id')
  const insertIdx = errIdx >= 0 ? errIdx + 1 : 0
  foodGroups.value.splice(insertIdx, 0, {
    id: 'groupon_food_id',
    Group: { id: 'groupon_food_id', check: false, Name: '团购商品', FoodCount: 0 }
  })
}
// 商品名称过滤
const foodNameFilter = ref('')

/**
 * 处理商品名称过滤（带防抖）
 */
const handleFoodNameFilter = debounce(() => {
  // 重置到第一页
  if (isErrorListState.value) {
    errorParams.page = 1
    getErrorCopyList()
  } else {
    groupGoodParams.page = 1
    getGoodForGroupList()
  }
}, 500)

/**
 * 清空过滤条件
 */
const handleFoodNameFilterClear = () => {
  foodNameFilter.value = ''
  // 重置到第一页并重新加载
  if (isErrorListState.value) {
    errorParams.page = 1
    getErrorCopyList()
  } else {
    groupGoodParams.page = 1
    getGoodForGroupList()
  }
}

const getGroupGoodList = (item: any) => {
  console.log(item, 'item')

  // 在切换分类之前，先保存当前分类的所有已修改商品到Map中
  // 这样可以确保即使用户修改了价格后直接切换分类，修改也不会丢失
  if (groupForGoodList.value && groupForGoodList.value.length > 0) {
    groupForGoodList.value.forEach((foodItem: any) => {
      if (foodItem && foodItem.id) {
        // 保存当前商品的最新数据（包含用户修改的价格）
        modifiedFoodsMap.value.set(foodItem.id, JSON.parse(JSON.stringify(foodItem)))
      }
    })
    console.log(`切换分类前，已保存 ${groupForGoodList.value.length} 个商品到Map中`)
  }

  currentGroupId.value = item.id
  groupGoodParams.page = 1
  errorParams.page = 1
  // 切换分组时清空过滤条件
  foodNameFilter.value = ''
  // if(item.Group.id=='error_food_id'){
  //   isErrorListState.value = true
  //   getErrorCopyList()
  // }else {
  //   isErrorListState.value = false
  //   groupGoodParams.groupid = item.id
  //   groupGoodParams.taskid = taskId.value
  //   getGoodForGroupList()
  // }
  if (item.Group.Name.includes('复制异常')) {
    isErrorListState.value = true
    isGrouponState.value = false
    getErrorCopyList()
  } else if (item.Group.id === 'groupon_food_id') {
    isErrorListState.value = false
    isGrouponState.value = true
    isGrouponGroup.value = true
    // 若真实团购分组尚未记录（后端首次创建后未同步），先刷新分组列表再 reload
    if (!trueGrouponGroup.value) {
      getFoodMoveDataForTask(taskId.value).then((res: any) => {
        if (res.code === 200) {
          trueGrouponGroup.value = (res.data.FoodGroups || []).find((g: any) =>
            g.Group?.OfficeId === 'tuangou_def' || g.Group?.Name === '团购商品'
          ) ?? null
        }
        nextTick(() => grouponManagerRef.value?.reload())
      })
    } else {
      nextTick(() => grouponManagerRef.value?.reload())
    }
  } else {
    isErrorListState.value = false
    isGrouponGroup.value = false
    groupGoodParams.groupid = item.id
    groupGoodParams.taskid = taskId.value
    // 正常加载第一页，根据结果判断是否为团购分组，若是则把数据直接传给子组件避免二次请求
    goodsLoading.value = true
    apiManager.foodmoveApi.GetGroupFoods(taskId.value, item.id, 1, groupGoodParams.pagesize).then((res: any) => {
      const rows = res.rows || []
      const isGroupon = rows.some((r: any) => r.TG_CustomGroupFoods && r.TG_CustomGroupFoods.length > 0)
      if (isGroupon) {
        currentDetectedGrouponGroup.value = item
        isGrouponState.value = true
        nextTick(() => grouponManagerRef.value?.reload(rows))
      } else {
        isGrouponState.value = false
        groupForGoodList.value = rows
        groupForGoodTotal.value = res.total ?? 0
        groupForGoodList.value.forEach((foodItem: any) => {
          foodItem.isLoading = false
          foodItem.isUpdate = false
          if (foodItem.Specifications?.length > 0) {
            foodItem.Specifications.sort((a: any, b: any) => a.Index - b.Index)
          }
          if (foodItem.id && modifiedFoodsMap.value.has(foodItem.id)) {
            Object.assign(foodItem, modifiedFoodsMap.value.get(foodItem.id))
          }
        })
      }
    }).catch(() => {
      isGrouponState.value = false
      getGoodForGroupList()
    }).finally(() => {
      goodsLoading.value = false
    })
  }
}
const errorParams = reactive({
  taskid: '',
  page: 1,
  pagesize: 10
})
const groupForGoodTotal = ref(0)
const getErrorCopyList = async () => {
  isErrorListState.value = true
  goodsLoading.value = true
  errorParams.taskid = taskId.value
  try {
    const result = await apiManager.foodmoveApi.GetFoodTaskErrLog(
      taskId.value,
      errorParams.page,
      errorParams.pagesize,
      foodNameFilter.value || undefined
    )
    groupForGoodList.value = []
    result.rows.forEach((item: any) => {
      const { FoodVo, err_msg, succeed, food_id } = item
      groupForGoodList.value.push({
        ...FoodVo,
        err_msg,
        succeed,
        id: food_id,
        CopyTask: {
          succeed
        }
      })
    })
    groupForGoodList.value.forEach((item: any) => {
      item.isLoading = false
      if (item && item.Specifications && item.Specifications.length > 0) {
        item.Specifications.sort((a: any, b: any) => a.Index - b.Index)
      }
    })
    groupForGoodTotal.value = result.total
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取错误商品列表失败', 'error', 'hey')
  } finally {
    goodsLoading.value = false
  }
}
const goodsLoading = ref(false)
const getGoodForGroupList = async () => {
  isErrorListState.value = false
  goodsLoading.value = true
  try {
    // 当有搜索条件时，不传 groupId，表示搜索所有分组
    const groupIdParam = foodNameFilter.value ? undefined : groupGoodParams.groupid

    const result = await apiManager.foodmoveApi.GetGroupFoods(
      groupGoodParams.taskid,
      groupIdParam,
      groupGoodParams.page,
      groupGoodParams.pagesize,
      foodNameFilter.value || undefined
    )
    groupForGoodList.value = result.rows
    groupForGoodList.value.forEach((item: any) => {
      item.isLoading = false
      item.isUpdate = false
      if (item && item.Specifications && item.Specifications.length > 0) {
        item.Specifications.sort((a: any, b: any) => a.Index - b.Index)
      }
      // 如果商品在已修改的Map中，恢复其修改后的数据
      if (item && item.id && modifiedFoodsMap.value.has(item.id)) {
        const modifiedItem = modifiedFoodsMap.value.get(item.id)
        // 合并修改后的数据到当前商品
        Object.assign(item, modifiedItem)
      }
    })
    groupForGoodTotal.value = result.total
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取商品列表失败', 'error', 'hey')
  } finally {
    goodsLoading.value = false
  }
}
const oldShopDetails = ref({})
const getFoodMoveShopWithOffId = () => {
  getShopWithOffId(oldShop.value.office_id).then((res: any) => {
    if (res.code === 200) {
      oldShopDetails.value = res.data
    }
  })
}
const errorConfirmType = ref('')
const errorConfirmText = ref('')
const updateOldShopData = () => {
  errorConfirmType.value = 'updateOldShop'
  errorConfirmText.value = `操作提示：当您发现当前老店数据与后台商品信息不一致时，请点击此按钮。一键操作后，系统将自动同步并更新至最新的老店商品数据，确保信息的准确性和实时性。`
  openInterval()
}
const updateNewShopData = () => {
  errorConfirmType.value = 'updateNewShop'
  errorConfirmText.value = `操作提示：如果复制折扣活动商品不全，请点击此按钮进行更新新店数据然后再重新复制一遍活动。`
  openInterval()
}
const warningTipState = ref(false)
const countDown = ref(0)
const countDownInterval = ref()
const openInterval = () => {
  warningTipState.value = true
  countDown.value = 3
  countDownInterval.value = setInterval(() => {
    countDown.value--
  }, 1000)
}
// 监听 shopDataCopy、oldShop 变化，向父组件注册 shopIds（用于复制页关闭时关闭远程浏览器关联店铺）
watch([shopDataCopy, oldShop], () => {
  const ids = [shopDataCopy.value?.id, oldShop.value?.id].filter(Boolean) as string[]
  if (ids.length) emit('registerShopIds', { shopIds: ids })
}, { immediate: true })

// 监听 props.shopData 的变化，确保 shopDataCopy 同步更新
watch(() => props.shopData, (newVal) => {
  if (newVal) {
    shopDataCopy.value = JSON.parse(JSON.stringify(newVal))
  } else {
    shopDataCopy.value = {
      id: '',
      name: '',
      office_id: '',
      shop_type: 1,
      img: ''
    }
  }
}, { immediate: true, deep: true })

watch(countDown, val => {
  console.log(countDown, '123')
  if (val === 0) {
    clearCountDownInterval()
  }
})
// 监听 errMsgList 的变化
watch(errMsgList, val => {

  // 在 DOM 更新完成后滚动到最底部
  setTimeout(() => {
    if (scrollContainer.value) {

      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  }, 0);
}, { deep: true });
const logParams = reactive({
  shopOffId: '',
  page: 1,
  pagesize: 20
})
const logList = ref([])
const logTotal = ref(0)
const logState = ref(false)
const openLog = () => {
  // if (!taskId.value) {
  //   return gp.$baseMessage('请先点击"获取数据按钮"再尝试查看搬菜历史记录!', 'error', 'hey')
  // }
  logParams.shopOffId = shopDataCopy.value.office_id
  getTaskQuery(logParams).then((res: any) => {
    if (res.code === 200) {
      logList.value = res.data.rows
      logTotal.value = res.data.total
      logState.value = true
    }
  })
}
const openWarningTip = () => {
  errorConfirmType.value = 'clearShop'
  errorConfirmText.value = '您即将进行的操作将会清空新店的所有商品，是否继续？'
  openInterval()
}

// 导出异常商品
const exportErrorFoods = async () => {
  try {
    const loading = ElNotification({
      title: '提示',
      message: '正在导出异常商品，请稍候...',
      type: 'info',
      duration: 0
    })

    // 获取所有异常商品数据
    const allErrorFoods: any[] = []
    let page = 1
    const pageSize = 100
    let hasMore = true

    while (hasMore) {
      const result = await apiManager.foodmoveApi.GetFoodTaskErrLog(
        taskId.value,
        page,
        pageSize
      )

      if (result && result.rows && result.rows.length > 0) {
        allErrorFoods.push(...result.rows)
        hasMore = result.rows.length === pageSize
        page++
      } else {
        hasMore = false
      }
    }

    if (allErrorFoods.length === 0) {
      loading.close()
      ElNotification({
        title: '提示',
        message: '没有异常商品需要导出',
        type: 'warning'
      })
      return
    }

    // 使用Electron的IPC导出Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('异常商品列表')

    // 设置表头
    worksheet.columns = [
      { header: '商品名称', key: 'food_name', width: 35 },
      { header: '错误信息', key: 'err_msg', width: 60 }
    ]

    // 设置表头样式
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 25

    // 填充数据
    allErrorFoods.forEach((item: any) => {
      const foodVo = item.FoodVo || {}

      const row = worksheet.addRow({
        food_name: foodVo.Name || item.food_old || '',
        err_msg: item.err_msg || ''
      })

      // 设置单元格边框
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // 导出文件
    const buffer = await workbook.xlsx.writeBuffer()

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const fileName = `异常商品列表_${taskId.value}_${timestamp}.xlsx`

    // 使用 window.electron 访问 electron API
    const electron = (window as any).electron
    if (!electron || !electron.ipcRenderer) {
      throw new Error('Electron API 不可用，请确保在 Electron 环境中运行')
    }

    const result = await electron.ipcRenderer.invoke('save-excel-file', {
      buffer: Array.from(new Uint8Array(buffer)),
      defaultPath: fileName
    })

    loading.close()

    if (result.success) {
      ElNotification({
        title: '成功',
        message: `异常商品导出成功！共导出 ${allErrorFoods.length} 条数据`,
        type: 'success'
      })
    } else if (!result.canceled) {
      ElNotification({
        title: '失败',
        message: result.error || '导出失败',
        type: 'error'
      })
    }
  } catch (error: any) {
    ElNotification({
      title: '错误',
      message: error.message || '导出异常商品失败',
      type: 'error'
    })
  }
}

const copyShopPoster = () => {
  ElMessageBox.confirm('此操作复制店招海报, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      syncDecorate(taskId.value).then((res: any) => {
        if (res.code === 200) {
          return gp.$baseMessage('复制成功!', 'success', 'hey')
        }
      })
    })
    .catch()
}
const copyState = ref('more')
const copyGoods = async () => {
  errMsgList.value = [];
  copyState.value = 'more'
  const groupIds: string[] = []
  function getGroupCheck(item: any) {
    if (item.Group.check) {
      groupIds.push(item.id)
    }
    //递归子分组
    if (item.Children?.length > 0) {
      item.Children.forEach((item: any) => getGroupCheck(item))
    }
  }
  foodGroups.value.forEach((item: any) => getGroupCheck(item))

  // 过滤掉异常分组和虚拟分组ID
  let filteredGroupIds = groupIds.filter(id => id !== 'error_food_id' && id !== 'groupon_food_id')

  // 新店是团购类型时，只复制"团购商品"分组（OfficeId === 'tuangou_def' 或 Name === '团购商品'）
  if (isGrouponShop.value) {
    const grouponGroup = foodGroups.value.find((item: any) => {
      const g = item.Group
      return g && g.id !== 'groupon_food_id' && g.id !== 'error_food_id'
        && (g.OfficeId === 'tuangou_def' || g.Name === '团购商品')
    })
    filteredGroupIds = grouponGroup ? [grouponGroup.id] : []
  }

  // 如果没有选择任何正常分组，代表复制全部
  // if (filteredGroupIds.length === 0) {
  //   return gp.$baseMessage('请选择需要复制的分组!', 'error', 'hey')
  // }

  ElMessageBox.confirm('此操作将复制已选中的商品, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      // 此处不再调用 recoverFoods，避免与改价流程中的恢复任务冲突，防止出现
      // “任务已有后台任务(恢复商品)在运行”的报错。批量复制直接依赖改价流程中
      // 已经完成的 FoodUpdate 清空和 FoodSource 更新。

      // 一键复制不需要调用 updateFood 接口
      // 启动批量复制
      taskType.value = 3;
      copyConf.value.OtherConf = JSON.stringify(otherConf.value)
      // 先显示进度条
      loadingState.value = true
      isGetData.value = false
      progressNum.value = 0
      errMsgList.value = []

      await tryAutoOpenRemoteBrowser()
      syncFoods({
        taskId: taskId.value,
        foodIds: null,
        groupIds: filteredGroupIds.length > 0 ? filteredGroupIds : null,
        DotCheck: false,
        indexSet: true,
        CopyConf: { ...copyConf.value, OtherConf: JSON.stringify(otherConf.value) },
        SyncOnSale: true,
      }).then(async (res: any) => {
        if (res.code === 200) {
          // 延迟更长时间，让后端有时间处理任务和返回错误信息
          await new Promise(resolve => setTimeout(resolve, 1000))
          // 立即检查一次任务状态，看是否有错误（检查多次，因为错误信息可能稍后才返回）
          let checkCount = 0
          const maxChecks = 3
          const checkProgress = async () => {
            try {
              const progressRes: any = await syncFoodsProgress(taskId.value)
              // console.log('检查任务进度，响应:', progressRes)
              if (progressRes.code === 200) {
                // 输出完整的 data 对象，查看所有字段
                // console.log('完整的 data 对象:', JSON.stringify(progressRes.data, null, 2))
                const { ExceptionMsg, ErrMsg, IsFinished, Progress, Total, Status, Item, FailCount, OkCount } = progressRes.data
                // console.log('任务状态 - ExceptionMsg:', ExceptionMsg, 'ErrMsg:', ErrMsg, 'IsFinished:', IsFinished, 'Status:', Status, 'FailCount:', FailCount)

                // 查询任务列表获取当前阶段信息，只显示同步分组和同步商品阶段的错误
                let currentTaskStage: number | null = null
                try {
                  const axiosInstance = apiManager.getAxiosInstance()
                  const baseUrl = axiosInstance.defaults.baseURL || ''
                  const foodMoveTaskApi = new FoodMoveTaskApi(axiosInstance, baseUrl)
                  const taskListResult = await foodMoveTaskApi.GetTaskJobList({
                    page: 1,
                    pageSize: 100,
                    NewShopOfficeId: shopDataCopy.value.office_id,
                    SortType: TaskListSortType.最新创建时间
                  })
                  const taskList = (taskListResult as any)?.rows || (taskListResult as any)?.data?.rows || []
                  const currentTask = taskList.find((task: any) => task.TaskId === taskId.value)
                  if (currentTask && currentTask.CurrentStage !== undefined && currentTask.CurrentStage !== null) {
                    currentTaskStage = currentTask.CurrentStage
                  }
                } catch (error: any) {
                  // 忽略查询错误，继续处理
                }

                // 更新进度
                progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0

                // 只显示同步商品分组(7)和商品复制任务(3)阶段的错误
                if (currentTaskStage === 7 || currentTaskStage === 3) {
                  // 如果有异常消息，说明任务已经失败
                  // 过滤掉"任务完成"相关的消息，这些不是错误
                  if (ExceptionMsg && !ExceptionMsg.includes('任务完成') && !ExceptionMsg.includes('已完成')) {
                    if (!errMsgList.value.some((msg: string) => msg.includes(ExceptionMsg))) {
                      errMsgList.value.push(`【任务出错】${ExceptionMsg}`)
                      // console.log('添加异常消息到错误列表:', ExceptionMsg)
                    }
                  }

                  // 如果有错误消息，也显示
                  // 过滤掉"任务完成"相关的消息
                  if (ErrMsg && ErrMsg.length > 0) {
                    ErrMsg.forEach((msg: string) => {
                      if (!msg.includes('任务完成') && !msg.includes('已完成')) {
                        if (!errMsgList.value.some((m: string) => m.includes(msg))) {
                          errMsgList.value.push(msg)
                          // console.log('添加错误消息到错误列表:', msg)
                        }
                      }
                    })
                  }

                  // 检查 Status 字段，如果有失败状态，也应该显示错误
                  if (Status !== undefined && Status !== null) {
                    // Status 可能是枚举值，检查是否是失败状态
                    // 通常失败状态可能是 2, 3, 'Failed', 'Error' 等
                    const statusStr = String(Status).toLowerCase()
                    if (statusStr.includes('fail') || statusStr.includes('error') || Status === 2 || Status === 3) {
                      const errorMsg = `任务状态异常: ${Status}`
                      if (!errMsgList.value.some((msg: string) => msg.includes(errorMsg))) {
                        errMsgList.value.push(`【任务出错】${errorMsg}`)
                        // console.log('检测到失败状态，添加错误信息:', errorMsg)
                      }
                    }
                  }

                  // 检查 FailCount，如果有失败数量，也应该显示
                  if (FailCount !== undefined && FailCount !== null && FailCount > 0) {
                    const errorMsg = `任务执行失败，失败数量: ${FailCount}`
                    if (!errMsgList.value.some((msg: string) => msg.includes(errorMsg))) {
                      errMsgList.value.push(`【任务出错】${errorMsg}`)
                      // console.log('检测到失败数量，添加错误信息:', errorMsg)
                    }
                  }

                  // 检查 Item 字段，可能包含错误信息
                  if (Item && typeof Item === 'string' && (Item.includes('错误') || Item.includes('失败') || Item.includes('出错'))) {
                    if (!errMsgList.value.some((msg: string) => msg.includes(Item))) {
                      errMsgList.value.push(`【任务出错】${Item}`)
                      // console.log('从 Item 字段检测到错误信息:', Item)
                    }
                  }
                }

                // 如果任务已经完成，返回 true 表示可以停止检查
                if (IsFinished) {
                  return true
                }
              }
            } catch (progressError: any) {
              // console.error('检查任务进度失败:', progressError)
            }
            return false // 返回 false 表示继续检查
          }

          // 循环检查，最多检查3次
          let hasDetectedError = false
          while (checkCount < maxChecks) {
            const hasError = await checkProgress()
            if (hasError) {
              // 如果检测到错误，标记但继续检查，以便获取完整的错误信息
              hasDetectedError = true
              // 如果任务已完成（无论是否有错误），停止检查，开始轮询
              try {
                const progressRes: any = await syncFoodsProgress(taskId.value)
                if (progressRes.code === 200 && progressRes.data.IsFinished) {
                  break
                }
              } catch (e) {
                // 忽略检查错误
              }
            }
            checkCount++
            if (checkCount < maxChecks) {
              // 等待一段时间后再次检查
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }

          // 无论是否检测到错误，都开始轮询，以便持续获取错误信息和更新进度
          setSyncFoodsProgress()
        } else {
          // 如果接口返回错误（如同步分组失败），显示错误信息，保持进度条打开
          const errorMsg = res.message || res.msg || '同步分组失败，请检查错误信息'
          errMsgList.value.push(`【任务出错】${errorMsg}`)
          progressNum.value = 0
          // console.error('syncFoods 返回错误:', res)
          // 不关闭进度条，让用户能看到错误信息
        }
      }).catch((error: any) => {
        // 如果接口调用异常（如同步分组阶段出错），显示错误信息，保持进度条打开
        // request.ts 中错误时直接 throw data，所以 error 就是响应数据
        let errorMsg = '同步分组时发生错误，请稍后重试'
        if (error) {
          if (typeof error === 'string') {
            errorMsg = error
          } else if (error.message) {
            errorMsg = error.message
          } else if (error.msg) {
            errorMsg = error.msg
          } else if (error.data?.message) {
            errorMsg = error.data.message
          } else if (error.response?.data?.message) {
            errorMsg = error.response.data.message
          } else if (error.response?.data?.msg) {
            errorMsg = error.response.data.msg
          }
        }
        errMsgList.value.push(`【任务出错】${errorMsg}`)
        progressNum.value = 0
        // console.error('syncFoods 调用失败，完整错误信息:', error)
        // 确保进度条保持打开状态
        if (!loadingState.value) {
          loadingState.value = true
        }
        // 不关闭进度条，让用户能看到错误信息
      })
    })
    .catch(() => {
      loadingState.value = false
      errMsgList.value = []
    })
}
const setSyncFoodsProgress = async () => {
  try {
    // 调用接口并等待结果
    const res: any = await syncFoodsProgress(taskId.value)
    if (res.code === 200) {
      // 输出完整的 data 对象，查看所有字段
      // console.log('轮询任务进度，完整的 data 对象:', JSON.stringify(res.data, null, 2))
      const { Progress, Total, IsFinished, ErrMsg, ExceptionMsg, Status, Item, FailCount, OkCount } = res.data
      // console.log('轮询任务状态 - ExceptionMsg:', ExceptionMsg, 'ErrMsg:', ErrMsg, 'IsFinished:', IsFinished, 'Status:', Status, 'FailCount:', FailCount)

      // ErrMsg 和 ExceptionMsg 可能包含所有阶段的错误，需要根据任务阶段过滤
      // 先查询任务列表获取当前阶段信息（只在需要时查询一次）
      let currentTaskStage: number | null = null
      let taskList: any[] = []
      if (ErrMsg && ErrMsg.length > 0 || ExceptionMsg) {
        try {
          const axiosInstance = apiManager.getAxiosInstance()
          const baseUrl = axiosInstance.defaults.baseURL || ''
          const foodMoveTaskApi = new FoodMoveTaskApi(axiosInstance, baseUrl)
          const taskListResult = await foodMoveTaskApi.GetTaskJobList({
            page: 1,
            pageSize: 100,
            NewShopOfficeId: shopDataCopy.value.office_id,
            SortType: TaskListSortType.最新创建时间
          })
          taskList = (taskListResult as any)?.rows || (taskListResult as any)?.data?.rows || []
          const currentTask = taskList.find((task: any) => task.TaskId === taskId.value)
          if (currentTask && currentTask.CurrentStage !== undefined && currentTask.CurrentStage !== null) {
            currentTaskStage = currentTask.CurrentStage
          }
        } catch (error: any) {
          // 忽略查询错误，继续处理
        }
      }

      // 只显示同步商品分组(7)和商品复制任务(3)阶段的错误
      // 过滤掉"任务完成"相关的消息，这些不是错误
      if (ErrMsg && ErrMsg.length > 0) {
        if (currentTaskStage === 7 || currentTaskStage === 3) {
          const filteredErrMsg = ErrMsg.filter((msg: string) => !msg.includes('任务完成') && !msg.includes('已完成'))
          if (filteredErrMsg.length > 0) {
            errMsgList.value.push(...filteredErrMsg)
          }
        }
      }
      // 更新进度
      progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0
      if (IsFinished) {
        // 任务完成后，查询任务信息获取错误信息
        // 如果之前已经查询过任务列表，直接使用；否则重新查询
        if (taskList.length === 0) {
          try {
            const axiosInstance = apiManager.getAxiosInstance()
            const baseUrl = axiosInstance.defaults.baseURL || ''
            const foodMoveTaskApi = new FoodMoveTaskApi(axiosInstance, baseUrl)
            const taskListResult = await foodMoveTaskApi.GetTaskJobList({
              page: 1,
              pageSize: 100,
              NewShopOfficeId: shopDataCopy.value.office_id,
              SortType: TaskListSortType.最新创建时间
            })
            taskList = (taskListResult as any)?.rows || (taskListResult as any)?.data?.rows || []
          } catch (error: any) {
            // console.error('查询任务信息失败:', error)
          }
        }

        // 找到当前任务
        const currentTask = taskList.find((task: any) => task.TaskId === taskId.value)
        // console.log('当前任务信息:', currentTask)

        // 如果有错误信息，只显示同步分组阶段和同步商品阶段的错误
        if (currentTask && currentTask.JobErrMsg) {
          // 只显示同步商品分组(7)和商品复制任务(3)阶段的错误
          // 过滤掉"任务完成"相关的消息，这些不是错误
          const currentStage = currentTask.CurrentStage
          if ((currentStage === 7 || currentStage === 3) &&
            !currentTask.JobErrMsg.includes('任务完成') &&
            !currentTask.JobErrMsg.includes('已完成')) {
            if (!errMsgList.value.some((msg: string) => msg.includes(currentTask.JobErrMsg))) {
              errMsgList.value.push(`【任务出错】${currentTask.JobErrMsg}`)
              // console.log('从任务列表获取到错误信息:', currentTask.JobErrMsg)
            }
            // 保持进度条打开，让用户能看到错误信息
            // 如果有错误，保持当前进度或设置为0；如果没有错误，保持100%
            if (Progress && Total) {
              progressNum.value = Math.ceil((Progress / Total) * 100)
            } else {
              progressNum.value = 0
            }
            if (!loadingState.value) {
              loadingState.value = true
            }
            return
          }
        }

        // 检查 Status、FailCount、Item 和 ExceptionMsg 字段，只显示同步分组和同步商品阶段的错误
        // 如果任务已完成，使用任务列表中的阶段信息；否则使用之前查询的阶段信息
        const taskStage = currentTaskStage !== null ? currentTaskStage : (taskList.length > 0 ? taskList.find((task: any) => task.TaskId === taskId.value)?.CurrentStage : null)

        // 只处理同步商品分组(7)和商品复制任务(3)阶段的错误
        if (taskStage === 7 || taskStage === 3) {
          // 检查 Status 字段，如果有失败状态，也应该显示错误
          if (Status !== undefined && Status !== null) {
            const statusStr = String(Status).toLowerCase()
            if (statusStr.includes('fail') || statusStr.includes('error') || Status === 2 || Status === 3) {
              const errorMsg = `任务状态异常: ${Status}`
              if (!errMsgList.value.some((msg: string) => msg.includes(errorMsg))) {
                errMsgList.value.push(`【任务出错】${errorMsg}`)
              }
              // 保持进度条打开
              progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0
              if (!loadingState.value) {
                loadingState.value = true
              }
              return
            }
          }

          // 检查 FailCount，如果有失败数量，也应该显示
          if (FailCount !== undefined && FailCount !== null && FailCount > 0) {
            const errorMsg = `任务执行失败，失败数量: ${FailCount}`
            if (!errMsgList.value.some((msg: string) => msg.includes(errorMsg))) {
              errMsgList.value.push(`【任务出错】${errorMsg}`)
            }
            // 保持进度条打开
            progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0
            if (!loadingState.value) {
              loadingState.value = true
            }
            return
          }

          // 检查 Item 字段，可能包含错误信息
          if (Item && typeof Item === 'string' && (Item.includes('错误') || Item.includes('失败') || Item.includes('出错'))) {
            if (!errMsgList.value.some((msg: string) => msg.includes(Item))) {
              errMsgList.value.push(`【任务出错】${Item}`)
            }
            // 保持进度条打开
            progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0
            if (!loadingState.value) {
              loadingState.value = true
            }
            return
          }

          // 如果有异常消息（分组创建报错等），显示在进度条上，不关闭进度条
          // 过滤掉"任务完成"相关的消息，这些不是错误
          if (ExceptionMsg && !ExceptionMsg.includes('任务完成') && !ExceptionMsg.includes('已完成')) {
            // 将异常消息添加到错误列表中显示
            if (!errMsgList.value.some((msg: string) => msg.includes(ExceptionMsg))) {
              errMsgList.value.push(`【任务出错】${ExceptionMsg}`)
            }
            // 停止轮询，但保持进度条打开，让用户能看到错误信息
            progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0
            // 确保进度条保持打开
            if (!loadingState.value) {
              loadingState.value = true
            }
            // 添加调试日志
            // console.log('检测到任务错误，ExceptionMsg:', ExceptionMsg)
            // console.log('当前错误列表:', errMsgList.value)
            return
          }
        }
        // 如果任务正常完成，执行必要的操作
        progressNum.value = 100
        loadingState.value = false
        // 等待500ms后检查复制状态或显示成功消息
        setTimeout(() => {
          if (copyState.value === 'once') {
            queryCopyState()
            // 单个复制完成后刷新当前分组商品列表，使 CopyTask 状态得以更新显示
            if (!isErrorListState.value && groupGoodParams.groupid) {
              getGoodForGroupList()
            } else if (isErrorListState.value) {
              getErrorCopyList()
            }
          }
          getDataForTask()
          // this.$message.success('复制成功!');
        }, 600) //3000
        // 再等500ms让上面的任务完成，然后重置加载状态和进度条
        setTimeout(() => {
          copyError() // 如果这里有逻辑需要执行的话
        }, 1000)
      } else {
        // 如果任务未完成，设置一个定时器在800ms后再次尝试
        setTimeout(() => setSyncFoodsProgress(), 3000)
      }
    } else {
      // console.error('Unexpected response code:', res.code)
      // 如果接口返回错误，也显示在进度条上，不关闭进度条
      const errorMsg = res.message || '任务执行失败'
      if (!errMsgList.value.some((msg: string) => msg.includes(errorMsg))) {
        errMsgList.value.push(`【任务出错】${errorMsg}`)
      }
      // 停止轮询，但保持进度条打开
    }
  } catch (error: any) {
    // console.error('Error occurred during polling:', error)
    // 发生错误时，显示在进度条上，不关闭进度条
    const errorMsg = error?.message || '任务执行过程中发生错误'
    if (!errMsgList.value.some((msg: string) => msg.includes(errorMsg))) {
      errMsgList.value.push(`【任务出错】${errorMsg}`)
    }
    // 停止轮询，但保持进度条打开
  }
}
const copyError = () => {
  foodFailCount(taskId.value).then((res: any) => {
    if (res.code === 200) {
      errorFoodCopy.value = res.data
      // 如果有异常商品，只保留异常商品分组为选中，其他正常分组取消选中
      if (res.data > 0) {
        // 先取消所有正常分组的选中状态
        const unselectNormalGroups = (list: any[]) => {
          if (list && list.length > 0) {
            list.forEach((item: any) => {
              // 跳过异常商品分组
              if (item.Group && item.Group.id !== 'error_food_id') {
                item.Group.check = false
              }
              // 递归处理子分组
              if (item.Children && item.Children.length > 0) {
                unselectNormalGroups(item.Children)
              }
            })
          }
        }
        unselectNormalGroups(foodGroups.value)

        // 添加或更新异常商品分组
        if (foodGroups.value && foodGroups.value[0]?.id) {
          // 检查是否已存在异常商品分组
          const hasErrorGroup = foodGroups.value.some((item: any) => item.Group?.id === 'error_food_id')
          if (!hasErrorGroup) {
            foodGroups.value.unshift({
              id: 'error_food_id',
              Group: {
                id: 'error_food_id',
                check: true,
                Name: '复制异常商品',
                FoodCount: res.data
              }
            })
          } else {
            // 更新已存在的异常商品分组
            const errorGroup = foodGroups.value.find((item: any) => item.Group?.id === 'error_food_id')
            if (errorGroup) {
              errorGroup.Group.check = true
              errorGroup.Group.FoodCount = res.data
            }
          }
        } else {
          foodGroups.value[0] = {
            id: 'error_food_id',
            Group: {
              id: 'error_food_id',
              check: true,
              Name: '复制异常商品',
              FoodCount: res.data
            }
          }
        }
        currentGroupIndex.value = 0
      }
    }
  })
}

const copyOnceId = ref('')
const queryCopyState = () => {
  queryFoodTask({
    foodid: copyOnceId.value,
    taskid: taskId.value
  }).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('复制成功!', 'success', 'hey')
    }
  })
}
const copyAllActive = () => {
  ElMessageBox.confirm(
    '请您务必先行核对商品复制流程是否已经顺利完成。若商品复制未完成，折扣信息将无法被正确复制。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      syncActivity({ taskId: taskId.value, actType: 0 }).then((res: any) => {
        if (res.code === 200) {
          gp.$baseMessage('复制成功!', 'success', 'hey')
        }
      })
    })
    .catch(() => { })
}
const changePriceState = ref(false)
const updateAllPrice = () => {
  changePriceState.value = true
}
const stateOptions = ref([
  {
    id: 1,
    value: 1,
    label: '上架中'
  },
  {
    id: 2,
    value: 2,
    label: '下架中'
  }
])
const singleReplication = (row: any) => {
  errMsgList.value = [];

  copyState.value = 'once'
  copyOnceId.value = row.id
  isGetData.value = true
  row.isLoading = true

  // 从 groupForGoodList 中重新获取最新的 row 对象，确保包含用户在界面上修改的价格
  // 因为 v-model 是双向绑定的，groupForGoodList 中的对象应该已经包含了最新的价格
  const latestRow = groupForGoodList.value.find((item: any) => item.id === row.id) || row

  // 直接使用 latestRow 对象，因为它已经包含了用户在界面上修改的价格（通过 v-model 双向绑定）
  // 需要深拷贝确保所有嵌套数据（包括 Specifications 和 Options 中的 Price）都被正确传递
  const rowData = JSON.parse(JSON.stringify(latestRow))

  // 优化：先构建一个价格映射表，避免重复查找
  const priceMap = new Map<string, number>()
  if (rowData.Specifications && rowData.Specifications.length > 0) {
    rowData.Specifications.forEach((spec: any) => {
      if (spec.Options && spec.Options.length > 0) {
        spec.Options.forEach((option: any) => {
          // 将价格转换为数字
          if (option.Price !== null && option.Price !== undefined && option.Price !== '') {
            const price = typeof option.Price === 'string' ? parseFloat(option.Price) : Number(option.Price)
            option.Price = price
            // 建立映射：使用 option.id 和 option.Name 作为 key
            if (option.id) priceMap.set(option.id, price)
            if (option.Name) priceMap.set(option.Name, price)
          }
        })
      }
    })

    // 同步更新 SkuList 中的价格，使用映射表提高性能
    if (rowData.SkuList && rowData.SkuList.length > 0) {
      rowData.SkuList.forEach((sku: any) => {
        let matchedPrice: number | undefined
        // 根据 SkuPath 或 ForSpec 找到对应的规格选项价格
        if (sku.ForSpec && sku.ForSpec.length > 0) {
          // 通过 ForSpec 查找价格
          for (const forSpec of sku.ForSpec) {
            if (forSpec.OptId && priceMap.has(forSpec.OptId)) {
              matchedPrice = priceMap.get(forSpec.OptId)
              break
            }
            if (forSpec.OptionName && priceMap.has(forSpec.OptionName)) {
              matchedPrice = priceMap.get(forSpec.OptionName)
              break
            }
          }
        } else if (sku.SkuPath && priceMap.has(sku.SkuPath)) {
          matchedPrice = priceMap.get(sku.SkuPath)
        }

        if (matchedPrice !== undefined) {
          sku.Price = matchedPrice
        }
      })
    }
  }

  const { id, ...body } = rowData
  const params = Object.assign({}, body, { food_id: id }, { task: taskId.value })

  taskType.value = 3;
  updateFood(params)
    .then((res: any) => {
      if (res.code === 200) {
        // 单个复制时，只复制当前商品所在的分组，而不是所有分组
        // 如果当前在异常商品列表中，不传 groupIds（设置为 null）
        // 否则使用当前选中的分组ID（groupGoodParams.groupid 或 currentGroupId）
        let currentGroupIdForCopy
        if (isErrorListState.value) {
          currentGroupIdForCopy = null
        } else {
          currentGroupIdForCopy = groupGoodParams.groupid || currentGroupId.value
        }
        tryAutoOpenRemoteBrowser().then(() => {
          syncFoods({
            taskId: taskId.value,
            foodIds: [row.id],
            groupIds: currentGroupIdForCopy ? [currentGroupIdForCopy] : null,
            DotCheck: true,
            indexSet: true,
            CopyConf: { ...copyConf.value, OtherConf: JSON.stringify(otherConf.value) },
            SyncOnSale: true
          }).then((res: any) => {
            if (res.code === 200) {
              loadingState.value = true
              setSyncFoodsProgress()
            }
          })
        })
      }
    })
    .catch((error: any) => {
      console.error('updateFood 错误:', error)
    })
    .finally(() => {
      row.isLoading = false
    })
}

// 团购商品单个复制：已由 GrouponFoodManager 保存，直接 syncFoods 跳过 updateFood
const handleGrouponSingleCopy = async (foodId: string) => {
  if (!foodId) return
  copyState.value = 'once'
  copyOnceId.value = foodId
  isGetData.value = true
  loadingState.value = true
  progressNum.value = 0
  errMsgList.value = []
  taskType.value = 3
  await tryAutoOpenRemoteBrowser()
  syncFoods({
    taskId: taskId.value,
    foodIds: [foodId],
    groupIds: null,
    DotCheck: true,
    indexSet: true,
    CopyConf: { ...copyConf.value, OtherConf: JSON.stringify(otherConf.value) },
    SyncOnSale: true,
  }).then((res: any) => {
    if (res.code === 200) {
      setSyncFoodsProgress()
    }
  })
}

const replaceStr = ref('')
const delSpec = (item: any, farr: any, arr: any, index: any, _index: any) => {
  if (farr.length === 1 && arr.length === 1 && farr[0].Name === '份量') {
    return gp.$baseMessage('至少保留一个份量选项', 'error', 'hey')
  }
  item.isUpdate = true
  arr.splice(_index, 1)
  if (arr.length === 0) {
    farr.splice(index, 1)
  }
}
// 处理价格变化，将修改后的商品保存到全局Map中
const handlePriceChange = (item: any) => {
  if (item && item.id) {
    // 深拷贝商品数据并保存到Map中
    modifiedFoodsMap.value.set(item.id, JSON.parse(JSON.stringify(item)))
  }
}

const confirmUpdate = (row: any) => {
  const { id, ...body } = row
  const params = Object.assign({}, body, { food_id: id }, { task: taskId.value })
  updateFood(params).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('修改成功!', 'success', 'hey')
      // 更新后，从Map中移除该商品（因为已经保存到数据库了）
      if (row.id) {
        modifiedFoodsMap.value.delete(row.id)
      }
      getGoodForGroupList()
    }
  })
}
const changeImgState = ref(false)
const downImg = (url: any) => {
  if (/^\/\//.test(url)) {
    url = `https:${url}`
  }
  url = handleSizeImg(url)
  if (url) {
    globalThis.electron.downImage(url)
  } else {
    gp.$baseMessage('未获取到图片!', 'error', 'hey')
  }
}
const handleSizeImg = (filename: any) => {
  // 首先移除最后一个 '?' 及其后面的内容（如果存在）
  let cleaned = filename
  const lastQuestionIndex = filename.lastIndexOf('?')
  if (lastQuestionIndex !== -1) {
    cleaned = filename.substring(0, lastQuestionIndex)
  }
  // 然后移除最后一个 '@' 及其后面的内容（如果存在）
  const lastAtIndex = cleaned.lastIndexOf('@')
  if (lastAtIndex !== -1) {
    cleaned = cleaned.substring(0, lastAtIndex)
  }
  return cleaned
}
const warningTipClose = () => {
  clearCountDownInterval()
  countDown.value = 5
  warningTipState.value = false
}
const clearCountDownInterval = () => {
  if (countDownInterval.value) {
    clearInterval(countDownInterval.value)
  }
  countDownInterval.value = null
}
const pageLoading = ref(false)
const confirmShopUpdate = () => {
  pageLoading.value = true
  warningTipClose()
  if (errorConfirmType.value === 'clearShop') {
    resetNewShop(taskId.value)
      .then(res => {
        if (res.code === 200) {
          gp.$baseMessage('清空成功!', 'success', 'hey')
        }
      })
      .finally(() => {
        pageLoading.value = false
      })
  } else if (errorConfirmType.value === 'updateOldShop') {
    taskType.value = 1;
    startTask({ taskid: taskId.value, tasktype: 1 }).then(res => {
      if (res.code === 200) {
        loadingState.value = true
        isGetData.value = true
        queryTaskProgress({ taskid: taskId.value, tasktype: 1 }, true, 'shop')
      }
    }).finally(() => {
      pageLoading.value = false
    })
  } else if (errorConfirmType.value === 'updateNewShop') {
    taskType.value = 2;
    startTask({ taskid: taskId.value, tasktype: 2 }).then(res => {
      if (res.code === 200) {
        loadingState.value = true
        isGetData.value = true
        queryTaskProgress({ taskid: taskId.value, tasktype: 2 }, false, 'shop')
      }
    }).finally(() => {
      pageLoading.value = false
    })
  }
}

/**
 * 拉取老店活动列表
 * 调用后端接口拉取活动数据，并显示进度条
 */
const pullActivityList = async () => {
  if (!taskId.value) {
    gp.$baseMessage('请先获取数据', 'warning', 'hey')
    return
  }
  loadingState.value = true
  isGetData.value = true
  const progressInfo = await apiManager.foodmoveApi.PullOldShopActivitys(taskId.value)
  queryActivityProgress(progressInfo)
}

/**
 * 查询拉取活动列表的进度
 * @param progressInfo 进度信息对象
 */
const queryActivityProgress = (progressInfo: any) => {
  const { Progress, Total, IsFinished, ErrMsg, ExceptionMsg } = progressInfo
  errMsgList.value = []
  if (ErrMsg && ErrMsg.length) {
    errMsgList.value.push(...ErrMsg)
  }
  progressNum.value = Progress ? Math.ceil((Progress / (Total + 5)) * 100) : 0

  if (IsFinished) {
    progressNum.value = 100
    setTimeout(() => {
      gp.$baseMessage('活动列表拉取完成!', 'success', 'hey')
    }, 500)
    if (ExceptionMsg) {
      ElMessageBox.alert(ExceptionMsg, '任务出错', {
        confirmButtonText: '确认',
        type: "error"
      })
    }
    setTimeout(() => {
      getDataForTask()
      loadingState.value = false
      progressNum.value = 0
    }, 1000)
  } else {
    // 任务未完成，继续轮询
    setTimeout(async () => {
      const newProgressInfo = await apiManager.foodmoveApi.PullOldShopActivitys(taskId.value)
      queryActivityProgress(newProgressInfo)
    }, 2000)
  }
}

// 查询任务进度
// params {taskid: 任务ID, tasktype: 任务类型}
const queryTaskProgress = (params: any, nextUpdateState: Boolean, type: string) => {
  taskProgress(params).then((res: any) => {
    if (res.code === 200) {
      const { Progress, Total, IsFinished, ErrMsg, ExceptionMsg } = res.data
      errMsgList.value = []
      if (ErrMsg && ErrMsg.length) {
        errMsgList.value.push(...ErrMsg)
      }
      progressNum.value = Progress ? Math.ceil((Progress / (Total + 5)) * 100) : 0

      if (IsFinished) {
        progressNum.value = 100
        // 显示成功消息
        setTimeout(() => {
          if (type === 'shop') {
            gp.$baseMessage('数据获取完成!', 'success', 'hey')
          } else if (type === 'active') {
            gp.$baseMessage('复制结束!', 'success', 'hey')
          }
        }, 500)
        if (ExceptionMsg) {
          ElMessageBox.alert(ExceptionMsg, '任务出错', {
            confirmButtonText: '确认',
            type: "error"
          })
        }
        // 等待500ms后执行后续操作
        if (nextUpdateState) {
          setTimeout(() => {
            getDataForTask()
            getFoodMoveShopWithOffId()
            loadingState.value = false
            progressNum.value = 0
          }, 1000)
        }
      } else {
        // 如果任务未完成，设置一个定时器在800ms后再次尝试
        setTimeout(() => queryTaskProgress(params, nextUpdateState, type), 2000)
      }
    }
  })
}

const activeLogState = ref(false)
const activeLogParams = reactive({
  page: 1,
  pagesize: 10,
  taskid: '',
  succeed: false,
  acttype: ''
})
const logClose = () => {
  logState.value = false
  logParams.page = 1
  activeLogState.value = false
  activeLogParams.page = 1
}
const activeLogList = ref([])
const activeLogTotal = ref(0)
const getActiveType = (row: any) => {
  let typeList = [
    '',
    '满减活动',
    '减配送费',
    '折扣活动',
    '门店新客立减',
    '买赠活动',
    '收藏有礼',
    '集点返券',
    '下单返券',
    '店内领券',
    '超值换购'
  ]
  return row ? typeList[row] : ''
}
const currentActive = ref({
  Type: ''
})
const pageTurning = (val: any) => {
  activeLogParams.page = val
  activeLogParams.acttype = currentActive.value.Type
  activeLogParams.taskid = taskId.value
  getActivityTaskLog(activeLogParams).then((res: any) => {
    if (res.code === 200) {
      activeLogList.value = res.data.rows
      activeLogTotal.value = res.data.total
      activeLogState.value = true
    }
  })
}
const priceParams = reactive({
  task: '',
  old_shop: '',
  old_shop_offid: '',
  new_shop: '',
  food_ids: [],
  mark_up: true,
  change_mode: 1,
  value: ''
})
const priceRules = {
  value: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}
const handleInput = (value: any) => {
  priceParams.value = value.replaceAll(/[^0-9.]/g, '').replaceAll(/(\..*)\./g, '$1')
}
const changePriceLoading = ref(false)
const changePriceForm = ref<FormInstance>()
// 改价进度相关状态
const changePriceProgressVisible = ref(false)
const changePriceProgress = ref(0)
const changePriceProgressStatus = ref<'success' | 'exception' | ''>('')
const changePriceProgressInterval = ref<any>(null)
const changePriceCheckCount = ref(0)
const maxChangePriceCheckCount = 60 // 最多检查60次（约2分钟）

const closePriceChange = () => {
  changePriceForm.value?.resetFields()
  changePriceState.value = false
}

// 关闭改价进度对话框
const closeChangePriceProgress = () => {
  changePriceProgressVisible.value = false
  changePriceProgress.value = 0
  changePriceProgressStatus.value = ''
  changePriceCheckCount.value = 0
  totalFoodsToUpdate.value = 0
  if (changePriceProgressInterval.value) {
    clearInterval(changePriceProgressInterval.value)
    changePriceProgressInterval.value = null
  }
}

// 改价开始时间
const changePriceStartTime = ref(0)
// 最小等待时间（秒），确保后端有足够时间开始处理改价
const minChangePriceWaitTime = 3
// 需要改价的商品总数
const totalFoodsToUpdate = ref(0)

// 保存改价时选中的分组，用于改价完成后清空 FoodUpdate
const changedGroupOffids = ref<string[]>([])

const clearFoodUpdateForChangedGroups = async () => {
  if (changedGroupOffids.value.length === 0) {
    return
  }

  // 当前不在前端触发恢复商品任务，改价后仍需要手动点击各分类及分页刷新价格
}

// 计算需要等待的时间（根据商品数量动态计算）
const calculateWaitTime = (foodCount: number): number => {
  // 基础等待时间：3秒
  // 每100个商品增加5秒，最多等待120秒（2分钟）
  const baseTime = 3
  const additionalTime = Math.floor(foodCount / 100) * 5
  return Math.min(baseTime + additionalTime, 120)
}

// 检查改价是否完成
const checkChangePriceComplete = async () => {
  try {
    const elapsedTime = (Date.now() - changePriceStartTime.value) / 1000 // 已等待的秒数

    // 计算需要等待的时间（根据商品数量动态计算）
    const requiredWaitTime = calculateWaitTime(totalFoodsToUpdate.value)

    // 如果还没等待足够的时间，继续等待
    if (elapsedTime < requiredWaitTime) {
      // 更新进度（根据已等待时间），取整
      const progress = Math.min(30 + (elapsedTime / requiredWaitTime) * 60, 90)
      changePriceProgress.value = Math.floor(progress)
      return
    }

    // 等待时间已足够，但需要额外等待一段时间确保数据库真正更新完成
    // 然后再刷新数据，确保 syncFoods 读取的是最新数据
    const additionalWaitTime = Math.max(3, Math.floor(totalFoodsToUpdate.value / 50)) // 每50个商品额外等待1秒，最少3秒

    if (elapsedTime < requiredWaitTime + additionalWaitTime) {
      // 更新进度（根据已等待时间），取整
      const totalWaitTime = requiredWaitTime + additionalWaitTime
      const progress = Math.min(30 + (elapsedTime / totalWaitTime) * 60, 95)
      changePriceProgress.value = Math.floor(progress)
      return
    }

    // 数据库更新应该已经完成，刷新数据
    // 重新获取完整的任务数据
    const res = await getFoodMoveDataForTask(taskId.value)
    if (res.code === 200) {
      // 停止轮询
      if (changePriceProgressInterval.value) {
        clearInterval(changePriceProgressInterval.value)
        changePriceProgressInterval.value = null
      }

      // 改价完成，更新进度和状态
      changePriceProgress.value = 100
      changePriceProgressStatus.value = 'success'

      // 更新本地数据
      activityList.value = res.data.ActivityList
      activityList.value.forEach((item: any) => {
        item.isLoading = false
      })
      activityList.value.sort((a: any, b: any) => {
        if (a.Type === 3) return -1
        if (b.Type === 3) return 1
        return 0
      })
      decorateInfo.value = res.data.DecorateInfo
      foodGroups.value = res.data.FoodGroups
      if (res.data.FoodGroupDataStates) {
        foodGroupDataList.value = res.data.FoodGroupDataStates
      }
      allGoodsCount.value = 0
      if (foodGroups.value && foodGroups.value.length > 0) {
        groupAddCheck(foodGroups.value)
        copyError()
        ensureGrouponVirtualGroup()
        // 刷新当前分组的商品列表，确保界面显示最新数据
        getGroupGoodList(foodGroups.value[currentGroupIndex.value])
      }
      showShopDetailsState.value = true

      // 延迟关闭进度对话框，让用户看到完成状态
      setTimeout(() => {
        closeChangePriceProgress()
        // 使用弹窗提示用户需要刷新价格
        ElMessageBox.alert('需要再点击每个菜单分组及菜单分页刷新价格后再进行复制', '改价完成', {
          confirmButtonText: '我知道了',
          type: 'warning',
          center: true
        })
      }, 1000)

      // 清空 modifiedFoodsMap，因为改价已经完成，数据已从数据库刷新
      modifiedFoodsMap.value.clear()
      // 注意：此处不再触发 recoverFoods，避免与复制前的恢复任务冲突
    }
  } catch (error) {
    console.error('检查改价进度失败:', error)
  }
}

const confirmChangePrice = () => {
  const hasCheckGroup = foodGroups.value.filter((item: any) => item.Group.check === true)
  if (hasCheckGroup.length === 0) {
    return gp.$baseMessage('请选择需要修改的分组!', 'error', 'hey')
  }
  const groupIds: string[] = []
  // 收集选中分组的 office_id（GroupOffids）
  const groupOffids: string[] = []
  hasCheckGroup.forEach((item: any) => {
    groupIds.push(item.Group.id)
    // 获取分组的 office_id，优先使用 Group.OfficeId，如果没有则使用 id
    const officeId = item.Group.OfficeId || item.office_id || item.id
    if (officeId && !groupOffids.includes(officeId)) {
      groupOffids.push(officeId)
    }
    // 如果有子分组，也需要收集子分组的 office_id
    if (item.Children && item.Children.length > 0) {
      item.Children.forEach((child: any) => {
        if (child.Group && child.Group.check) {
          const childOfficeId = child.Group.OfficeId || child.office_id || child.id
          if (childOfficeId && !groupOffids.includes(childOfficeId)) {
            groupOffids.push(childOfficeId)
          }
        }
      })
    }
  })

  changedGroupOffids.value = groupOffids

  changePriceForm.value?.validate(async (valid: any) => {
    if (valid) {
      // 构建完整的改价参数，包含 FoodManageParmsBase 所需的字段
      const updatePriceParams: any = {
        task: taskId.value,
        TaskId: taskId.value, // FoodManageParmsBase 需要
        SyncSite: false, // 此操作只针对数据库，操作完后统一更新到平台
        GroupOffids: groupOffids.length > 0 ? groupOffids : null, // 限制分组，如为空代表所有分组
        old_shop: oldShop.value.id,
        old_shop_offid: oldShop.value.office_id,
        new_shop: shopDataCopy.value.id,
        food_ids: [],
        mark_up: priceParams.mark_up,
        change_mode: priceParams.change_mode,
        value: parseFloat(priceParams.value) || 0
      }

      changePriceLoading.value = true

      // 计算需要改价的商品总数
      totalFoodsToUpdate.value = 0
      hasCheckGroup.forEach((item: any) => {
        totalFoodsToUpdate.value += item.Group.FoodCount || 0
        // 如果有子分组，也累加子分组的商品数
        if (item.Children && item.Children.length > 0) {
          item.Children.forEach((child: any) => {
            if (child.Group && child.Group.check) {
              totalFoodsToUpdate.value += child.Group.FoodCount || 0
            }
          })
        }
      })

      // 显示改价进度对话框
      changePriceProgressVisible.value = true
      changePriceProgress.value = 0
      changePriceProgressStatus.value = ''
      changePriceCheckCount.value = 0

      // 记录改价开始时间
      changePriceStartTime.value = Date.now()

      try {
        await clearFoodUpdateForChangedGroups()
        changePriceProgress.value = 10
        const res = await beachUpdateFoodPrice(updatePriceParams)

        if (res.code === 200) {
          // 改价接口调用成功，改价是异步的，需要等待后端处理完成
          changePriceProgress.value = 30 // 接口调用成功，进度设为30%

          // 开始轮询检查改价是否完成
          changePriceProgressInterval.value = setInterval(() => {
            changePriceCheckCount.value++

            // 检查改价是否完成（会根据商品数量动态计算等待时间）
            checkChangePriceComplete()

            // 如果超过最大检查次数，停止轮询
            if (changePriceCheckCount.value >= maxChangePriceCheckCount) {
              if (changePriceProgressInterval.value) {
                clearInterval(changePriceProgressInterval.value)
                changePriceProgressInterval.value = null
              }
              changePriceProgressStatus.value = 'exception'
              gp.$baseMessage('改价超时，请手动刷新数据检查', 'warning', 'hey')
            }
          }, 2000) // 每2秒检查一次

          closePriceChange()
        } else {
          // 改价接口调用失败
          changePriceProgressStatus.value = 'exception'
          changePriceProgress.value = 0
          const errorMsg = res?.message || res?.msg || '改价失败'
          gp.$baseMessage(errorMsg, 'error', 'hey')
          setTimeout(() => {
            closeChangePriceProgress()
          }, 2000)
        }
      } catch (error: any) {
        console.error('改价失败:', error)
        changePriceProgressStatus.value = 'exception'
        changePriceProgress.value = 0
        const errorMsg = error?.message || error?.msg || '改价失败，请重试'
        gp.$baseMessage(errorMsg, 'error', 'hey')
        setTimeout(() => {
          closeChangePriceProgress()
        }, 2000)
      } finally {
        changePriceLoading.value = false
      }
    }
  })
}
const handleImg = (row: any) => {
  if (row && row.ImgUrl && row.ImgUrl.Img) {
    if (row.ImgUrl.Img.startsWith('//')) {
      return `https:${row.ImgUrl.Img}`
    }
    return row.ImgUrl.Img // 如果不以 // 开头，则返回原字符串
  }
  return ''
}
const openChange = () => {
  changeImgState.value = true
}
const copyActive = (row: any) => {
  errMsgList.value = []
  row.isLoading = true
  if (row.Name === '折扣活动') {
    loadingState.value = true
    isGetData.value = false
    taskType.value = 4;
    startTask({ taskid: taskId.value, tasktype: 4 }).then(res => {
      if (res.code === 200) {
        queryTaskProgress({ taskid: taskId.value, tasktype: 4 }, false, 'active')
      }
    }).finally(() => {
      row.isLoading = false
    })
  } else {
    //其他活动
    syncActivity({ taskId: taskId.value, actType: row.Type })
      .then((res: any) => {
        if (res.code === 200) {
          gp.$baseMessage('复制成功!', 'success', 'hey')
        }
      })
      .finally(() => {
        row.isLoading = false
      })
  }


}
const checkDetails = (row: any) => {
  currentActive.value = row
  activeLogParams.acttype = row.Type
  activeLogParams.taskid = taskId.value
  getActivityTaskLog(activeLogParams).then((res: any) => {
    if (res.code === 200) {
      activeLogList.value = res.data.rows
      activeLogTotal.value = res.data.total
      activeLogState.value = true
    }
  })
}

const openShop = async (shopId: string, id: string) => {
  try {
    pageLoading.value = true
    const rowList: any = await apiManager.fdmvmanagerApi.QueryShops(shopId, ShopType.None, shopDataCopy.value.shop_type)
    const cookies: string = await apiManager.shopmgApi.GetShopCk(id)
    if (rowList.length > 0 && cookies) {
      const row = rowList[0]
      row.cookies = cookies
      openWindow(row)
    } else {
      gp.$baseMessage('未查询到店铺相关信息!', 'error', 'hey')
    }
  } finally {
    pageLoading.value = false
  }
}

const remoteBrowserOpenedForShopId = ref<string | null>(null)
let offRemoteBrowserWindowClosed: (() => void) | null = null
async function tryAutoOpenRemoteBrowser() {
  const id = shopDataCopy.value?.id
  if (!id || remoteBrowserOpenedForShopId.value === id) return
  const electron = (window as any).electron
  if (!electron?.openRemoteBrowser) return
  try {
    const oldId = oldShop.value?.id
    const shopIds = oldId ? [oldId, id] : [id]
    const shops = await apiManager.remoteBrowserApi.GetShopsForRemoteBrowser({ ShopIds: shopIds })
    if (shops.length > 0) {
      remoteBrowserOpenedForShopId.value = id
      electron.openRemoteBrowser({ shopIds: shopIds.join(',') })
    }
  } catch {
    // 平台未实现或接口异常时静默跳过
  }
}

/**
 * 打开创建托管任务弹窗
 */
const openCreateHostedTask = () => {
  if (!oldShop.value.id) {
    gp.$baseMessage('请先选择需要同步的老店', 'warning', 'hey')
    return
  }
  createHostedTaskVisible.value = true
}

/**
 * 处理托管任务创建成功
 * 关闭当前标签页
 */
const handleHostedTaskCreated = async () => {
  // 通过 emit 事件通知父组件关闭当前标签页
  // 父组件会处理关闭逻辑并切换到其他标签页
  emit('removePage')
}

onBeforeUnmount(() => {
  offRemoteBrowserWindowClosed?.()
  if (releaseshow.value && taskId.value) {

  }
})
</script>
<style scoped lang="scss">
.loading-main {
  display: flex;
  align-items: center;
  justify-content: center;
}

.good-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  justify-content: space-between;
}

.good-detail-list {
  width: calc(100% - 260px);
}

.good-detail {
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;

  .detail-left {
    .detail-img {
      width: 78px;
      height: 78px;
      border-radius: 10px;
      overflow: hidden;

      img {
        width: 78px;
        height: 78px;
      }
    }

    .ai-btn {
      margin-top: 12px;
      padding: 0 14px;
      height: 30px;
      line-height: 30px;
      background-color: #f1f4ff;
      font-weight: 400;
      font-size: 12px;
      border-radius: 4px;
    }
  }

  .detail-right {
    width: calc(100% - 78px - 13px);

    .detail-line {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }

    .specs-other {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 20px;
      background: #f7f8fa;
      border-radius: 6px;
      border: 1px solid #ececec;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }
}

.good-list {
  width: 240px;
  background-color: #fff;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 14px;
}

.list-item {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  padding: 10px;
  cursor: pointer;

  ::v-deep .el-checkbox {
    display: flex;
    align-items: flex-start;

    .el-checkbox__input {
      margin-top: 4px;
    }
  }
}

.btn-nav-left {
  display: flex;
}

.btn-nav-main {
  padding: 0 15px;
  background-color: #ffb32b;
  height: 32px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  color: #ffffff;
  justify-content: center;
  margin-right: 10px;
  cursor: pointer;
}

.btn-left-img {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.btn-nav {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-main {


  .active-title {
    font-weight: 500;
    font-size: 16px;
    color: #333333;
    margin-bottom: 14px;
  }


}

.active-copyconf {
  margin-top: 20px;
  display: flex;

  .active-title {
    font-weight: 500;
    font-size: 16px;
    color: #333333;
    margin-bottom: 14px;
  }

  .active-panel {
    border: 1px solid var(--el-border-color);
    margin-right: 10px;
    padding: 10px;
    width: 50%;
  }

  .copyconf-panel {

    width: 50%;
    border: 1px solid var(--el-border-color);
    margin-left: 10px;
    padding: 10px;

    .copyconf-form {
      padding-left: 20px;
      padding-top: 20px;

    }
  }
}

.msg_copyconf {
  margin-left: 10px;
  color: red;
}

.search-top {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;

  .search-left {
    display: flex;
    align-items: flex-start;

    .filter-input {
      width: 240px;
    }

    .state-text {
      margin: 0 10px 0 20px;
      font-size: 12px;
      line-height: 32px;

      .b-text {
        font-size: 14px;
      }
    }
  }

  .report-err {
    position: absolute;
    /* 绝对定位 */
    top: 0;
    /* 距离顶部0 */
    right: 0;
    /* 距离右侧0 */
    padding: 5px 10px;

    color: white;
    border: none;
    cursor: pointer;
  }

}

.grey-btn {
  cursor: pointer;
}

.shop-title-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

.top-right {
  color: #507eff;
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
}

.top-left {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;

  .shop-type-icon {
    width: 20px;
    height: 20px;
  }

  span {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    margin-left: 10px;
  }
}

.shop-select {
  display: flex;
  align-items: center;
  // justify-content: center;
  margin-left: 12px;

  .shop-type-icon {
    width: 20px;
    height: 20px;

  }

  span {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    margin-left: 10px;
  }
}

.shop-img-content {
  display: flex;
  align-items: flex-start;

  .content-img {
    width: 140px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;

    .shop-img {
      width: 140px;
      height: 140px;
      border-radius: 4px;
      background: #5a5e66;
    }
  }

  .content-main {
    margin-left: 15px;

    .shop-name {
      &.blur-text {
        filter: blur(4px) !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }

      font-size: 20px;
      font-weight: bold;
      height: 30px;
    }

    .shop-tips {
      line-height: 20px;
      margin-bottom: 10px;
    }

    .content-img-main {
      display: flex;
      align-items: flex-start;
    }

    .content-img {
      margin-right: 15px;
      width: 210px;

      .shop-img {
        height: 80px;
        width: 210px;
      }
    }
  }
}

.download-btn {
  color: #20a0ff;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #20a0ff;
  display: inline-block;
  margin-top: 10px;
  cursor: pointer;
}

.shop-main {
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
}

.partition {
  margin: 0 10px;
}

.specs-name {
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  line-height: 30px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  padding: 0 15px;
  border-right: none;
}

.specs-item {
  margin-right: 20px;
  display: flex;
  align-items: center;
  position: relative;

  ::v-deep .el-input {
    width: 162px;
  }

  ::v-deep .el-input__inner {
    border-radius: 0;
    width: 140px;
  }

  ::v-deep .el-select {
    .el-input {
      width: 80px;

      .el-input__inner {
        width: 100%;
      }
    }
  }
}

.content-img-1 {
  img {
    width: 100%;
    height: 100%;
  }
}

.group-is-active {
  background-color: rgba(0, 0, 0, 0.1);
}

.filter-main {
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .filter-item {
    display: flex;
    align-items: center;

    .filter-title {
      margin-right: 10px;
    }
  }
}

.position-unit {
  width: 300px;
  position: relative;

  .unit {
    position: absolute;
    top: 50%;
    right: 36px;
    transform: translateY(-50%);
  }
}

.specification-type {
  font-size: 14px;
  margin-bottom: 10px;
  color: #3a8ee6;
}

.litItemInput {}

::v-deep .price-input {
  width: 80px !important;

  .el-input__inner {
    width: 80px !important;
  }
}

.error-text {
  color: #e02020 !important;
}

.copy-state {
  display: flex;
  align-items: center;

  img {
    width: 16px;
    height: 16px;
  }

  span {
    margin-left: 4px;
    font-size: 12px;
    opacity: 0.6;
  }
}

.confirm-update {
  margin-top: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 20px;
  background-color: rgb(252, 248, 227);
  border: 1px solid rgb(250, 235, 205);
  margin-bottom: 10px;

  .confirm-update-tips {
    font-size: 14px;
    margin-bottom: 8px;
    color: rgb(138, 110, 60);

    span {
      font-weight: bold;
    }
  }

  .confirm-update-btn {
    padding: 6px 14px;
    background-color: rgb(135, 184, 127);
    color: #ffffff;
    display: inline-block;
    font-size: 14px;
    cursor: pointer;
  }
}

::v-deep .dialog-model {
  position: absolute !important;
  width: 100%;
  height: 100%;
  margin-top: 20vh;

  .el-overlay-dialog {
    position: absolute;

    .el-dialog {
      margin-top: 0 !important;
    }
  }
}

::v-deep .dialog-center {
  .el-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .el-overlay-dialog {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    padding: 0 !important;

    .el-dialog {
      margin: 0 !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      transform: none !important;
      vertical-align: middle !important;
    }

    .el-dialog__footer {
      .el-button {
        text-align: center !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    }
  }
}

.shop-office-id {
  cursor: pointer;
  color: #00a1ff !important;
}

.scroll-container {
  width: 100%;
  box-sizing: border-box;
  height: 30vh;
  position: relative;
  overflow: auto;
  scroll-behavior: smooth;
}

.shop-info-collapse-header {
  margin-top: 20px;
  padding: 12px 20px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ecf5ff;
  }

  .collapse-header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .collapse-icon {
      font-size: 16px;
      color: #409eff;
      transition: transform 0.3s;
    }

    .collapse-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .collapse-tip {
      font-size: 12px;
      color: #909399;
      margin-left: 8px;
    }
  }
}

.shop-info-collapse-content {
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: #fff;
  padding: 30px;
  box-sizing: border-box;
}

.shop-info-collapsed {
  .shop-info-collapse-header {
    border-radius: 4px;
    border-bottom: 1px solid #dcdfe6;
  }
}

.food-filter-container {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;

  .food-filter-input {
    width: 100%;
  }
}

.view-link {
  color: #409eff;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: underline;

  &:hover {
    color: #66b1ff;
  }
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

// 老店选择框中的文本模糊效果 - 使用更全面的选择器
:deep(.blur-select) {

  // 对整个输入框 wrapper 应用模糊（最直接的方法）
  .el-input__wrapper {
    filter: blur(4px) !important;

    // 但图标和箭头不要模糊
    .el-select__caret,
    .el-input__suffix,
    .el-input__suffix-inner,
    .el-input__suffix-inner>* {
      filter: none !important;
    }
  }

  // 所有可能的文本显示元素
  .el-input__inner,
  .el-select__input,
  .el-select__input-inner,
  .el-select__tags-text,
  .el-select__tags .el-tag,
  .el-select__tags .el-tag__content,
  .el-input__wrapper input,
  .el-input__wrapper .el-select__input {
    filter: blur(4px) !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }

  // 确保选中后显示的文本也被模糊
  .el-select__tags {
    filter: blur(4px) !important;

    .el-select__caret,
    .el-input__suffix {
      filter: none !important;
    }
  }
}
</style>