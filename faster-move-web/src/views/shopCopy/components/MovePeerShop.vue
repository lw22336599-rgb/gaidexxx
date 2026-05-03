<template>
  <div v-loading="pageLoading">
    <div class="shop-main">
      <div class="search-top">
        <div class="search-left">
          <div class="state-text" style="margin-left: 0">商品上传的 <span class="b-text">新店</span></div>
          <div>
            <el-input v-model="shopDataCopy.name" class="filter-input" disabled placeholder="请输入门店ID" />
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
                <img v-if="shopDataCopy.shop_type === 1002" class="shop-type-icon"
                  src="/@/assets/home_images/icon_007.png" />
                <span class="shop-office-id" @click="openShop(shopDataCopy.office_id, shopDataCopy.id)">店铺ID：{{
                  shopDataCopy.office_id }}</span>
                <el-button v-if="taskId" type="primary" @click="updateNewShopData" size="small"
                  style="margin-left: 10px;">更新新店数据</el-button>
              </div>
            </div>
          </div>
          <div class="state-text">需要同步的 <span class="b-text">竞对店铺</span></div>
          <div>
            <el-input v-model="poiInfo.name" class="filter-input" disabled />
            <div>
              <div class="top-left">
                <img v-if="shopType === 1" class="shop-type-icon" src="/@/assets/home_images/icon_001.png" />
                <img v-if="shopType === 2" class="shop-type-icon" src="/@/assets/home_images/icon_002.png" />
                <img v-if="shopType === 3" class="shop-type-icon" src="/@/assets/home_images/icon_003.png" />
                <img v-if="shopType === 4" class="shop-type-icon" src="/@/assets/home_images/icon_004.png" />
                <img v-if="shopType === 5" class="shop-type-icon" src="/@/assets/home_images/icon_005.png" />
                <img v-if="shopType === 6" class="shop-type-icon" src="/@/assets/home_images/icon_006.png" />
                <img v-if="shopType === 7" class="shop-type-icon" src="/@/assets/home_images/icon_007.png" />
                <img v-if="shopType === 1002" class="shop-type-icon" src="/@/assets/home_images/icon_007.png" />
                <span>店铺ID：{{ competitorShopId }}</span>
              </div>
            </div>
          </div>
          <div style="margin-left: 40px">
            <el-button :loading="hasProgress" type="warning" @click="investigation"
              :disabled="fridaWorking || dyTuanGouCollecting || dyTuanGouWinOpen">
              {{ investigationState ? '关闭' : '开始' }}采集
            </el-button>
            <el-button v-if="isGrouponShop" type="success"
              :disabled="!shopDataCopy?.id || investigationState || fridaWorking" @click="openDyTuanGouCapture"
              style="margin-left: 10px">
              抖音团购
            </el-button>
            <el-button v-permissions="['ADMIN']" :type="fridaWorking ? 'danger' : 'success'" @click="toggleFrida"
              :disabled="investigationState || dyTuanGouCollecting" style="margin-left: 10px">
              {{ fridaWorking ? '停止Frida' : '启动Frida注入' }}
            </el-button>
            <el-button type="primary" :loading="exportLoading" :disabled="!taskId" @click="handleExport"
              style="margin-left: 10px">
              导出数据
            </el-button>
            <el-upload :show-file-list="false" :http-request="handleImportUpload"
              :before-upload="(f) => f.name.endsWith('.fdmv') || (gp.$baseMessage('请选择 .fdmv 导出包文件', 'error', 'hey') && false)"
              accept=".fdmv" style="display: inline-block; margin-left: 10px">
              <el-button type="success" :loading="importLoading" :disabled="!shopDataCopy?.id">
                导入数据
              </el-button>
            </el-upload>
            <div class="top-right" @click="openLog">搬菜历史记录 ></div>
          </div>
        </div>
      </div>
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
          <div v-if="shopType === 1" class="shop-container">
            <div class="shop-img-content">
              <div class="content-img">
                <div class="shop-img content-img-1"><img :src="poiInfo.pic_url" /></div>
                <div class="download-btn" @click="downImg(poiInfo.pic_url)">下载logo</div>
              </div>
              <div class="content-main">
                <div class="shop-name">{{ poiInfo.name }}</div>
                <div class="shop-tips" style="height: 20px">{{ poiInfo.bulletin }}</div>
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
                      <el-carousel-item v-for="(item, index) in decorateInfo.Poster" :key="index">
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
          <div v-if="shopType === 2" class="shop-container">
            <div v-if="poiInfo && poiInfo.storeHead" class="shop-img-content">
              <div class="content-img">
                <div class="shop-img content-img-1">
                  <img alt="" :src="handlePicUrl(poiInfo.storeHead.storeInfo.storeLogo)" />
                </div>
                <div class="download-btn" @click="downImg(handlePicUrl(poiInfo.storeHead.storeInfo.storeLogo))">
                  下载logo
                </div>
              </div>
              <div class="content-main">
                <div class="shop-name">{{ poiInfo.storeHead.storeInfo.name }}</div>
                <div class="shop-tips" style="height: 20px"></div>
                <div class="content-img-main">
                  <div class="content-img">
                    <div class="shop-img">
                      <img alt="" :src="handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)"
                        style="width: 100%; height: 100%" />
                    </div>
                    <div class="download-btn"
                      @click="downImg(handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage))">
                      下载店招
                    </div>
                  </div>
                  <div class="content-img">
                    <el-carousel height="80px" indicator-position="none" style="width: 100%">
                      <el-carousel-item v-for="(item, index) in decorateInfo.Poster" :key="index">
                        <img alt="" :src="item.ImgUrl.Img" style="width: 100%; height: 100%" />
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
              <div class="active-title">活动列表</div>
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
                <el-form-item v-if="shopType === 1" label="智能去水印">
                  <el-switch v-model="copyConf.RemoveWaterMark"></el-switch>
                  <span class="msg_copyconf">若美团老店图片右下角有平台水印，可使用AI去水印！</span>

                </el-form-item>


              </el-form>
              <el-form v-if="shopDataCopy.shop_type === 6 || shopType === 6" class="copyconf-form" :model="otherConf"
                label-width="auto">

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
              <div style="font-size: 16px">{{ row.new_name }}</div>
              <div style="font-size: 12px; opacity: 0.8">店铺ID：{{ row.new_offid }}</div>
            </template>
          </el-table-column>
          <el-table-column label="老店名称">
            <template #default="{ row }">
              <div style="font-size: 16px">{{ row.old_name }}</div>
              <div style="font-size: 12px; opacity: 0.8">店铺ID：{{ row.old_offid }}</div>
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
    <div v-if="showShopDetailsState">
      <div class="btn-nav">
        <div class="btn-nav-right">
          <el-button type="danger" @click="openWarningTip">一键清空新店商品</el-button>
          <el-button type="warning" @click="exportErrorFoods">导出异常商品</el-button>
        </div>
        <div class="btn-nav-left">
          <el-tooltip content="全自动后台复制模式，可在托管任务列表查看进度" placement="top">
            <el-button type="primary" @click="openCreateHostedTaskDialog">创建托管任务</el-button>
          </el-tooltip>
          <el-button v-if="shopDataCopy.shop_type !== 6" type="primary" @click="copyShopPoster">
            <img alt="" class="btn-left-img" src="/@/assets/foodMove_images/icon_003.png" />一键复制店招海报
          </el-button>
          <el-button type="primary" @click="copyGoods"><img alt="" class="btn-left-img"
              src="/@/assets/foodMove_images/icon_002.png" />一键复制商品</el-button>
          <el-button type="primary" @click="copyAllActive"><img alt="" class="btn-left-img"
              src="/@/assets/foodMove_images/icon_004.png" />一键复制活动</el-button>
          <el-button type="primary" @click="updateAllPrice"><img alt="" class="btn-left-img"
              src="/@/assets/foodMove_images/icon_001.png" />一键修改商品价格</el-button>
        </div>
      </div>
      <div class="table-main">
        <div class="active-title">商品列表</div>
        <div class="good-container">
          <div class="good-list">
            <div style="height: 40px; opacity: 0.6">商品总数（{{ realFoodCount }}/{{ allGoodsCount }}）</div>
            <!-- 全选/取消全选按钮，仅在存在"复制异常商品"时显示 -->
            <div style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
              <el-button size="small" type="primary" @click="selectAllGroups">全选</el-button>
              <el-button size="small" @click="unselectAllGroups">取消全选</el-button>
            </div>
            <group-menu :current-group-id="currentGroupId" :food-groups="allFoodGroups"
              :food-group-data-list="foodGroupDataList" @item-click="getGroupGoodList"
              @checkbox-change="handleGroupCheckboxChange" />
          </div>
          <div class="good-detail-list" v-loading="goodsLoading">
            <!-- 团购商品管理组件 -->
            <groupon-food-manager ref="grouponManagerRef" v-if="isGrouponState" :task-id="taskId || ''"
              :food-groups="foodGroups" :real-groupon-group="realGrouponGroup" :is-groupon-group="isGrouponGroup"
              :food-group-data-states="foodGroupDataStates" @groupon-single-copy="handleGrouponSingleCopy" />
            <template v-else>
              <div class="food-filter-container">
                <el-input v-model="foodNameFilter" class="food-filter-input" placeholder="过滤商品名称" clearable
                  @clear="handleFoodNameFilterClear" @input="handleFoodNameFilter">
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <div v-for="(item, index) in groupForGoodList" :key="item.index" class="good-detail">
                <!--              <div>-->
                <!--                <el-checkbox v-model="item.check"></el-checkbox>-->
                <!--              </div>-->
                <div class="good-detail-item">
                  <div class="detail-left">
                    <div class="detail-img">
                      <img v-if="item.ImageUrls && item.ImageUrls[0] && item.ImageUrls[0].Img" alt=""
                        :src="item.ImageUrls[0].Img" />
                    </div>
                    <div class="ai-btn">AI去水印</div>
                    <div class="ai-btn">AI美化</div>
                  </div>
                  <div class="detail-right">
                    <el-popover :content="item.err_msg ? item.err_msg : item.err_msg2" placement="bottom-start"
                      title="温馨提示" trigger="hover" :width="600">
                      <template #reference>
                        <el-tag v-if="item.err_msg" :disable-transitions="true"
                          style="margin-bottom: 10px; max-width: 100%; overflow: hidden" type="danger">{{ item.err_msg
                          }}</el-tag>
                        <el-tag v-if="item.err_msg2" :disable-transitions="true" style="margin-bottom: 10px"
                          type="warning">{{ item.err_msg2 }}</el-tag>
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
                          type="primary" @click="singleReplication(item)">单个复制</el-button>
                      </div>
                    </div>
                    <div class="detail-line">
                      <el-input v-model="item.Description" style="width: calc(100% - 230px)" />
                      <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">最小购买数</div>
                      <el-input v-model="item.MinBuyCount" disabled style="width: 120px" />
                    </div>
                    <div v-for="(_item, _index) in item.Specifications" :key="_index" class="detail-line specs-other">
                      <div class="specification-type">
                        <!--                      <div v-if="shopType === 2">-->
                        <!--                        <el-tag type="info" v-if="_item.SpecType === 1">规格</el-tag>-->
                        <!--                        <el-tag v-if="_item.SpecType === 2">属性</el-tag>-->
                        <!--                        <el-tag type="warning" v-if="_item.SpecType === 3">小料</el-tag>-->
                        <!--                      </div>-->
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
                            <el-input v-model="__item.Name" /><el-input v-model="__item.Price" class="price-input" />
                          </div>
                        </div>
                      </template>
                    </div>
                    <div v-if="item.isUpdate" class="confirm-update">
                      <div class="confirm-update-tips">
                        <span>注意：</span>您操作了商品数据的编辑，如果商品数据已经确认无误，请点击修改按钮，然后再执行搬菜操作，否则搬菜后新数据不会生效!
                      </div>
                      <div class="confirm-update-btn" @click="confirmUpdate(item)">确认修改商品数据</div>
                    </div>
                    <div v-if="item.CopyTask && item.CopyTask.try_count" class="copy-state">
                      <img alt="" :src="item.CopyTask.succeed ? sussIcon : errorIcon" />
                      <span>{{ item.CopyTask.succeed ? '复制成功' : '复制失败' }}</span>
                    </div>
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
      <div style="width: 100%; overflow-x: auto; display: flex; align-items: center">
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
    <el-dialog v-model="warningTipState" :close-on-click-modal="false" :modal="false" modal-class="dialog-center"
      title="提示" width="30%" center>
      <span>{{ errorConfirmText }}</span>
      <template #footer>
        <span class="dialog-footer" style="display: flex; align-items: center; justify-content: center">
          <el-button @click="warningTipClose">取 消</el-button>
          <el-button :disabled="!(countDown === 0)" type="primary" @click="confirmShopUpdate">
            <span v-if="countDown">{{ countDown }}</span> 确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <CreateHostedTask v-model="showCreateHostedTaskDialog" :shop-data="shopDataCopy" :old-shop="null" :task-id="taskId"
      :competitor-shop-id="competitorShopId" :competitor-shop-type="shopType" :task-type="CreateTaskTypeEnum.Competitor"
      @created="handleHostedTaskCreated" />

    <!-- 京东后台示例图片弹窗 -->
    <el-dialog v-model="jdImageDialogVisible" :title="jdImageDialogTitle" width="600px" :close-on-click-modal="true">
      <div style="text-align: center;">
        <img :src="jdImageUrl" style="max-width: 100%; max-height: 600px;" alt="京东后台示例图" />
      </div>
    </el-dialog>

    <!-- Frida 配置对话框 -->
    <el-dialog v-model="fridaDialogVisible" title="Frida 注入配置" width="500px">
      <el-form :model="fridaConfig" label-width="100px">
        <el-form-item label="设备IP">
          <el-input v-model="fridaConfig.host" :disabled="fridaInjectLoading" placeholder="例如: 192.168.1.100" />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            iOS 设备的局域网 IP 地址
          </div>
        </el-form-item>
        <el-form-item label="Frida端口">
          <el-input v-model="fridaConfig.port" :disabled="fridaInjectLoading" placeholder="默认: 12345" />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            frida-server 监听的端口，默认为 12345
          </div>
        </el-form-item>
        <el-form-item label="说明">
          <div style="color: #606266; font-size: 14px; line-height: 1.6;">
            <p style="margin: 5px 0;">1. 设备需要越狱并已安装 frida-server</p>
            <p style="margin: 5px 0;">2. <strong>开始注入</strong>: 直接注入到运行中的应用（如应用未运行会提示打开）</p>
            <p style="margin: 5px 0;">3. <strong>重启应用并注入</strong>: 先终止应用进程，然后重新打开并注入（适用于需要清理状态的场景）</p>
            <p style="margin: 5px 0;">4. 注入成功后会自动监控【美团外卖】的网络请求</p>
          </div>
        </el-form-item>
        <el-form-item>
          <el-alert title="电脑端需要安装 Python 和 frida-tools" type="warning" :closable="false" style="margin-top: 10px;">
            <template #default>
              <div style="font-size: 13px; line-height: 1.5;">
                <p style="margin: 0 0 5px 0;">如果提示 <code
                    style="background: #f5f5f5; padding: 2px 5px; border-radius: 3px;">spawn frida-ps ENOENT</code> 错误：
                </p>
                <p style="margin: 0;">请查看项目根目录下的 <strong>FRIDA_INSTALL_GUIDE.md</strong> 文件，按照说明安装 Python 和 frida-tools
                </p>
              </div>
            </template>
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="fridaInjectLoading" @click="fridaDialogVisible = false">取消</el-button>
          <el-button type="danger" :disabled="fridaInjectLoading" @click="stopFrida">停止Frida</el-button>
          <el-button type="warning" :loading="fridaInjectLoading" :disabled="fridaInjectLoading"
            @click="startFridaInjectWithRestart">重启应用并注入</el-button>
          <el-button type="primary" :loading="fridaInjectLoading" :disabled="fridaInjectLoading"
            @click="startFridaInject">开始注入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 抖音团购 店铺分享链接弹窗 -->
    <el-dialog v-model="dyTuanGouShareDialogVisible" title="抖音团购 - 请输入店铺分享链接" width="500px" append-to-body>
      <div class="dy-tuangou-share-tip">
        <p style="margin-bottom: 12px; color: #909399;">获取方式：进入门店首页 → 右上角点击分享(注意:不是详情页,如在详情页请点击门店进入门店首页再分享)<span
            style="margin: 0 4px;">↗</span>复制链接</p>
        <el-input v-model="dyTuanGouShareLink" type="textarea" :rows="4"
          placeholder="可粘贴完整分享文案，如：八号院坝老火锅(东光小区店)，人均 ¥72... https://v.douyin.com/xxx/ 或直接粘贴链接" />
        <div style="margin-top: 12px;">
          <el-button type="warning" plain size="small" @click="clearDyTuanGouLogin">清空上次登陆信息</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="dyTuanGouShareDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDyTuanGouShare">打开采集</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import GroupMenu from '/@/views/shopCopy/components/GroupMenu.vue'
import GrouponFoodManager from '/@/views/shopCopy/components/GrouponFoodManager.vue'
import { gp } from '/@vab/plugins/vab.ts'
import {
  beachUpdateFoodPrice,
  beginData,
  createTask,
  foodFailCount,
  getActivityTaskLog,
  getFoodMoveDataForTask,
  getTaskQuery,
  parseWxData,
  queryFoodTask,
  resetNewShop,
  resetOldShopData,
  syncActivity,
  syncDecorate,
  syncFoods,
  syncFoodsProgress,
  updateFood,

  startTask,
  taskProgress,
  stopTask
} from '/@/api/foodMove.ts'
import { ElMessage, ElMessageBox, ElNotification, type FormInstance } from 'element-plus'
import { UnitType } from '/@/utils/unitType'
import sussIcon from '/@/assets/shop_images/suss.png'
import errorIcon from '/@/assets/shop_images/error.png'
import jdOldImage from '/@/icon/jdupload/old.png'
import jdNewImage from '/@/icon/jdupload/new.png'
import { Delete, Warning, Search, ArrowUp, ArrowDown, QuestionFilled } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import { openWindow } from '@/utils/openShopWin.ts'
import { CreateTaskTypeEnum } from '~/src/types/foodMove'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { FoodMoveTaskApi } from '/@/TsModel/Api/Alien/Faster/Controllers/FoodMove/FoodMoveTaskApi'
import { TaskListSortType } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/TaskListSortType'
import CreateHostedTask from '/@/views/shopCopy/components/CreateHostedTask.vue'
import ExcelJS from 'exceljs'
import { exportTaskFoodData, importTaskFoodData } from '/@/api/foodMoveExportImport'

const props = defineProps({
  shopData: Object,
  taskId: String,
  oldShop: Object,
  navItemId: String
})
const scrollContainer = ref(null); // 滚动容器的 ref
const taskType = ref(0);
// 新店数据副本，存储从props接收的shopData数据
const shopDataCopy = ref<any>({})
shopDataCopy.value = JSON.parse(JSON.stringify(props.shopData))

watch(() => props.shopData, (newVal) => {
  if (newVal) shopDataCopy.value = JSON.parse(JSON.stringify(newVal))
}, { immediate: true, deep: true })

// 监听 shopDataCopy 变化，向父组件注册 shopIds（用于复制页关闭时关闭远程浏览器关联店铺）
watch(shopDataCopy, () => {
  const id = shopDataCopy.value?.id
  if (id) emit('registerShopIds', { shopIds: [id] })
}, { immediate: true, deep: true })

// ==================== Frida 相关状态 开始 ====================
// Frida 工作状态，控制按钮显示和行为
const fridaWorking = ref(false)

// Frida 注入执行中状态，用于禁用按钮防止重复点击
const fridaInjectLoading = ref(false)

// Frida 配置对话框显示状态
const fridaDialogVisible = ref(false)

// Frida 配置
const fridaConfig = ref({
  host: '',
  port: '12345'
})

// 导出/导入状态
const exportLoading = ref(false)
const importLoading = ref(false)

// Frida 日志
const fridaLogs = ref<string[]>([])

// 从 localStorage 加载上次的配置
onMounted(() => {
  const savedConfig = localStorage.getItem('fridaConfig')
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig)
      fridaConfig.value = config
    } catch (e) {
      console.error('加载 Frida 配置失败:', e)
    }
  }

  // 监听 Frida 日志
  if (window.electron && window.electron.onFridaLog) {
    window.electron.onFridaLog((data: any) => {
      fridaLogs.value.push(data.message)
      console.log('[Frida]', data.message)
    })
  }
})

// 切换 Frida 状态（启动或停止）
const toggleFrida = () => {
  if (fridaWorking.value) {
    // 如果正在运行，则停止
    stopFrida()
  } else {
    // 如果未运行，则显示配置对话框
    showFridaDialog()
  }
}

// 显示 Frida 配置对话框
const showFridaDialog = () => {
  fridaDialogVisible.value = true
}

// 启动 Frida 注入
const startFridaInject = async () => {
  if (!fridaConfig.value.host) {
    gp.$baseMessage('请输入设备IP地址', 'error', 'hey')
    return
  }

  if (!fridaConfig.value.port) {
    gp.$baseMessage('请输入Frida端口', 'error', 'hey')
    return
  }

  try {
    // 开始注入，禁用所有按钮
    fridaInjectLoading.value = true

    // 保存配置到 localStorage
    localStorage.setItem('fridaConfig', JSON.stringify(fridaConfig.value))

    // 调用 Electron API 启动注入
    const result = await window.electron.fridaInject({
      host: fridaConfig.value.host,
      port: fridaConfig.value.port
    })

    if (result.success) {
      fridaWorking.value = true
      gp.$baseMessage('Frida 注入启动成功', 'success', 'hey')
      fridaDialogVisible.value = false
    } else {
      gp.$baseMessage(`Frida 注入失败: ${result.error}`, 'error', 'hey')
    }
  } catch (error: any) {
    console.error('启动 Frida 注入失败:', error)
    gp.$baseMessage(`启动失败: ${error.message}`, 'error', 'hey')
  } finally {
    // 注入完成，恢复按钮状态
    fridaInjectLoading.value = false
  }
}

// 重启应用并注入
const startFridaInjectWithRestart = async () => {
  if (!fridaConfig.value.host) {
    gp.$baseMessage('请输入设备IP地址', 'error', 'hey')
    return
  }

  if (!fridaConfig.value.port) {
    gp.$baseMessage('请输入Frida端口', 'error', 'hey')
    return
  }

  try {
    // 开始注入，禁用所有按钮
    fridaInjectLoading.value = true

    // 保存配置到 localStorage
    localStorage.setItem('fridaConfig', JSON.stringify(fridaConfig.value))

    // 调用 Electron API 重启应用并注入
    const result = await window.electron.fridaInjectWithRestart({
      host: fridaConfig.value.host,
      port: fridaConfig.value.port
    })

    if (result.success) {
      fridaWorking.value = true
      gp.$baseMessage('Frida 重启并注入启动成功', 'success', 'hey')
      fridaDialogVisible.value = false
    } else {
      gp.$baseMessage(`Frida 重启并注入失败: ${result.error}`, 'error', 'hey')
    }
  } catch (error: any) {
    console.error('重启应用并注入失败:', error)
    gp.$baseMessage(`启动失败: ${error.message}`, 'error', 'hey')
  } finally {
    // 注入完成，恢复按钮状态
    fridaInjectLoading.value = false
  }
}

// 停止 Frida
const stopFrida = async () => {
  // 防止重复停止
  if (!fridaWorking.value) return

  try {
    const result = await window.electron.fridaStop()
    if (result.success) {
      fridaWorking.value = false
      gp.$baseMessage('Frida 已停止', 'success', 'hey')
    }
  } catch (error: any) {
    console.error('停止 Frida 失败:', error)
    gp.$baseMessage(`停止失败: ${error.message}`, 'error', 'hey')
  }
}
// ==================== Frida 相关状态 结束 ====================

// 导出竞对商品数据
const handleExport = async () => {
  const tid = taskId.value
  if (!tid) {
    gp.$baseMessage('请先获取任务后再导出', 'error', 'hey')
    return
  }
  exportLoading.value = true
  try {
    const shopTypeName = getShopTypeName(shopType.value)
    const shopName = poiInfo.value?.name ?? ''
    const filename = await exportTaskFoodData(tid, { shopTypeName, shopName })
    gp.$baseMessage(`导出成功：${filename}`, 'success', 'hey')
  } catch (e: any) {
    gp.$baseMessage(e?.message || e?.msg || '导出失败', 'error', 'hey')
  } finally {
    exportLoading.value = false
  }
}

// 导入 .fdmv 包到当前新店
const handleImportUpload = async (options: { file: File }) => {
  const newShopId = shopDataCopy.value?.id
  if (!newShopId) {
    gp.$baseMessage('新店信息不存在，无法导入', 'error', 'hey')
    return
  }
  try {
    await ElMessageBox.confirm(
      '导入会重置任务数据，之前的商品数据将被清空，是否确认操作？',
      '导入确认',
      { type: 'warning' }
    )
  } catch {
    return
  }
  importLoading.value = true
  try {
    const res = await importTaskFoodData(newShopId, options.file)
    gp.$baseMessage(
      `导入成功：分组 ${res.groupCount}，商品 ${res.foodCount}，活动 ${res.activityCount}，装修 ${res.decorationCount}`,
      'success',
      'hey'
    )
    taskId.value = res.taskId
    emit('gettaskId', res.taskId)
    loadingState.value = true
    isGetData.value = true
    await getMoveDataForTask()
  } catch (e: any) {
    gp.$baseMessage(e?.message || e?.msg || '导入失败', 'error', 'hey')
  } finally {
    importLoading.value = false
    loadingState.value = false
  }
}

// 是否处于采集状态标志，控制采集按钮的状态和显示
const investigationState = ref(false)

// 是否有任务正在进行中的标志，用于控制按钮loading状态
const hasProgress = ref(false)

// 当前搬菜任务的ID，用于API调用和资源追踪
const taskId = ref(props.taskId || '')

const investigation = () => {

  beginState.value = false;
  // 初始化服务

  if (investigationState.value) {
    closeInvestigation()
  } else {
    openInvestigation()
  }
}
const copyConf = ref<{ SyncStock: boolean, SyncOnSale: boolean, CategoryUseRecomend: boolean, attr_recomend: boolean, attr_recomend_s: number, RemoveWaterMark: boolean, OtherConf: string }>({
  SyncStock: true,// 同步库存,如果为false 新店数据库存全部为99999 - 默认开启
  SyncOnSale: true,//同步老店的上下架状态 如果为false 哪到到新店的商品将全部为上架状态
  CategoryUseRecomend: true,//商品类目用推荐模式 - 默认开启
  attr_recomend: true,//ai属性推荐
  attr_recomend_s: 60,//ai 属性推荐最小相似度% 默认60
  RemoveWaterMark: true,//是否智能去水印
  OtherConf: ""
})
const otherConf = ref<{ use_excel: boolean, use_newjd: boolean }>({
  use_excel: false,
  use_newjd: false
})
// 是否有活跃的搬菜任务连接，用于资源管理和组件卸载时的清理
const releaseshow = ref(false)
// 是否已发送创建客户端请求的标志，防止重复请求
const sendone = ref(false)
const emit = defineEmits(['gettaskId', 'setreleaseshow', 'removePage', 'registerShopIds'])

const showCreateHostedTaskDialog = ref(false)

/**
 * 打开创建托管任务对话框
 */
const openCreateHostedTaskDialog = () => {
  showCreateHostedTaskDialog.value = true
}

/**
 * 托管任务创建成功后关闭当前标签页
 */
const handleHostedTaskCreated = async () => {
  // 通过 emit 事件通知父组件关闭当前标签页
  // 父组件会处理关闭逻辑并切换到其他标签页
  emit('removePage')
}
const createclient1 = () => {
  if (releaseshow.value) {
    emit('removePage')
    releaseshow.value = false
  }
  if (!shopDataCopy.value || !shopDataCopy.value.id) {
    return
  }
  const baseUrl = JSON.parse(localStorage.getItem('baseUrl') as string)
  const clientParams: any = {
    NewShop: shopDataCopy.value.id,
    OldShop: null,
    OldShopOffid: getPlatformPrefix(shopType.value) + competitorShopId.value,
    OldShopType: shopType.value,
    MaxThreads: 50,
    KeepNewShops: true,
    SyncStock: true,
    SyncActivitys: true,
    SyncOnSale: true,
    TaskType: CreateTaskTypeEnum.Competitor,
    ResetNewShop: false,
    SyncDecoration: false,
    CategoryUseRecomend: false,
    RemoveWaterMark: false
  }
  apiManager.fdmvmanagerApi.CreateClient(clientParams).then(async (serverUrl: string) => {
    // 接口现在只用于检查权限，不再创建服务器
    // 调用成功后直接使用默认线路，不再使用接口返回的值作为线路
    // 确保使用默认线路（move 为空时使用默认 baseURL）

    try {
      emit('setreleaseshow', true)

      await createFoodMoveTask()
    } catch { } finally {
      releaseshow.value = false
    }
  })
}

/** 同步创建任务，返回 Promise，确保 taskId 就绪后再继续。无防抖，直接执行。可用于抖音团购及其他需在任务创建完成后再继续上传的店铺类型。 */
const createClientSync = async (): Promise<void> => {
  if (releaseshow.value) {
    emit('removePage')
    releaseshow.value = false
  }
  if (!shopDataCopy.value || !shopDataCopy.value.id) return
  const clientParams: any = {
    NewShop: shopDataCopy.value.id,
    OldShop: null,
    OldShopOffid: getPlatformPrefix(shopType.value) + competitorShopId.value,
    OldShopType: shopType.value,
    MaxThreads: 50,
    KeepNewShops: true,
    SyncStock: true,
    SyncActivitys: true,
    SyncOnSale: true,
    TaskType: CreateTaskTypeEnum.Competitor,
    ResetNewShop: false,
    SyncDecoration: false,
    CategoryUseRecomend: false,
    RemoveWaterMark: false
  }
  await apiManager.fdmvmanagerApi.CreateClient(clientParams)
  emit('setreleaseshow', true)
  try {
    await createFoodMoveTask()
  } finally {
    releaseshow.value = false
  }
}

// 开始采集
const openInvestigation = () => {
  beginState.value = false;
  investigationState.value = true
  globalThis.electron.startProxy()
  gp.$baseMessage('开启成功!', 'success', 'hey')
}

const dyTuanGouShareDialogVisible = ref(false)
const dyTuanGouShareLink = ref('')
const dyTuanGouFetchProgress = ref<{ current: number; total: number; done?: boolean } | null>(null)
const dyTuanGouCollecting = ref(false)
const dyTuanGouWinOpen = ref(false)

// 打开抖音团购抓包窗口（仅团购店铺显示）- 先弹窗输入分享链接
// 抖音团购无需先有 taskId，抓包到数据后会由 createclient1 自动创建任务
const openDyTuanGouCapture = () => {
  if (!shopDataCopy.value?.id) return
  dyTuanGouShareLink.value = ''
  dyTuanGouShareDialogVisible.value = true
}

const clearDyTuanGouLogin = async () => {
  try {
    await globalThis.electron.dyTuanGouClearLogin()
    gp.$baseMessage('已清空上次登陆信息', 'success', 'hey')
  } catch (e) {
    gp.$baseMessage('清空失败', 'error', 'hey')
  }
}

const confirmDyTuanGouShare = () => {
  if (!shopDataCopy.value?.id) return
  const input = dyTuanGouShareLink.value?.trim() || ''
  const urlMatch = input.match(/https?:\/\/v\.douyin\.com\/[^\s]+/)
  const loadUrl = urlMatch ? urlMatch[0].replace(/[)\]\s]+$/, '') : 'https://v.douyin.com/'
  dyTuanGouShareDialogVisible.value = false
  // 无 taskId 时用占位符，抓包到数据后会自动创建任务并得到真实 taskId
  const effectiveTaskId = taskId.value || `pending_${shopDataCopy.value.id}`
  globalThis.electron.ipcRenderer.invoke('open-dy-tuangou-capture', {
    taskId: effectiveTaskId,
    newShopId: shopDataCopy.value.id,
    shareUrl: loadUrl
  })
}

// 关闭采集
const closeInvestigation = () => {
  // 防止重复关闭
  if (!investigationState.value) return

  //emit('removePage')
  investigationState.value = false
  globalThis.electron.stopProxy()
  gp.$baseMessage('关闭成功!', 'success', 'hey')
}

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

const currentGroupId = ref('') // 当前选中的分组ID
const competitorShopId = ref('') // 竞对店铺的ID，用于标识数据来源
const errorFoodCopy = ref(0) // 异常商品数量
const errorFoodGroupChecked = ref(true) // "复制异常商品"的选中状态
const foodGroups = ref<any>([]) // 食品分组列表，存储所有商品分类
const groupForGoodList = ref<any>([]) // 当前分组中的商品列表，展示在右侧详情区域
const allReceiveLitData = ref<any>([]) // 存储额外的数据包，如商品详情等
const currentGroupIndex = ref(0) // 当前选中的商品分组索引
// 存储所有已修改的商品（key: foodId, value: 商品数据），用于批量复制时更新所有分类的商品价格
const modifiedFoodsMap = ref<Map<string, any>>(new Map())
const shopType = ref(0) // 店铺类型：1-美团，2-饿了么

// 店铺信息缓存类型定义
interface PoiCacheInfo {
  poi_id_str: string
  poi_name: string
  poi_pic: string
}

// 店铺信息缓存 Map，最多存储200条，key为店铺ID，value为店铺信息
const poiInfoCache = ref<Map<string, PoiCacheInfo>>(new Map())
/**
 * 根据店铺类型获取平台前缀
 * @param type 店铺类型
 * @returns 平台前缀字符串
 */
const getPlatformPrefix = (type: number): string => {
  switch (type) {
    case ShopType.美团: // 1
      return 'mt'
    case ShopType.饿了么: // 2
      return 'elm'
    case ShopType.美团闪购: // 3
      return 'mtsg'
    case ShopType.美团医药: // 4
      return 'mtyy'
    case ShopType.饿百零售: // 5
      return 'elmls'
    case ShopType.京东到家: // 6
      return 'jd'
    case ShopType.抖店即时零售: // 7
      return 'dy'
    case ShopType.饿了么官方: // 8
      return 'elm2'
    case 1002: // 抖音团购
      return 'dytg'
    default:
      return ''
  }
}

/** 根据店铺类型获取中文名称（用于导出文件名） */
const getShopTypeName = (type: number): string => {
  switch (type) {
    case ShopType.美团: return '美团'
    case ShopType.饿了么: return '饿了么'
    case ShopType.美团闪购: return '美团闪购'
    case ShopType.美团医药: return '美团医药'
    case ShopType.饿百零售: return '饿百零售'
    case ShopType.京东到家: return '京东到家'
    case ShopType.抖店即时零售: return '抖店'
    case ShopType.饿了么官方: return '饿了么官方'
    case 1000: return '美团团购'
    case 1001: return '京东团购'
    case 1002: return '抖音团购'
    default: return ''
  }
}

/**
 * 添加店铺信息到缓存，维护最多200条的限制
 * @param poiInfo 店铺信息
 */
const addPoiToCache = (poiInfo: PoiCacheInfo) => {
  // 如果缓存已满（超过200条），删除最早添加的一条
  if (poiInfoCache.value.size >= 200) {
    const firstKey = poiInfoCache.value.keys().next().value
    if (firstKey) {
      poiInfoCache.value.delete(firstKey)
    }
  }
  // 添加新的店铺信息
  poiInfoCache.value.set(poiInfo.poi_id_str, poiInfo)
}

/**
 * 从缓存中获取店铺信息
 * @param poiIdStr 店铺ID
 * @returns 店铺信息，如果不存在返回 undefined
 */
const getPoiFromCache = (poiIdStr: string): PoiCacheInfo | undefined => {
  return poiInfoCache.value.get(poiIdStr)
}

const allReceiveData = ref<any>([]) // 存储主要的数据包，如店铺基本信息和商品列表
const poiInfo = ref<any>({}) // 竞对店铺信息对象，包含店名、logo等基本信息
const beginState = ref(false) // 是否已开始数据处理的标志，用于控制数据上传流程

// 如果从任务列表进入，自动填充竞对店铺信息
if (props.oldShop && props.taskId) {
  const oid = props.oldShop.office_id || ''
  const st = props.oldShop.shop_type || 0
  shopType.value = st
  competitorShopId.value = (st === 1002 && oid && !String(oid).startsWith('CONTENDTG'))
    ? 'CONTENDTG' + oid
    : oid
  poiInfo.value = {
    name: props.oldShop.name || '',
    pic_url: props.oldShop.img || '',
    bulletin: '',
    poi_id_str: competitorShopId.value
  }
}

// 所有食品分组列表，包括错误分组和团购分组
const allFoodGroups = computed(() => {
  const errorFoodGroup: any = {
    id: 'error_food_id',
    Group: {
      id: 'error_food_id',
      check: errorFoodGroupChecked.value,
      Name: '复制异常商品',
      FoodCount: errorFoodCopy.value
    }
  }
  const result = [errorFoodGroup, ...foodGroups.value]
  if (isGrouponShop.value) {
    result.splice(1, 0, {
      id: 'groupon_food_id',
      Group: { id: 'groupon_food_id', check: false, Name: '团购商品', FoodCount: 0 }
    })
  }
  return result
})

// 处理接收到的数据
let createclientTimerId: ReturnType<typeof setInterval>
let debouncedCreateClient = debounce(createclient1, 500)

const handleDetailUrl = (data: any) => {


  console.log(data.url, 'data.url')
  //判断是美团的地址 .meituan.com
  if (data.url.includes('shangou.meituan.com') || data.url.includes('scapi.waimai.meituan.com')) {
    console.log('闪购----', data.url)
    disMeiTuanShangou(data);
  } else if (data.url.includes("hcapi-wx.waimai.meituan.com")) {
    console.log('美团医药----', data.url)
    disMeiTuanYiYao(data);
  } else if (data.url.includes('waimai.meituan.com') || data.url.includes('wmapi.meituan.com')) {
    console.log('美团外卖----', data.url)
    disMeiTuanWamai(data);
  }
  else if (data.url.includes('api.m.jd.com/client.action')) {
    console.log('京东到家----', data.url)
    disJddj(data);
  } else if (data.url.includes("waimai-guide.ele.me") && (data.url.includes("mtop.venus") || data.url.includes("mtop.ninja"))) {
    console.log('饿百零售----', data.url)
    disElmLs(data);
  } else if (data.url.includes("mapi.dianping.com/mapi") || data.url.includes("apimeishi.meituan.com/meishi") || data.url.includes("apimobile.meituan.com/meishi") || data.url.includes("i.meituan.com/wrapapi/allpoiinfo")) {
    disMeituanTuangou(data);
  } else if (data.url.includes('scsjsd.com') && (data.url.includes('aweme/v1/poi/detail_web') || data.url.includes('v2/poi/user/trade/product/info'))) {
    disDyTuanGou(data);
  } else {
    //console.log('收到url：', data.url)
    if (data.url.includes('mtop.alsc.waimai.store.miniapp.store.detail.head.query.v2')) {

      data.body = JSON.parse(data.body)
      console.log('1')
      competitorShopId.value = ''
      foodGroups.value = []
      groupForGoodList.value = []
      allReceiveLitData.value = []
      currentGroupIndex.value = 0
      shopType.value = 2
      allReceiveData.value[0] = data
      poiInfo.value = data.body.data.resultMap
      poiInfo.value.name = poiInfo.value.storeHead.storeInfo.name
      competitorShopId.value = data.body.data.resultMap.storeMiniAppTab
        ? data.body.data.resultMap.storeMiniAppTab[0].tbRestaurantId
        : getOldShopId(data.body.data.resultMap)
      console.log(competitorShopId.value, 'oldShopId')
    } else if (data.url.includes('mtop.alsc.waimai.store.miniapp.store.detail.body.query.v2')) {
      data.body = JSON.parse(data.body)
      console.log('2')
      // 如果索引0为空，赋值到索引0，否则赋值到索引1，避免产生空对象
      if (!allReceiveData.value[0]) {
        allReceiveData.value[0] = data
      } else {
        allReceiveData.value[1] = data
      }
      setTimeout(() => {
        // createFoodMoveTask()
        createclient1()
      }, 500)
    } else if (
      data.url.includes('mtop.alsc.waimai.store.detail.item.purchased') ||
      data.url.includes('mtop.alsc.wamai.store.detail.miniapp.item.query') ||
      data.url.includes('mtop.eleme.waimai.carts.shop.operate.um')
    ) {
      console.log('3')
      data.body = JSON.parse(data.body)
      allReceiveLitData.value.push(data)
      if (beginState.value) {
        uploadWxData(data, true)
      }
    }
  }


}
const disMeituanTuangou = (data: any) => {

  data.body = JSON.parse(data.body)
  var obj = data.body

  //第一次进店时会获取店铺资源 里面包含了店铺信息
  if (data.url.includes('mapi.dianping.com/mapi/aoi/getdiscusslist.bin')) {
    beginState.value = false;
    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    //allReceiveLitData.value = []
    currentGroupIndex.value = 0
    shopType.value = 1000 // 美团团购
    //allReceiveData.value[0] = data
    poiInfo.value = {
      name: obj.referInfo.referName, // 店铺名称
      bulletin: "", // 店铺公告
      pic_url: "",//obj.data.frontImages.imageList[0].bigPicUrl, // 店铺logo图片URL
      poi_id_str: "CONTENDTG" + obj.referInfo.referId // 店铺ID字符串
    }
    competitorShopId.value = "CONTENDTG" + obj.referInfo.referId
    debouncedCreateClient()
  } else if (data.url.includes("i.meituan.com/wrapapi/allpoiinfo")) {
    beginState.value = false;
    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    //allReceiveLitData.value = []
    currentGroupIndex.value = 0
    shopType.value = 1000 // 美团团购
    //allReceiveData.value[0] = data
    poiInfo.value = {
      name: obj.data.baseInfo.name, // 店铺名称
      bulletin: "", // 店铺公告
      pic_url: obj.data.baseInfo.headIcon, // 店铺logo图片URL
      poi_id_str: "CONTENDTG" + obj.data.baseInfo.id // 店铺ID字符串
    }
    competitorShopId.value = "CONTENDTG" + obj.data.baseInfo.id
    debouncedCreateClient()
  } else if (
    data.url.includes('apimeishi.meituan.com/meishi/poi/v1/shelf') ||
    //
    data.url.includes('apimobile.meituan.com/meishi/deal/v5/info')
  ) {





    //if (beginState.value) {
    uploadWxData(data, true)
    //}
  }
}

// 处理抖音团购
const disDyTuanGou = (data: any) => {
  if (data.url.includes('aweme/v1/poi/detail_web')) {
    let bodyObj: any
    try {
      bodyObj = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
    } catch {
      return
    }
    const dynamicArr = bodyObj?.dynamic ?? bodyObj?.data?.dynamic
    if (!Array.isArray(dynamicArr)) return
    const type1Items = dynamicArr.filter((item: any) => item?.type === 1)
    if (type1Items.length === 0) return
    let poiId = ''
    const allSpuIds: string[] = []
    for (const type1 of type1Items) {
      if (!type1?.lynx_data?.raw_data) continue
      let rawData: any
      try {
        rawData = typeof type1.lynx_data.raw_data === 'string'
          ? JSON.parse(type1.lynx_data.raw_data) : type1.lynx_data.raw_data
      } catch {
        continue
      }
      if (!rawData) continue
      const poiInfoObj = rawData.poi_info ?? rawData.poi ?? rawData.shop_info
      if (!poiId) {
        poiId = poiInfoObj?.poi_id ?? poiInfoObj?.id ?? rawData.poi_id ?? ''
      }
      const productList = rawData.spu_list ?? rawData.products ?? rawData.product_list ?? rawData.activity_list ?? rawData.items ?? []
      const ids = (Array.isArray(productList) ? productList : [])
        .map((m: any) => m?.spu_id ?? m?.activity_id ?? m?.product_id ?? m?.id ?? m?.productId)
        .filter(Boolean)
      allSpuIds.push(...ids)
    }
    poiId = String(poiId || '').trim()
    const spuIds = [...new Set(allSpuIds)]
    const firstRaw = type1Items[0]?.lynx_data?.raw_data
    let firstRawData: any = null
    try {
      firstRawData = typeof firstRaw === 'string' ? JSON.parse(firstRaw) : firstRaw
    } catch {
      //
    }
    const poiInfoObj = firstRawData?.poi_info ?? firstRawData?.poi ?? firstRawData?.shop_info
    const shopName = poiInfoObj?.poi_name ?? poiInfoObj?.name ?? ''
    const spuList = firstRawData?.spu_list ?? firstRawData?.products ?? firstRawData?.product_list ?? []
    const firstSpu = Array.isArray(spuList) ? spuList[0] : null
    const coverImg = poiInfoObj?.cover_image?.UrlList?.[0] ?? poiInfoObj?.cover
      ?? firstSpu?.image_url?.[0]?.url_list?.[0] ?? ''
    beginState.value = false
    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    currentGroupIndex.value = 0
    shopType.value = 1002
    poiInfo.value = {
      name: shopName,
      bulletin: '',
      pic_url: coverImg,
      poi_id_str: 'CONTENDTG' + poiId
    }
    competitorShopId.value = 'CONTENDTG' + poiId
      // 同步创建任务后再 uploadWxData，确保 taskId 就绪，避免“未找到商品”
      ; (async () => {
        const t0 = Date.now()
        try {
          console.log(`[抖音团购] ${new Date().toISOString()} 开始创建任务 (耗时 0ms)`)
          await createClientSync()
          console.log(`[抖音团购] ${new Date().toISOString()} 创建任务完成，开始上传 detail_web (耗时 ${Date.now() - t0}ms)`)
          const t1 = Date.now()
          await uploadWxData(data, true)
          console.log(`[抖音团购] ${new Date().toISOString()} 上传 detail_web 完成 (耗时 ${Date.now() - t1}ms)，总耗时 ${Date.now() - t0}ms`)
          if (spuIds.length > 0 && globalThis.electron?.dyTuanGouStartProductFetch) {
            console.log(`[抖音团购] ${new Date().toISOString()} 开始采集 ${spuIds.length} 个商品详情`)
            globalThis.electron.dyTuanGouStartProductFetch({ poiId, spuIds })
          }
        } catch (e) {
          console.error(`[抖音团购] ${new Date().toISOString()} 创建任务或上传失败，总耗时 ${Date.now() - t0}ms:`, e)
        }
      })()
  } else if (data.url.includes('v2/poi/user/trade/product/info')) {
    uploadWxData(data, true)
  }
}

//处理饿百零售的
const disElmLs = (data: any) => {

  data.body = JSON.parse(data.body)
  var obj = data.body

  //第一次进店时会获取店铺资源 里面包含了店铺信息
  if (data.url.includes('mtop.venus.shopresourceservice.getshopresource')) {
    beginState.value = false;
    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    //allReceiveLitData.value = []
    currentGroupIndex.value = 0
    shopType.value = 5 // 饿百零售
    //allReceiveData.value[0] = data
    poiInfo.value = {
      name: obj.data.data.shopInfo.name, // 店铺名称
      bulletin: obj.data.data.shopInfo.promotionInfo || "", // 店铺公告
      pic_url: obj.data.data.shopInfo.imagePath, // 店铺logo图片URL
      poi_id_str: "CONTEND" + obj.data.data.shopInfo.storeId // 店铺ID字符串
    }
    competitorShopId.value = "CONTEND" + obj.data.data.shopInfo.storeId
    debouncedCreateClient()
  } else if (
    data.url.includes('mtop.venus.shopcategoryservice.getcategoryv2') ||
    data.url.includes('mtop.venus.shopcategoryservice.getcategorydetail') ||
    data.url.includes('mtop.venus.shopgoodsservice.getshopgoodsresource') ||
    data.url.includes('mtop.ninja.shopgoodsresourceservice.getshopitemdescription')
  ) {

    if (data.url.includes("mtop.venus.shopcategoryservice.getcategoryv2")) {
      allReceiveLitData.value[0] = data;
    }



    if (beginState.value) {
      uploadWxData(data, true)
    }
  }
}
//处理京东到家
const disJddj = (data: any) => {
  data.body = JSON.parse(data.body)

  var obj = data.body;

  if (obj.body?.floorsList) {
    //$.body.floorsList 是个数组中 查找成员 floorName 为 门店信息 的对像
    var floorInfo = obj.body.floorsList.find((item: any) => item.floorName === '门店信息')

    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    allReceiveLitData.value = []
    currentGroupIndex.value = 0
    shopType.value = 6
    allReceiveData.value[0] = data
    poiInfo.value = {
      name: obj.body.commonData.name,        // 店铺名称
      bulletin: "",    // 店铺公告
      pic_url: floorInfo.data.storeHeadViewInfo.logoUrl,     // 店铺logo图片URL
      poi_id_str: obj.body.commonData.storeId,  // 店铺ID字符串
    }
    competitorShopId.value = obj.body.commonData.storeId
    //到这里说明要创建客户端了
    debouncedCreateClient()
  } else {
    uploadWxData(data, true)
  }

}
//处理闪购的
const disMeiTuanShangou = (data: any) => {

  if (data.url.includes('wx-shangou.meituan.com/mtweapp/v1/poi/food?') || data.url.includes('wx-shangou.meituan.com/wxapp/v1/poi/food') || data.url.includes('scapi.waimai.meituan.com/api/v11/poi/head')) {


    data.body = JSON.parse(data.body)
    var tempInfo = data.body.data.poi_info || data.body.data.poi_base_info;

    if (competitorShopId.value === tempInfo.poi_id_str) {
      if (beginState.value) {
        uploadWxData(data, true)
      }
      return;
    }
    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    allReceiveLitData.value = []
    currentGroupIndex.value = 0
    shopType.value = 3
    allReceiveData.value[0] = data
    poiInfo.value = data.body.data.poi_info || data.body.data.poi_base_info
    competitorShopId.value = poiInfo.value.poi_id_str
    debouncedCreateClient()
  } else if (
    data.url.includes('wx-shangou.meituan.com/mtweapp/v1/poi/sputag/products') ||
    data.url.includes('wx-shangou.meituan.com/mtweapp/v1/poi/product/smooth/render?') ||
    data.url.includes('wx-shangou.meituan.com/mtweapp/v2/poi/product/info?') ||
    data.url.includes("wx-shangou.meituan.com/wxapp/v1/poi/sputag/products") ||
    data.url.includes('scapi.waimai.meituan.com/api/v8/poi/sputag/products') || data.url.includes('scapi.waimai.meituan.com/api/v11/poi/products') ||
    data.url.includes('wx-shangou.meituan.com/wxapp/v1/poi/product/smooth/render?') ||
    data.url.includes("wx-shangou.meituan.com/wxapp/v2/poi/product/info") || data.url.includes('scapi.waimai.meituan.com/api/v1/vision/page/sc-native-product-page-float') //详情

  ) {
    console.log(data, 'data')
    data.body = JSON.parse(data.body)
    allReceiveLitData.value.push(data)
    if (beginState.value) {
      uploadWxData(data, true)
    }
  }
}
//处理美团医药的
const disMeiTuanYiYao = (data: any) => {

  console.log("医药...")
  if (data.url.includes('hcapi-wx.waimai.meituan.com/mtweapp/v1/poi/food') || data.url.includes('hcapi-wx.waimai.meituan.com/wxapp/v1/poi/food')) {

    data.body = JSON.parse(data.body)
    var tempInfo = data.body.data.poi_info || data.body.data.poi_base_info;
    if (competitorShopId.value === tempInfo.poi_id_str) {
      if (beginState.value) {
        uploadWxData(data, true)
      }
      return;
    }
    competitorShopId.value = ''
    foodGroups.value = []
    groupForGoodList.value = []
    allReceiveLitData.value = []
    currentGroupIndex.value = 0
    shopType.value = 4
    allReceiveData.value[0] = data
    poiInfo.value = data.body.data.poi_info || data.body.data.poi_base_info
    competitorShopId.value = poiInfo.value.poi_id_str
    debouncedCreateClient()
  } else if (
    data.url.includes('hcapi-wx.waimai.meituan.com/mtweapp/v1/poi/sputag/products') ||
    data.url.includes('hcapi-wx.waimai.meituan.com/mtweapp/v1/poi/product/smooth/render?') ||
    data.url.includes("hcapi-wx.waimai.meituan.com/wxapp/v1/poi/sputag/products") ||
    data.url.includes('hcapi-wx.waimai.meituan.com/wxapp/v1/poi/product/smooth/render?') ||
    data.url.includes("hcapi-wx.waimai.meituan.com/storm/graphql/tile/query/from_app_drug_detail") //详情

  ) {
    console.log(data, 'data')
    data.body = JSON.parse(data.body)
    allReceiveLitData.value.push(data)
    if (beginState.value) {
      uploadWxData(data, true)
    }
  }
}
//处理美团的
const disMeiTuanWamai = (data: any) => {

  if (data.url.includes('wmapi.meituan.com/api/v6/home/feeds/mainlist') || data.url.includes('wmapi.meituan.com/api/v6/home/feeds/tabs') || data.url.includes('wmapi.meituan.com/api/v6/channel/feeds/tabs') || data.url.includes('wmapi.meituan.com/api/v6/channel/feeds/list')) {
    // 店铺列表，解析并缓存店铺信息
    try {
      data.body = JSON.parse(data.body)
      const moduleList = data.body?.data?.module_list || []

      // 遍历店铺列表，提取店铺信息并缓存
      moduleList.forEach((module: any) => {
        if (module.string_data) {
          try {
            let poiData = JSON.parse(module.string_data)
            if (poiData.string_data) {
              poiData = JSON.parse(poiData.string_data)
            }

            if (poiData.poi_id_str && poiData.poi_name) {
              // 添加到缓存
              addPoiToCache({
                poi_id_str: poiData.poi_id_str,
                poi_name: poiData.poi_name,
                poi_pic: poiData.poi_pic || ''
              })
            }
          } catch (e) {
            console.error('解析店铺信息失败:', e)
          }
        }
      })

      console.log(`已缓存 ${poiInfoCache.value.size} 个店铺信息`)
    } catch (e) {
      console.error('解析 mainlist 响应失败:', e)
    }
  } else if (data.url.includes('wmapi.meituan.com/api/v11/search/globalpage')) {
    // 搜索店铺列表，解析并缓存店铺信息
    try {
      data.body = JSON.parse(data.body)
      const moduleList = data.body?.data?.module_list || []

      // 遍历店铺列表，只处理 module_id 为 "poi_mode" 的店铺信息
      moduleList.forEach((module: any) => {
        if (module.string_data) {
          try {
            let moduleData: any = JSON.parse(module.string_data)
            if (moduleData.string_data) {
              moduleData = JSON.parse(moduleData.string_data)
            }
            if (moduleData.base?.id_str) {
              moduleData = {
                wm_poi: {
                  name: {
                    name: moduleData.base.name,
                    poi_id_str: moduleData.base.id_str
                  },
                  poi_id_str: moduleData.base.id_str,
                  logo_info: {
                    pic_url: moduleData.base.url
                  }
                }
              }
            } else if (moduleData.wmCptBanner?.poi_id_str) {
              moduleData = {
                wm_poi: {
                  name: {
                    name: moduleData.wmCptBanner.poiInfo.poiName,
                    poi_id_str: moduleData.wmCptBanner.poi_id_str,

                  },
                  logo_info: {
                    pic_url: moduleData.wmCptBanner.poiInfo.poiLogo
                  }
                }
              }
            }
            const wmPoi = moduleData.wm_poi

            if (wmPoi && wmPoi.name && wmPoi.name.poi_id_str) {
              // 添加到缓存
              addPoiToCache({
                poi_id_str: wmPoi.name.poi_id_str,
                poi_name: wmPoi.name.name,
                poi_pic: wmPoi.logo_info?.pic_url || ''
              })
            }
          } catch (e) {
            console.error('解析搜索店铺信息失败:', e)
          }
        }
      })

      console.log(`搜索列表已缓存 ${poiInfoCache.value.size} 个店铺信息`)
    } catch (e) {
      console.error('解析搜索响应失败:', e)
    }
  } else
    if (data.url.includes('wx.waimai.meituan.com/weapp/v1/poi/food') || data.url.includes('wmapi.meituan.com/api/v8/poi/food')) {
      data.body = JSON.parse(data.body)

      competitorShopId.value = ''
      foodGroups.value = []
      groupForGoodList.value = []
      allReceiveLitData.value = []
      currentGroupIndex.value = 0
      shopType.value = 1
      allReceiveData.value[0] = data
      poiInfo.value = data.body.data.poi_info || data.body.data.poi_base_info
      competitorShopId.value = poiInfo.value.poi_id_str
    } else if (data.url.includes('wx.waimai.meituan.com/weapp/shop/v1/poi/productlist?') || data.url.includes('wmapi.meituan.com/api/shop/v1/poi/productlist')) {
      data.body = JSON.parse(data.body)
      // 如果索引0为空，赋值到索引0，否则赋值到索引1，避免产生空对象
      if (!allReceiveData.value[0]) {
        allReceiveData.value[0] = data
      } else {
        allReceiveData.value[1] = data
      }

      // 每次都尝试从请求 body 中取出店铺 ID
      let currentPoiIdStr = ''
      try {
        // data.post 存储的是请求body（URL编码的表单数据字符串）
        if (data.post && data.post !== 'err') {
          const params = new URLSearchParams(data.post)
          currentPoiIdStr = params.get('poi_id_str') || ''

          if (currentPoiIdStr) {
            console.log('从请求 body 中提取到 poi_id_str:', currentPoiIdStr)

            // 检查店铺ID是否发生变化
            if (currentPoiIdStr !== competitorShopId.value) {
              console.log('店铺ID发生变化，旧ID:', competitorShopId.value, '新ID:', currentPoiIdStr)
              allReceiveData.value[0] = data
              // 从缓存中查找店铺信息
              const cachedPoiInfo = getPoiFromCache(currentPoiIdStr)

              if (cachedPoiInfo) {
                console.log('从缓存中找到店铺信息:', cachedPoiInfo)
                // 填充店铺信息
                allReceiveData.value = [];
                allReceiveData.value[0] = data
                competitorShopId.value = ''
                foodGroups.value = []
                groupForGoodList.value = []
                allReceiveLitData.value = []
                currentGroupIndex.value = 0
                poiInfo.value = {
                  name: cachedPoiInfo.poi_name,
                  pic_url: cachedPoiInfo.poi_pic,
                  bulletin: '',
                  poi_id_str: cachedPoiInfo.poi_id_str
                }
                shopType.value = 1
                competitorShopId.value = cachedPoiInfo.poi_id_str

                // 调用创建客户端
                debouncedCreateClient()
              } else {
                console.warn('缓存中未找到店铺信息，poi_id_str:', currentPoiIdStr)
              }
            } else {
              // 店铺ID没有变化，正常调用创建客户端
              console.log('店铺ID未变化，继续处理:', currentPoiIdStr)
              debouncedCreateClient()
            }
          } else {
            console.warn('请求 body 中未找到 poi_id_str 参数')
            // 如果已有店铺ID，继续处理
            if (competitorShopId.value) {
              console.log('使用已有的店铺ID继续处理:', competitorShopId.value)
              debouncedCreateClient()
            }
          }
        } else {
          console.warn('data.post 不存在或解析失败')
          // 如果已有店铺ID，继续处理
          if (competitorShopId.value) {
            console.log('使用已有的店铺ID继续处理:', competitorShopId.value)
            debouncedCreateClient()
          }
        }
      } catch (e) {
        console.error('解析请求 body 或获取缓存失败:', e)
        // 出错时如果已有店铺ID，继续处理
        if (competitorShopId.value) {
          console.log('解析出错，使用已有的店铺ID继续处理:', competitorShopId.value)
          debouncedCreateClient()
        }
      }
    } else if (
      data.url.includes('wx.waimai.meituan.com/weapp/poi/food/render?') || data.url.includes('wmapi.meituan.com/api/v8/poi/food/render') || data.url.includes('wmapi.meituan.com/api/poi/food/render') ||
      data.url.includes('wx.waimai.meituan.com/weapp/shop/v1/poi/attr?') || data.url.includes('api/shop/v1/poi/attr') ||
      data.url.includes('wx.waimai.meituan.com/weapp/v7/poi/product/detail?') || data.url.includes('wmapi.meituan.com/api/v7/poi/product/info') ||//商品详情
      data.url.includes('wx.waimai.meituan.com/weapp/shop/v1/poi/combogroup/info?') || data.url.includes('wmapi.meituan.com/api/shop/v1/poi/combogroup/info')
    ) {
      data.body = JSON.parse(data.body)
      allReceiveLitData.value.push(data)
      if (beginState.value) {
        uploadWxData(data, true)
      }
    }
}

// 控制加载对话框的显示状态
const loadingState = ref(false)
// 标识当前是否处于数据获取阶段，用于控制进度条显示内容
const isGetData = ref(true)
const createFoodMoveTask = async () => {
  loadingState.value = true

  if (!shopType.value || !competitorShopId.value) {
    return gp.$baseMessage('参数未获取!', 'error', 'hey')
  }
  const params = {
    NewShop: shopDataCopy.value.id,
    OldShopOffid: getPlatformPrefix(shopType.value) + competitorShopId.value,
    // OldShopOffid: (shopType.value === 6 ? 'jd' : '') + oldShopId.value,
    OldShopType: shopType.value,
    KeepNewShops: true,
    SyncStock: true,
    SyncActivitys: true,
    OnlyActivitys: null,
    SyncOnSale: true,
    CategoryUseRecomend: true,  // 默认开启类目推荐模式
    MaxThreads: 55,
    RemoveWaterMark: true,
    OldShop: null,
    attr_recomend: true,
    attr_recomend_s: 60,
    TaskType: CreateTaskTypeEnum.Competitor,
  }

  // if(releaseshow.value==false){
  //   return gp.$baseMessage('未创建链接，无法获取数据，请重新调研!', 'error', 'hey')
  // }
  return createTask(params)
    .then((res: any) => {
      if (res.code === 200) {
        taskId.value = res.data.id
        emit('gettaskId', taskId.value)
        if (taskId.value) {
          isGetData.value = true
          console.log(allReceiveLitData.value, 'allReceiveLitData')
          executeTasksInOrder(allReceiveData.value)
          tryAutoOpenRemoteBrowser()
        }
      }
    })
    .catch(() => {
      loadingState.value = false
    })
}

const foodGroupDataList = ref<any>([]) // 存储食品分组数据列表，用于显示和处理
const foodGroupDataStates = ref<any>([]) // 存储食品数据状态列表，用于跟踪每个商品的处理状态

// 创建防抖的刷新函数，避免频繁刷新
const debouncedRefreshGoodList = debounce(() => {
  if (groupGoodParams.groupid) {
    console.log('防抖刷新当前商品列表以更新错误信息')
    // 清空当前分组商品的缓存，确保使用最新数据
    // 因为 parseWxData 可能更新了商品结构
    if (groupForGoodList.value && groupForGoodList.value.length > 0) {
      groupForGoodList.value.forEach((item: any) => {
        if (item && item.id && modifiedFoodsMap.value.has(item.id)) {
          console.log(`清除商品 ${item.id} 的缓存，使用最新数据`)
          modifiedFoodsMap.value.delete(item.id)
        }
      })
    }
    getGoodForGroupList()
  }
}, 500)

const uploadWxData = async (params: any, flag?: true) => {
  if (!taskId.value) {
    return
  }
  const { url, body, post } = params
  await parseWxData({
    taskId: taskId.value,
    url,
    html_body: body,
    post
  }).then((res: any) => {
    if (res.code === 200) {
      if (res.data && res.data.FoodGroupDataStates && res.data.FoodGroupDataStates.length > 0) {
        foodGroupDataList.value = res.data.FoodGroupDataStates
        foodGroupDataStates.value = []
        foodGroupDataList.value.forEach((item: any) => {
          if (item.FoodDataState) {
            for (let key in item.FoodDataState) {
              foodGroupDataStates.value.push(item.FoodDataState[key])
            }
          }
        })
        console.log(foodGroupDataStates.value, 'foodGroupDataStates')

        // 如果当前正在查看商品列表，使用防抖刷新列表以更新错误信息
        // 只在非flag模式下刷新，避免与getMoveDataForTask冲突
        if (!flag) {
          debouncedRefreshGoodList()
        }
      }
      if (flag) {
        setTimeout(() => {
          getMoveDataForTask()
        }, 1000)
      }
    }
  })
}
// 活动列表，存储店铺的促销活动
const activityList = ref([])
// 店铺装饰信息，包含店招、海报等
const decorateInfo = ref({})
//真实商品数量
const realFoodCount = ref(0)
// 商品总数计数
const allGoodsCount = ref(0)
// 是否显示错误商品列表的标志
const showShopDetailsState = ref(false)
// 当前商品组的ID
const currentGoodGroup = ref('')

// 递归查找分组（包括子分组）
const findGroupById = (groups: any[], targetId: string): any => {
  for (const group of groups) {
    if (group.id === targetId) {
      return group
    }
    // 递归查找子分组
    if (group.Children && group.Children.length > 0) {
      const found = findGroupById(group.Children, targetId)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 查找第一个可用的分组（包括子分组）
const findFirstAvailableGroup = (groups: any[]): any => {
  for (const group of groups) {
    // 如果当前分组有商品，返回它
    if (group.Group && group.Group.FoodCount > 0) {
      return group
    }
    // 递归查找子分组
    if (group.Children && group.Children.length > 0) {
      const found = findFirstAvailableGroup(group.Children)
      if (found) {
        return found
      }
    }
  }
  // 如果没有找到有商品的分组，返回第一个分组
  return groups.length > 0 ? groups[0] : null
}

// 获取搬菜数据
const getMoveDataForTask = async () => {
  await getFoodMoveDataForTask(taskId.value).then((res: any) => {
    if (res.code === 200) {
      const { ActivityList, DecorateInfo, FoodGroups, RealFoodCount } = res.data

      activityList.value = ActivityList.map((item: any) => {
        item.isLoading = false
        return item
      })
        .slice()
        .sort((a: any, b: any) => {
          // 如果 a.Type 是 3，则 a 排在前面
          if (a.Type === 3) return -1
          // 如果 b.Type 是 3，则 b 排在前面
          if (b.Type === 3) return 1
          // 如果两者都不是 3 或都是 3，则保持原有顺序
          return 0
        })

      decorateInfo.value = DecorateInfo
      // 过滤前先记录后端真实"团购商品"分组，供 GrouponFoodManager 加载/保存使用（永不被普通分组覆盖）
      trueGrouponGroup.value = (FoodGroups || []).find((g: any) =>
        g.Group?.OfficeId === 'tuangou_def' || g.Group?.Name === '团购商品'
      ) ?? null
      // 过滤掉后端返回的真实"团购商品"分组，由虚拟分组代替展示
      foodGroups.value = (FoodGroups || []).filter((g: any) =>
        g.Group?.OfficeId !== 'tuangou_def' && g.Group?.Name !== '团购商品'
      )
      realFoodCount.value = RealFoodCount;
      allGoodsCount.value = 0
      // 如果是饿百零售，计算一级分组的 spu_count（等于所有二级分类的 spu_count 之和）
      if (shopType.value === 5) {
        calculateParentSpuCount(foodGroups.value)
      }
      groupAddCheck(foodGroups.value)
      if (foodGroups.value && foodGroups.value.length > 0) {
        setTimeout(() => {
          console.log(currentGroupIndex.value, foodGroups.value)
          // 保持用户当前选中的分类，只有在没有选中分类时才设置为第一个
          if (currentGroupIndex.value === 0) {
            currentGroupIndex.value = 1
            // 如果没有currentGroupId，设置第一个分类为默认选中
            if (!currentGroupId.value) {
              // 查找第一个可用的分组（包括子分组）
              const firstGroup = findFirstAvailableGroup(foodGroups.value)
              if (firstGroup) {
                currentGroupId.value = firstGroup.id
              } else {
                currentGroupId.value = foodGroups.value[0].id
              }
            }
            // 使用currentGroupId来获取分组
            const targetGroup = findGroupById(foodGroups.value, currentGroupId.value)
            if (targetGroup) {
              getGroupGoodList(targetGroup)
            } else {
              getGroupGoodList(foodGroups.value[currentGroupIndex.value - 1])
            }
          } else {
            // 如果用户已经选中了分类，保持当前选中的分类
            // 确保索引在有效范围内
            if (currentGroupIndex.value > foodGroups.value.length) {
              currentGroupIndex.value = 1
            }
            // 如果currentGroupId存在，尝试找到对应的分类（包括子分组）
            if (currentGroupId.value) {
              const targetGroup = findGroupById(foodGroups.value, currentGroupId.value)
              if (targetGroup) {
                getGroupGoodList(targetGroup)
              } else {
                // 如果找不到对应的分类，使用索引
                getGroupGoodList(foodGroups.value[currentGroupIndex.value - 1])
              }
            } else {
              getGroupGoodList(foodGroups.value[currentGroupIndex.value - 1])
            }
          }
          copyError()
        }, 1000)
        currentGoodGroup.value = foodGroups.value[0].OfficeId
        showShopDetailsState.value = true
      }
    }
  })
}
const groupGoodParams = reactive({
  page: 1,
  pagesize: 10,
  groupid: '',
  taskid: ''
})
// 是否显示错误商品列表的标志
const isErrorListState = ref(false)
// 是否显示团购商品管理组件
const isGrouponState = ref(false)
const goodsLoading = ref(false)
// 是否处于真正的团购商品分组（控制 GrouponFoodManager 的新增/保存按钮显示）
const isGrouponGroup = ref(false)
// 后端返回的真实"团购商品"分组（加载时记录，永不被普通分组覆盖）
const trueGrouponGroup = ref<any>(null)
// 普通分组检测到团购商品时记录当前分组
const currentDetectedGrouponGroup = ref<any>(null)
// 计算属性：团购模式用真实团购分组，普通分组检测模式用当前分组
const realGrouponGroup = computed(() =>
  isGrouponGroup.value ? trueGrouponGroup.value : currentDetectedGrouponGroup.value
)
const grouponManagerRef = ref<any>(null)

// 判断新店是否为团购类型（1000~1999 范围）
const isGrouponShop = computed(() => {
  const t = shopDataCopy.value?.shop_type
  return typeof t === 'number' && t >= 1000 && t < 2000
})
// 商品名称过滤
const foodNameFilter = ref('')
// 控制店铺信息、活动列表、复制配置区域的折叠状态
const isShopInfoCollapsed = ref(false)

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

// 判断是否存在"复制异常商品"
const hasErrorFoodGroup = computed(() => {
  return errorFoodCopy.value > 0
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

// 全选所有分组（包括"复制异常商品"）
const selectAllGroups = () => {
  // 全选"复制异常商品"
  errorFoodGroupChecked.value = true
  // 全选其他分组
  if (foodGroups.value && foodGroups.value.length > 0) {
    selectAllGroupsRecursive(foodGroups.value)
  }
}

// 取消全选所有分组（包括"复制异常商品"）
const unselectAllGroups = () => {
  // 取消全选"复制异常商品"
  errorFoodGroupChecked.value = false
  // 取消全选其他分组
  if (foodGroups.value && foodGroups.value.length > 0) {
    unselectAllGroupsRecursive(foodGroups.value)
  }
}

// 处理分组 checkbox 变化事件
const handleGroupCheckboxChange = (item: any, checked: boolean) => {
  // 如果是"复制异常商品"，更新 errorFoodGroupChecked
  if (item.Group && item.Group.id === 'error_food_id') {
    errorFoodGroupChecked.value = checked
  }
  // 其他分组的状态已经通过 v-model 自动更新了
}

/**
 * 计算一级分组的 spu_count（等于所有二级分类的 spu_count 之和）
 * 计算一级分组的 FoodCount（等于所有二级分类的 FoodCount 之和）
 * 仅用于饿百零售
 * @param list 分组列表
 */
const calculateParentSpuCount = (list: any[]) => {
  if (list && list.length > 0) {
    list.forEach((item: any) => {
      // 如果有子分组，先递归处理子分组
      if (item.Children && item.Children.length > 0) {
        calculateParentSpuCount(item.Children)
        // 累加所有二级分类的 spu_count 到一级分组
        const totalSpuCount = item.Children.reduce((sum: number, child: any) => {
          return sum + (child.spu_count || 0)
        }, 0)
        // 更新一级分组的 spu_count
        item.spu_count = totalSpuCount

        // 累加所有二级分类的 FoodCount 到一级分组（括号右边的数量）
        const totalFoodCount = item.Children.reduce((sum: number, child: any) => {
          return sum + (child.Group?.FoodCount || 0)
        }, 0)
        // 更新一级分组的 FoodCount（直接赋值，而不是累加）
        item.Group.FoodCount = totalFoodCount
      }
    })
  }
}

// 递归添加属性
const groupAddCheck = (list: any) => {
  if (list && list.length > 0) {
    list.forEach((item: any) => {
      // 先递归处理子分组
      if (item.Children && item.Children.length > 0) {
        groupAddCheck(item.Children)
        // 累加子分组的 FoodCount 到父分组
        // 注意：对于饿百零售（shopType.value === 5），FoodCount 已经在 calculateParentSpuCount 中计算过了，这里不再累加
        if (shopType.value !== 5) {
          item.Group.FoodCount += item.Children.reduce((sum: number, child: any) => sum + child.Group.FoodCount, 0)
        }
      }
      // 设置当前分组的 check 为 true
      item.Group.check = true
      allGoodsCount.value += item.Group.FoodCount
    })
  }
}
// 获取商品列表
// const getGroupGoodList = (item: any, index: number) => {
//   console.log(item, 'item')
//   currentGroupIndex.value = index
//   groupGoodParams.page = 1
//   if (item.Group.id === 'error_food_id') {
//     getErrorCopyList()
//     isErrorListState.value = true
//   } else {
//     groupGoodParams.groupid = item.id
//     groupGoodParams.taskid = taskId.value
//     getGoodForGroupList()
//     isErrorListState.value = false
//   }
// }
const getGroupGoodList = (item: any) => {
  // 在切换分类之前，只保存用户手动修改过的商品（isUpdate === true）到Map中
  // 避免把整个分组的所有商品都存入Map，防止一键复制时误调用 updateFood
  if (groupForGoodList.value && groupForGoodList.value.length > 0) {
    groupForGoodList.value.forEach((foodItem: any) => {
      if (foodItem && foodItem.id && foodItem.isUpdate) {
        modifiedFoodsMap.value.set(foodItem.id, JSON.parse(JSON.stringify(foodItem)))
      }
    })
  }

  currentGroupId.value = item.id
  groupGoodParams.page = 1
  errorParams.page = 1
  // 切换分组时清空过滤条件
  foodNameFilter.value = ''
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
        groupForGoodList.value.forEach((foodItem: any, index: number) => {
          foodItem.isLoading = false
          foodItem.isUpdate = false
          if (foodItem.Specifications?.length > 0) {
            foodItem.Specifications.sort((a: any, b: any) => a.Index - b.Index)
          }
          if (foodItem.id && modifiedFoodsMap.value.has(foodItem.id)) {
            const modifiedItem = modifiedFoodsMap.value.get(foodItem.id)
            const apiSpecCount = foodItem.Specifications?.length || 0
            const cachedSpecCount = modifiedItem.Specifications?.length || 0
            if (apiSpecCount !== cachedSpecCount) {
              modifiedFoodsMap.value.delete(foodItem.id)
            } else {
              Object.assign(foodItem, modifiedItem)
            }
          }
          foodGroupDataStates.value.forEach((_item: any) => {
            if (foodItem.SpuId === _item.spu_id) {
              groupForGoodList.value[index].err_msg2 = getErrorMsg(_item.states)
            }
          })
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
  page: 1,
  pagesize: 10,
  taskid: ''
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
      item.check = true
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

// 获取商品列表
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

    groupForGoodList.value.forEach((item: any, index: number) => {
      item.isLoading = false
      item.isUpdate = false
      if (item && item.Specifications && item.Specifications.length > 0) {
        item.Specifications.sort((a: any, b: any) => a.Index - b.Index)
      }
      // 如果商品在已修改的Map中，恢复其修改后的数据
      if (item && item.id && modifiedFoodsMap.value.has(item.id)) {
        const modifiedItem = modifiedFoodsMap.value.get(item.id)

        // 检查规格数据是否发生变化（比如通过parseWxData更新了）
        const apiSpecCount = item.Specifications?.length || 0
        const cachedSpecCount = modifiedItem.Specifications?.length || 0

        // 如果规格数量不同，说明数据已更新，清除缓存使用最新数据
        if (apiSpecCount !== cachedSpecCount) {
          console.log(`商品 ${item.id} 规格数量变化: ${cachedSpecCount} -> ${apiSpecCount}，使用最新数据`)
          modifiedFoodsMap.value.delete(item.id)
        } else {
          // 规格数量相同，合并修改后的数据到当前商品
          Object.assign(item, modifiedItem)
        }
      }
      foodGroupDataStates.value.forEach((_item: any) => {
        if (item.SpuId === _item.spu_id) {
          groupForGoodList.value[index].err_msg2 = getErrorMsg(_item.states)
        }
      })
    })
    groupForGoodTotal.value = result.total
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取商品列表失败', 'error', 'hey')
  } finally {
    goodsLoading.value = false
  }
}
const getErrorMsg = (arr: any) => {
  let str = ''
  arr.forEach((item: any) => {
    switch (item) {
      case 0: {
        str += '点击详情可获得属性，'
        break
      }
      case 1: {
        str += '需点击选择规格补全多规格商品，'
        break
      }
      case 2: {
        str += '套餐商品需点击选择套餐补全套餐信息，'
        break
      }
      // No default
    }
  })
  return str.slice(0, -1)
}
const handleLitData = async (tasks: any) => {
  for (const task of tasks) {
    try {
      await uploadWxData(task)
      console.log(`Task ${task} completed successfully.`)
    } catch (error: any) {
      console.error(`Error executing task ${task}:`, error.message, error.stack)
      throw error // 如果希望停止所有后续任务，则抛出错误
    }
  }
}
// 进度计数器，用于显示搬菜进度
const progressNum = ref(0)
// 准备数据
const prepareData = async () => {
  const checkProgress = async () => {
    taskType.value = 1;
    try {
      const res: any = await beginData(taskId.value)
      if (res.code === 200) {
        const { Progress, Total, IsFinished } = res.data
        progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0
        if (IsFinished) {
          progressNum.value = 100
          // 打包处理结束
          beginState.value = true
          // 显示成功消息并执行后续操作
          setTimeout(() => {
            getMoveDataForTask()
            // this.$message.success('数据获取完成');
          }, 3000)
          // 等待一段时间后重置状态
          setTimeout(() => {
            loadingState.value = false
            progressNum.value = 0
            copyError()
          }, 1000)
        } else {
          // 如果任务未完成，在800ms后再次尝试
          setTimeout(() => checkProgress(), 3000)
        }
      } else {
        console.error('Unexpected response code:', res.code)
        loadingState.value = false
      }
    } catch (error) {
      console.error('Error occurred during polling:', error)
      loadingState.value = false
    }
  }
  // 开始轮询
  await checkProgress()
}
const executeTasksInOrder = async (tasks: any) => {
  for (const task of tasks) {
    try {
      await uploadWxData(task)
      console.log(`Task ${task} completed successfully.`)
    } catch (error: any) {
      console.error(`Error executing task ${task}:`, error.message, error.stack)
      throw error // 如果希望停止所有后续任务，则抛出错误
    }
  }
  // 大包处理结束，依次执行除大包外的其他包，仅是暂存的。处理完再获取进度，进度100%时候置false不再处理，转而上面接受分配处理
  if (!beginState.value) {
    try {
      await handleLitData(allReceiveLitData.value) // 确保 handleLitData 完成后再继续
      console.log('handleLitData completed successfully.')
    } catch (error: any) {
      console.error('Error handling lit data:', error.message, error.stack)
      throw error // 让错误冒泡出去，阻止 prepareData 的执行
    }
  }
  try {
    await prepareData() // 确保 prepareData 在 handleLitData 之后执行
    console.log('All preparations have been made.')
  } catch (error: any) {
    console.error('Error preparing data:', error.message, error.stack)
    throw error // 如果 prepareData 失败，应该让错误冒泡出去
  }
}
const getOldShopId = (res: any) => {
  if (res.storePoster) {
    let idStr = res.storePoster.posters[0].traceData.trace
    const dataObject = idStr.split(',').reduce((obj: any, pair: string) => {
      const [key, value] = pair.split(':')
      obj[key] = value
      return obj
    }, {})
    return dataObject['shop']
  }
}

let unsubscribe: Function
let unsubDyProgress: Function
let unsubDyCollectingPrompt: Function
let unsubDyWindowState: Function
let dyProgressNotification: ReturnType<typeof ElNotification> | null = null
onMounted(async () => {
  unsubscribe = globalThis.electron.onReceiveInterceptedData(handleDetailUrl)
  unsubDyProgress = globalThis.electron.onDyTuanGouFetchProgress((data: { current: number; total: number; done?: boolean }) => {
    dyTuanGouFetchProgress.value = data
    dyTuanGouCollecting.value = !data.done
    if (dyProgressNotification) dyProgressNotification.close()
    dyProgressNotification = ElNotification({
      title: '抖音团购',
      message: data.done ? '商品详情已获取完成' : `正在获取商品详情 ${data.current}/${data.total}`,
      type: data.done ? 'success' : 'info',
      duration: data.done ? 3000 : 0,
      position: 'bottom-right'
    })
    if (data.done) {
      setTimeout(() => { dyTuanGouFetchProgress.value = null }, 3000)
    }
  })
  unsubDyCollectingPrompt = globalThis.electron.onDyTuanGouCollectingPrompt((data: { msg: string }) => {
    ElMessage.info(data?.msg || '正在采集中')
  })
  unsubDyWindowState = globalThis.electron.onDyTuanGouWindowState((data: { open: boolean }) => {
    dyTuanGouWinOpen.value = !!data?.open
  })

  // 有 taskId 时检查老店数据是否准备好，准备好了就直接加载
  if (taskId.value) {
    try {
      const isReady = await apiManager.foodmoveApi.IsOldShopDataReady(taskId.value)
      if (isReady) {
        emit('gettaskId', taskId.value)
        await getMoveDataForTask()
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

onUnmounted(() => {
  unsubscribe() // 取消监听
  unsubDyProgress?.()
  unsubDyCollectingPrompt?.()
  unsubDyWindowState?.()
  dyProgressNotification?.close()
  offRemoteBrowserWindowClosed?.()
})

const logParams = reactive({
  shopOffId: '',
  page: 1,
  pagesize: 20
})
// 日志列表数据，显示历史搬菜记录
const logList = ref([])
// 日志总条数
const logTotal = ref(0)
// 日志状态，控制日志列表的显示
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
onBeforeUnmount(() => {
  investigationState.value = false
  globalThis.electron.stopProxy()

  // 停止 Frida
  if (fridaWorking.value) {
    stopFrida()
  }

  if (releaseshow.value && taskId.value) {

  }
})
const downImg = (url: any) => {
  let afterUrl = handleSizeImg(url)
  if (afterUrl) {
    globalThis.electron.downImage(afterUrl)
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
const handleImg = (row: any) => {
  if (row && row.ImgUrl && row.ImgUrl.Img) {
    if (row.ImgUrl.Img.startsWith('//')) {
      return `https:${row.ImgUrl.Img}`
    }
    return row.ImgUrl.Img // 如果不以 // 开头，则返回原字符串
  }
  return ''
}
const changeImgState = ref(false)
const openChange = () => {
  changeImgState.value = true
}
const handlePicUrl = (str: any) => {
  if (!str) {
    return
  }
  const extensions = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  let ext = ''
  for (let e of extensions) {
    if (str.endsWith(e)) {
      ext = `.${e}`
      break
    }
  }
  if (!ext) {
    ext = '.jpeg'
  }
  if (str.length < 6) {
    throw new Error('Input string is too short to be formatted.')
  }
  const firstTwo = str.slice(0, 1)
  const nextTwo = str.slice(1, 3)
  const rest = str.slice(3)
  const baseUrl = 'https://cube.elemecdn.com/'
  return `${baseUrl}${firstTwo}/${nextTwo}/${rest}${ext}`
}
const errorConfirmType = ref('')
const errorConfirmText = ref('')
const openWarningTip = () => {
  closeInvestigation()
  stopFrida()
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
const copyShopPoster = () => {
  ElMessageBox.confirm('此操作复制店招海报, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 停止采集和Frida
      closeInvestigation()
      stopFrida()

      syncDecorate(taskId.value).then((res: any) => {
        if (res.code === 200) {
          return gp.$baseMessage('复制成功!', 'success', 'hey')
        }
      })
    })
    .catch()
}
const copyState = ref('more')
const removeWaterMark = ref(true)
const errMsgList = ref<any>([])
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
      // 停止采集和Frida
      closeInvestigation()
      stopFrida()

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
        RemoveWaterMark: removeWaterMark.value,
        SyncOnSale: true
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

                // 更新进度
                progressNum.value = Progress ? Math.ceil((Progress / Total) * 100) : 0

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
          getMoveDataForTask()
          // this.$message.success('复制成功!');
        }, 3000)
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

const copyError = () => {
  foodFailCount(taskId.value).then((res: any) => {
    if (res.code === 200) {
      errorFoodCopy.value = res.data
      // 如果有异常商品，只保留异常商品分组为选中，其他正常分组取消选中
      if (res.data > 0) {
        // 设置异常商品分组为选中
        errorFoodGroupChecked.value = true
        // 取消所有正常分组的选中状态
        const unselectNormalGroups = (list: any[]) => {
          if (list && list.length > 0) {
            list.forEach((item: any) => {
              if (item.Group) {
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
      }
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
      // 停止采集和Frida
      closeInvestigation()
      stopFrida()

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
  closeInvestigation()
  stopFrida()

  copyState.value = 'once'
  copyOnceId.value = row.id
  isGetData.value = true
  row.isLoading = true

  // 直接使用 row 对象，因为它已经包含了用户在界面上修改的价格（通过 v-model 双向绑定）
  // 需要深拷贝确保所有嵌套数据（包括 Specifications 和 Options 中的 Price）都被正确传递
  const rowData = JSON.parse(JSON.stringify(row))

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
        // this.getGoodForGroupList()
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
            RemoveWaterMark: removeWaterMark.value,
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
    RemoveWaterMark: removeWaterMark.value,
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
/**
 * 处理价格变化，将修改后的商品保存到全局Map中
 * 注意：这里只是临时保存，需要调用 confirmUpdate 或 updateFood 才能保存到数据库
 * 在复制商品时会自动批量保存所有修改的商品
 * @param item 商品对象
 */
const handlePriceChange = (item: any) => {
  if (!item?.id) {
    return
  }

  try {
    // 深拷贝商品数据并保存到Map中，避免引用问题
    modifiedFoodsMap.value.set(item.id, JSON.parse(JSON.stringify(item)))
    // 标记商品已修改，需要保存
    item.isUpdate = true
  } catch (error) {
    console.error('保存商品修改失败:', error)
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
const customColors = [{ color: '#67c23a', percentage: 100 }]
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
      const { ActivityList, DecorateInfo, FoodGroups, RealFoodCount } = res.data
      activityList.value = ActivityList.map((item: any) => {
        item.isLoading = false
        return item
      })
        .slice()
        .sort((a: any, b: any) => {
          if (a.Type === 3) return -1
          if (b.Type === 3) return 1
          return 0
        })
      decorateInfo.value = DecorateInfo
      // 过滤前先记录后端真实"团购商品"分组，供 GrouponFoodManager 加载/保存使用（永不被普通分组覆盖）
      trueGrouponGroup.value = (FoodGroups || []).find((g: any) =>
        g.Group?.OfficeId === 'tuangou_def' || g.Group?.Name === '团购商品'
      ) ?? null
      // 过滤掉后端返回的真实"团购商品"分组，由虚拟分组代替展示
      foodGroups.value = (FoodGroups || []).filter((g: any) =>
        g.Group?.OfficeId !== 'tuangou_def' && g.Group?.Name !== '团购商品'
      )
      realFoodCount.value = RealFoodCount
      allGoodsCount.value = 0
      // 如果是饿百零售，计算一级分组的 spu_count（等于所有二级分类的 spu_count 之和）
      if (shopType.value === 5) {
        calculateParentSpuCount(foodGroups.value)
      }
      groupAddCheck(foodGroups.value)
      if (foodGroups.value && foodGroups.value.length > 0) {
        setTimeout(() => {
          if (currentGroupIndex.value === 0) {
            currentGroupIndex.value = 1
            if (!currentGroupId.value) {
              const firstGroup = findFirstAvailableGroup(foodGroups.value)
              if (firstGroup) {
                currentGroupId.value = firstGroup.id
              } else {
                currentGroupId.value = foodGroups.value[0].id
              }
            }
            const targetGroup = findGroupById(foodGroups.value, currentGroupId.value)
            if (targetGroup) {
              getGroupGoodList(targetGroup)
            } else {
              getGroupGoodList(foodGroups.value[currentGroupIndex.value - 1])
            }
          } else {
            if (currentGroupIndex.value > foodGroups.value.length) {
              currentGroupIndex.value = 1
            }
            if (currentGroupId.value) {
              const targetGroup = findGroupById(foodGroups.value, currentGroupId.value)
              if (targetGroup) {
                getGroupGoodList(targetGroup)
              } else {
                getGroupGoodList(foodGroups.value[currentGroupIndex.value - 1])
              }
            } else {
              getGroupGoodList(foodGroups.value[currentGroupIndex.value - 1])
            }
          }
          copyError()
        }, 1000)
        currentGoodGroup.value = foodGroups.value[0].OfficeId
        showShopDetailsState.value = true
      }

      // 清空 modifiedFoodsMap，因为改价已经完成，数据已从数据库刷新
      modifiedFoodsMap.value.clear()

      // 刷新当前显示的商品列表，更新价格显示
      // 如果当前正在查看某个分组，刷新该分组的商品列表
      if (currentGroupId.value && !isErrorListState.value) {
        // 重新获取当前分组的商品列表，以显示更新后的价格
        getGoodForGroupList()
      } else if (isErrorListState.value) {
        // 如果当前在异常商品列表，刷新异常商品列表
        getErrorCopyList()
      }

      // 延迟关闭进度对话框，让用户看到完成状态
      setTimeout(() => {
        closeChangePriceProgress()
        // 改价完成提示
        gp.$baseMessage('改价完成！商品价格已更新到数据库，提交复制时将使用修改后的价格', 'success', 'hey')
      }, 1000)
    }
  } catch (error) {
    console.error('检查改价进度失败:', error)
  }
}


/**
 * 获取分组下所有商品ID（分页获取）
 * @param groupIds 分组ID列表
 * @returns 商品ID列表（去重）
 */
const getAllFoodIdsFromGroups = async (groupIds: string[]): Promise<string[]> => {
  const foodIdSet = new Set<string>() // 使用 Set 提高去重性能
  const pageSize = 100 // 每页获取100个商品

  // 并行获取所有分组的商品，提高性能
  const groupPromises = groupIds.map(async (groupId) => {
    const groupFoodIds: string[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      try {
        const result = await apiManager.foodmoveApi.GetGroupFoods(
          taskId.value,
          groupId,
          page,
          pageSize,
          undefined
        )

        if (result?.rows && result.rows.length > 0) {
          result.rows.forEach((food: any) => {
            if (food?.id) {
              groupFoodIds.push(food.id)
            }
          })
        }

        // 判断是否还有更多数据
        hasMore = result?.rows && result.rows.length === pageSize
        page++
      } catch (error) {
        console.error(`获取分组 ${groupId} 的商品列表失败:`, error)
        hasMore = false
        // 继续处理其他分组，不中断整个流程
      }
    }

    return groupFoodIds
  })

  // 等待所有分组获取完成
  const allGroupFoodIds = await Promise.all(groupPromises)

  // 合并所有商品ID并去重
  allGroupFoodIds.forEach(groupFoodIds => {
    groupFoodIds.forEach(foodId => {
      foodIdSet.add(foodId)
    })
  })

  return Array.from(foodIdSet)
}

/**
 * 确认改价操作
 * 根据选中的菜单分类（排除异常分组）批量修改商品价格
 */
const confirmChangePrice = async () => {
  // 停止采集和Frida
  closeInvestigation()
  stopFrida()

  // 过滤掉异常分组（Name 包含"复制异常"的分组），即使选中也不生效
  const hasCheckGroup = foodGroups.value.filter((item: any) => {
    // 排除异常分组
    if (item.Group?.Name?.includes('复制异常')) {
      return false
    }
    return item.Group?.check === true
  })

  if (hasCheckGroup.length === 0) {
    return gp.$baseMessage('请选择需要修改的分组!', 'error', 'hey')
  }

  // 收集选中分组的ID
  const groupIds: string[] = []

  hasCheckGroup.forEach((item: any) => {
    if (!item.Group) {
      return
    }

    // 收集主分组ID
    if (item.Group.id) {
      groupIds.push(item.Group.id)
    }

    // 如果有子分组，也需要收集子分组的ID（同样排除异常分组）
    if (item.Children?.length > 0) {
      item.Children.forEach((child: any) => {
        // 排除异常分组
        if (child.Group?.check && !child.Group.Name?.includes('复制异常')) {
          // 收集子分组的ID用于获取商品
          if (child.Group.id && !groupIds.includes(child.Group.id)) {
            groupIds.push(child.Group.id)
          }
        }
      })
    }
  })

  changePriceForm.value?.validate(async (valid: any) => {
    if (valid) {
      // 构建完整的改价参数，包含 FoodManageParmsBase 所需的字段
      // 注意：food_ids 会在后面设置，如果设置了 food_ids，GroupOffids 应该设为 null，避免范围扩大
      const updatePriceParams: any = {
        task: taskId.value,
        TaskId: taskId.value, // FoodManageParmsBase 需要
        SyncSite: false, // 此操作只针对数据库，操作完后统一更新到平台
        GroupOffids: null, // 初始设为 null，后面如果传了 food_ids 就保持 null，避免范围扩大
        new_shop: shopDataCopy.value.id,
        food_ids: [], // 会在获取商品ID后设置
        mark_up: priceParams.mark_up,
        change_mode: priceParams.change_mode,
        value: parseFloat(priceParams.value) || 0
      }

      changePriceLoading.value = true

      // 显示改价进度对话框
      changePriceProgressVisible.value = true
      changePriceProgress.value = 0
      changePriceProgressStatus.value = ''
      changePriceCheckCount.value = 0
      // 记录改价开始时间
      changePriceStartTime.value = Date.now()

      try {
        // 第一步：获取所有选中分组的商品ID列表（排除异常分组）
        changePriceProgress.value = 5
        const allFoodIds = await getAllFoodIdsFromGroups(groupIds)
        totalFoodsToUpdate.value = allFoodIds.length

        if (allFoodIds.length === 0) {
          changePriceProgressStatus.value = 'exception'
          changePriceProgress.value = 0
          gp.$baseMessage('选中的分组中没有商品', 'warning', 'hey')
          setTimeout(() => {
            closeChangePriceProgress()
          }, 2000)
          changePriceLoading.value = false
          return
        }

        // 将商品ID列表添加到改价参数中
        // 重要：如果传了 food_ids，就不传 GroupOffids，避免范围扩大
        // 因为 food_ids 已经精确指定了要改价的商品，GroupOffids 会导致范围扩大
        updatePriceParams.food_ids = allFoodIds
        updatePriceParams.GroupOffids = null
        changePriceProgress.value = 10

        // 第二步：调用改价接口
        // 注意：价格为0的情况由后端处理
        // - 百分比涨价：0 * 百分比 = 0，可能不生效（后端逻辑）
        // - 固定金额涨价：0 + 金额 = 金额，应该能正常工作（后端逻辑）
        const res = await beachUpdateFoodPrice(updatePriceParams)
        if (res.code === 200) {
          // 改价接口调用成功，改价是异步的，需要等待后端处理完成
          changePriceProgress.value = 30 // 接口调用成功，进度设为30%

          // 开始轮询检查改价是否完成
          changePriceProgressInterval.value = setInterval(() => {
            changePriceCheckCount.value++

            // 计算进度：前10秒从30%到70%，之后从70%到90%，取整
            const elapsedTime = (Date.now() - changePriceStartTime.value) / 1000
            if (elapsedTime < minChangePriceWaitTime) {
              // 前10秒：30% -> 70%
              changePriceProgress.value = Math.floor(Math.min(30 + (elapsedTime / minChangePriceWaitTime) * 40, 70))
            } else {
              // 10秒后：70% -> 90%
              const extraTime = elapsedTime - minChangePriceWaitTime
              changePriceProgress.value = Math.floor(Math.min(70 + (extraTime / 10) * 20, 90))
            }

            // 检查改价是否完成（只有在等待足够时间后才会真正完成）
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
        // 改价接口调用异常
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
watch(countDown, val => {
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
  } else if (errorConfirmType.value === 'updateNewShop') {
    taskType.value = 2;
    startTask({ taskid: taskId.value, tasktype: 2 }).then(res => {
      if (res.code === 200) {
        loadingState.value = true
        isGetData.value = true
        queryTaskProgress({ taskid: taskId.value, tasktype: 2 }, 'shop')
      }
    }).finally(() => {
      pageLoading.value = false
    })
  }
}



// 查询任务进度
// params {taskid: 任务ID, tasktype: 任务类型}
const queryTaskProgress = (params: any, type: string) => {
  taskProgress(params).then((res: any) => {
    if (res.code === 200) {
      const { Progress, Total, IsFinished, ErrMsg } = res.data
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
        // 等待500ms后执行后续操作
        setTimeout(() => {
          // loadingState.value = false
          // progressNum.value = 0
        }, 1000)
      } else {
        // 如果任务未完成，设置一个定时器在800ms后再次尝试
        setTimeout(() => queryTaskProgress(params, type), 2000)
      }
    }
  })
}
const copyActive = (row: any) => {
  row.isLoading = true
  closeInvestigation()
  stopFrida()
  if (row.Name === '折扣活动') {
    loadingState.value = true
    isGetData.value = false
    taskType.value = 4;
    startTask({ taskid: taskId.value, tasktype: 4 }).then(res => {
      if (res.code === 200) {
        try {
          queryTaskProgress({ taskid: taskId.value, tasktype: 4 }, 'active')
        } catch {
        }
      }
    }).finally(() => {
      row.isLoading = false
    })
  } else {
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

const updateNewShopData = () => {
  errorConfirmType.value = 'updateNewShop'
  errorConfirmText.value = `操作提示：如果复制折扣活动商品不全，请点击此按钮进行更新新店数据然后再重新复制一遍活动。`
  openInterval()
}

const openShop = async (shopId: string, id: string) => {
  try {
    pageLoading.value = true
    const rowList: any = await apiManager.fdmvmanagerApi.QueryShops(shopId, ShopType.None, ShopType.None)
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
    const shopIds = [id]
    const shops = await apiManager.remoteBrowserApi.GetShopsForRemoteBrowser({ ShopIds: shopIds })
    if (shops.length > 0) {
      remoteBrowserOpenedForShopId.value = id
      electron.openRemoteBrowser({ shopIds: shopIds.join(',') })
    }
  } catch {
    // 平台未实现或接口异常时静默跳过
  }
}
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

  .good-detail-item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .detail-left {
    position: relative;

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

    .travelcube {
      position: absolute;
      top: 0;
      right: 0;
      height: 16px;
      width: auto;
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

.shop-img-content {
  display: flex;
  align-items: flex-start;
  width: calc(100% - 190px);

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
    width: calc(100% - 155px);

    .shop-name {
      font-size: 20px;
      font-weight: bold;
      height: 30px;
    }

    .shop-tips {
      line-height: 20px;
      margin-bottom: 10px;
      width: 100%;
      white-space: nowrap;
      /* 防止文本换行 */
      overflow: hidden;
      /* 隐藏溢出的内容 */
      text-overflow: ellipsis;
      /* 添加省略号 */
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
  border-radius: 10px;
  background-color: #fff;
  overflow: hidden;
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
  background-color: #f5f7fa;
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

.fix-loading {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
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

::v-deep .price-input {
  width: 80px !important;

  .el-input__inner {
    width: 80px !important;
  }
}

.error-text {
  color: #e02020 !important;
}

.shop-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

::v-deep .el-input.is-disabled {
  .el-input__inner {
    color: #333333 !important;
    background-color: #fff;
    border-color: #dcdfe6;
    cursor: auto;
  }
}

.specs-name-other {
  width: 110px;
}

::v-deep .dialog-min-width {
  min-width: 700px;
}

.form-tips {
  width: 360px;
  line-height: 1.4;
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

.shop-info-collapse-header {
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

.view-link {
  color: #409eff;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: underline;

  &:hover {
    color: #66b1ff;
  }
}
</style>