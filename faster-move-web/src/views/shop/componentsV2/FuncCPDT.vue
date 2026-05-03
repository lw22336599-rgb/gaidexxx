<template>
  <vab-card>
    <div v-loading="cpIndexLoading" class="page-container">
      <div class="cp-left">
        <div class="goods-list">
          <div
            v-for="(item, index) in goodsList"
            :key="item.id"
            class="goods-item"
            :class="{ 'is-active': currentIndex === index }"
            @click="getRightList(item, index)"
          >
            {{ item.Name }}
          </div>
        </div>
      </div>
      <div class="cp-right">
        <div class="right-title">
          <div class="right-title-left">菜单列表</div>
          <el-button type="primary" @click="updateMenu">更新菜单</el-button>
        </div>
        <el-divider />
        <div v-loading="goodsListLoading" class="right-left">
          <div v-for="item in currentRightList" :key="item.id" class="right-item">
            <div class="right-item-left">
              <img alt="" class="right-item-img" :src="item.Img" />
              <div class="goods-msg">
                <div class="goods-msg-title">{{ item.Name }}</div>
                <div class="goods-msg-num">月销{{ 0 }}</div>
              </div>
            </div>
            <div class="right-item-right">
              <el-button type="primary" @click="mapConversion(item)">智能换图</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="drawerState">
      <el-drawer v-model="drawerState" :before-close="handleClose" direction="rtl" size="650" title="菜品动图设置">
        <div v-loading="drawerPageLoading" class="setting-container">
          <div class="setting-img-main">
            <div v-loading="imgLoading" style="position: relative">
              <img alt="" class="setting-img" :src="currentGoods.Img" />
              <img alt="" :src="currentGifUrl" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%" />
            </div>
            <div class="handle-img">
              <el-button :loading="restoreLoading" type="info" @click="restoreImg">还原主图</el-button>
              <el-button :loading="saveLoading" type="primary" @click="saveImg">保存</el-button>
            </div>
          </div>
          <div class="setting-main">
            <el-tabs v-model="firstIndex" class="demo-tabs" @tab-click="handleClick">
              <el-tab-pane v-for="(item, index) in groupList" :key="index" :label="item.Member.name" :name="index">
                <div style="width: 100%; display: flex; align-items: center; justify-content: space-between">
                  <el-segmented v-model="secondSort" :options="secondData" size="large" @change="changeSecondSort" />
                  <el-button plain type="danger" @click="removeImg">移除效果</el-button>
                </div>
                <div v-loading="cpIndexLoading" style="margin-top: 20px; display: flex; align-items: flex-start">
                  <div class="cp-left" style="height: 246px; overflow-y: auto">
                    <div class="goods-list">
                      <div
                        v-for="(_item, _index) in thirdData"
                        :key="_item.id"
                        class="goods-item"
                        :class="{ 'is-active': currentMemberIndex === _index }"
                        @click="selectMenu(_item, _index)"
                      >
                        {{ _item.Member.name }}
                      </div>
                    </div>
                  </div>
                  <div class="fooditem">
                    <div v-loading="gifLoading" class="foodflesx">
                      <div v-for="gitItem in gifList" :key="gitItem.id" class="food" @click="selectGif(gitItem)">
                        <img alt="" class="img" :src="currentGoods.Img" />
                        <img alt="" class="postimg" :src="gitItem.gif" />
                        <div v-show="currentGif.id == gitItem.id" class="modelbox">
                          <el-icon style="color: #fff"><check /></el-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <vab-pagination
                  :current-page="gifParams.page"
                  :page-size="gifParams.pageSize"
                  :total="gifTotal"
                  @current-change="handleCurrentChange"
                  @size-change="handleSizeChange"
                />
              </el-tab-pane>
              <el-tab-pane label="自定义" name="自定义">
                <div class="upload-container">
                  <el-upload
                    ref="uploadRef"
                    action=""
                    class="avatar-uploader"
                    :http-request="httpRequest"
                    :limit="1"
                    :show-file-list="false"
                  >
                    <div class="upload-main">
                      <el-icon><plus /></el-icon>
                    </div>
                  </el-upload>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-drawer>
    </div>
  </vab-card>
</template>

<script setup lang="ts">
import { filerequ, getConfFunc, getFuncCall, getGifListData, getGroup } from '/@/api/shop.ts'
import { Check, Plus } from '@element-plus/icons-vue'
import { gp } from '/@vab/plugins/vab.ts'
import type { UploadInstance } from 'element-plus'
const props = defineProps({
  currentRow: Object
})
const pageLoading = ref(false)
const cpIndexLoading = ref(false)
const goodsListLoading = ref(false)
const drawerState = ref(false)
const drawerPageLoading = ref(false)
const gifLoading = ref(false)
const queryParams = {
  code: 'CPDT',
  shop: props.currentRow.id
}
const uploadRef = ref<UploadInstance>()
const handleClose = () => {
  drawerState.value = false
}
const currentGif = ref<any>({})
const currentGifUrl = ref('')
const selectGif = (row: any) => {
  currentGif.value = row
  currentGifUrl.value = row.gif
}
const handleClick = (val: any) => {
  if (val.paneName !== '自定义') {
    firstIndex.value = val.paneName
    secondData.value = groupList.value[firstIndex.value].children.map((item: any) => item.Member.name)
    secondSort.value = secondData.value[secondIndex.value]
    changeSecondSort(secondSort.value)
  }
}
const changeSecondSort = (val: string) => {
  currentMemberIndex.value = 0
  thirdData.value = groupList.value[firstIndex.value].children.find((item: any) => item.Member.name === val).children
  gifParams.groupId = groupList.value[firstIndex.value].children.find(
    (item: any) => item.Member.name === val
  ).children[0].Member.id
  getGifList()
}
const callParams = reactive({
  func_code: 'CPDT',
  method: 'GetGoods',
  parm_obj: { force: true },
  shop: props.currentRow.id
})
const getUploadImg = (arr: Array<any>) => {
  console.log(arr, '123456')
  if (arr.length === 1) {
    currentGif.value = {
      gif: arr[0].url,
      id: arr[0].uid
    }
    currentGifUrl.value = arr[0].url
  } else {
    removeImg()
  }
}
const foodItems = ref([])
const getConfData = async () => {
  try {
    pageLoading.value = true
    const res: any = await getConfFunc(queryParams)
    if (res.code === 200) {
      foodItems.value = res.data.conf_json.FoodItems
    }
  } finally {
    pageLoading.value = false
  }
}
const imgLoading = ref(false)
const restoreLoading = ref(false)
const restoreImg = () => {
  let params = {
    func_code: 'CPDT',
    method: 'ReplaceFoodImgAsync',
    parm_obj: {
      foodId: currentGoods.value.id,
      img_gif: '',
      img_sou: foodItems.value.find((item: any) => item.food_id === currentGoods.value.id)?.sou_img,
      reset: true
    },
    shop: props.currentRow.id
  }
  imgLoading.value = true
  restoreLoading.value = true
  getFuncCall(params)
    .then((res: any) => {
      if (res.code === 200) {
        currentGoods.value.Img = res.data
        removeImg()
      }
    })
    .finally(() => {
      imgLoading.value = false
      restoreLoading.value = false
    })
}
const removeImg = () => {
  currentGifUrl.value = ''
  currentGif.value = {}
}
const saveLoading = ref(false)
const saveImg = () => {
  if (!currentGif.value.gif) {
    return gp.$baseMessage('未选择动图！', 'error', 'hey')
  }
  saveLoading.value = true
  imgLoading.value = true
  let params = {
    func_code: 'CPDT',
    method: 'ReplaceFoodImgAsync',
    parm_obj: {
      foodId: currentGoods.value.id,
      img_gif: currentGif.value.gif,
      img_sou: currentGoods.value.Img,
      reset: false
    },
    shop: props.currentRow.id
  }
  getFuncCall(params)
    .then((res: any) => {
      if (res.code === 200) {
        currentGoods.value.Img = res.data
        removeImg()
      }
    })
    .finally(() => {
      imgLoading.value = false
      saveLoading.value = false
    })
}
const selectMenu = (row: any, index: number) => {
  gifParams.groupId = row.Member.id
  currentMemberIndex.value = index
  getGifList()
}
const currentIndex = ref(0)
const currentMemberIndex = ref(0)
const updateMenu = () => {
  getFuncCallData()
}
const groupList = ref<Array<any>>([])
const currentGoods = ref<any>({})
const gifList = ref<Array<any>>([])
const gifTotal = ref(0)
const gifParams = reactive({
  groupId: '',
  page: 1,
  pageSize: 20
})
const getGifList = () => {
  gifLoading.value = true
  getGifListData(gifParams)
    .then((res: any) => {
      if (res.code === 200) {
        gifList.value = res.data.rows
        gifTotal.value = res.data.total
      }
    })
    .finally(() => {
      gifLoading.value = false
    })
}
const handleCurrentChange = (value: number) => {
  gifParams.page = value
  getGifList()
}
const handleSizeChange = (value: number) => {
  gifParams.page = 1
  gifParams.pageSize = value
  getGifList()
}
const firstIndex = ref(0)
const secondIndex = ref(0)
const secondData = ref<Array<any>>([])
const thirdData = ref<Array<any>>([])
const secondSort = ref('')

const mapConversion = (row: any) => {
  drawerState.value = true
  drawerPageLoading.value = true
  currentGoods.value = row
  getConfData()
  getGroup({
    grouptype: 4,
    recursionchild: true
  })
    .then((res: any) => {
      if (res.code === 200) {
        groupList.value = res.data
        secondData.value = res.data[firstIndex.value].children.map((item: any) => item.Member.name)
        secondSort.value = secondData.value[secondIndex.value]
        thirdData.value = res.data[firstIndex.value].children[secondIndex.value].children
        gifParams.groupId =
          res.data[firstIndex.value].children[secondIndex.value].children[currentMemberIndex.value].Member.id
        getGifList()
      }
    })
    .finally(() => {
      drawerPageLoading.value = false
    })
}
const getRightList = (row: any, index: number) => {
  if (currentIndex.value === index) {
    return
  }
  currentIndex.value = index
  goodsListLoading.value = true
  setTimeout(() => {
    currentRightList.value = row.Items
    goodsListLoading.value = false
  }, 500)
}
const goodsList = ref<Array<any>>([])
const currentRightList = ref<Array<any>>([])
const getFuncCallData = () => {
  cpIndexLoading.value = true
  getFuncCall(callParams)
    .then((res: any) => {
      if (res.code === 200) {
        goodsList.value = res.data.Yday.Groups
        currentRightList.value = goodsList.value[currentIndex.value].Items
      }
    })
    .finally(() => {
      cpIndexLoading.value = false
    })
}
const httpRequest = async (fileBox: any) => {
  if (fileBox.file.size / 1024 / 1024 > 5) {
    return gp.$baseMessage('文件大小不能超过 5MB！', 'error', 'hey')
  }
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    let formData = new FormData()
    const fileOfBlob = new File([fileBox.file], fileBox.file.name)
    formData.append('file', fileOfBlob)
    filerequ(formData).then((res: any) => {
      if (!res.url) {
        return gp.$baseMessage('上传失败！', 'error', 'hey')
      }
      currentGif.value = {
        gif: res.url,
        id: Date.now()
      }
      currentGifUrl.value = res.url
    })
  })
  reader.readAsDataURL(fileBox.file)
  uploadRef.value!.clearFiles()
}
getFuncCallData()
</script>

<style scoped lang="scss">
.page-container {
  width: 700px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  .cp-left {
    .goods-list {
      width: 180px;
      border-right: 1px solid var(--el-card-border-color);
      .goods-item {
        width: 100%;
        white-space: nowrap; /* 禁止文本换行 */
        overflow: hidden; /* 隐藏超出范围的内容 */
        text-overflow: ellipsis; /* 使用省略号 */
        border-bottom: 1px solid var(--el-card-border-color);
        line-height: 40px;
        cursor: pointer;
        box-sizing: border-box;
        padding: 0 10px;
      }
      .goods-item:hover {
        background-color: var(--el-color-info-light-9);
      }
      .is-active {
        background: var(--el-color-info-light-7);
      }
    }
  }
  .cp-right {
    width: calc(100% - 200px);
    .right-title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .right-left {
      width: 100%;
      max-height: calc(100vh - 300px);
      overflow-y: scroll;
      .right-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        .right-item-left {
          display: flex;
          align-items: flex-start;
          width: calc(100% - 100px);
          .right-item-img {
            width: 120px;
            height: 90px;
            margin-right: 10px;
          }
          .goods-msg {
            width: calc(100% - 130px);
            .goods-msg-title {
              line-height: 1.5;
              height: 50px;
              display: -webkit-box; /* 设置为WebKit内核的弹性盒子模型 */
              -webkit-box-orient: vertical; /* 垂直排列 */
              -webkit-line-clamp: 2; /* 限制显示两行 */
              overflow: hidden; /* 隐藏超出范围的内容 */
              text-overflow: ellipsis; /* 使用省略号 */
            }
            .goods-msg-num {
              opacity: 0.7;
            }
          }
        }
        .right-item-right {
          width: 100px;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}
.setting-container {
  width: 100%;
  .setting-img-main {
    width: 100%;
    .setting-img {
      width: 100%;
      display: block;
    }
    .handle-img {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
  }
}
img {
  object-fit: fill;
}
.fooditem {
  width: calc(100% - 180px);
  padding: 0 10px;
  box-sizing: border-box;
  height: 246px;
  overflow-y: auto;
  .foodflesx {
    display: flex;
    flex-wrap: wrap;
    // height: calc(100vh - 800px);
    overflow-y: scroll;
    .food {
      width: 120px;
      height: 90px;
      position: relative;
      margin: 0 10px 10px 0;
      .img {
        width: 100%;
        height: 100%;
      }

      .postimg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }

      .modelbox {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: rgba($color: #000000, $alpha: 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .image-slot {
        // background: rgba($color: #000000, $alpha: 0.2);
        color: #fff;
        text-align: center;
        line-height: 100px;
      }
    }

    .food:nth-child(3n + 1) {
      margin-left: 0;
    }
  }
}
.upload-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .upload-main {
    width: 178px;
    height: 178px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    font-size: 22px;
  }
}
</style>
