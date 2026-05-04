<template>
  <div class="page-container">
    <div class="tool-name">批量改价-京东</div>
    <div class="tool-time">
      <div class="time-left">
        <span class="time">到期时间：2024/01/11</span>
        <el-button :icon="Refresh" type="primary">续费</el-button>
        <el-button :icon="Management">使用教程</el-button>
      </div>
      <div class="time-right">
        <!-- <el-button :icon="toolState ? VideoPause : VideoPlay" type="primary" @click="changeToolState"> {{ toolState ? '关闭调研' : '开启调研' }} </el-button> -->
        <el-button :icon="Refresh" type="primary">更新商品数据</el-button>
        <!-- <el-button :icon="Download">数据导出</el-button> -->
      </div>
    </div>
    <h4>店铺基本信息</h4>
    <div class="shopcart">
      <div class="cartleft">
        <div class="carttext"><span>店铺名称：</span>name</div>
        <div class="carttext"><span>营业时间：</span>09.30-21.30</div>
      </div>
      <div>
        <div class="carttext"><span>经营品类：</span>中式快餐</div>
        <div class="carttext"><span>店铺公告：</span>本店为高金校区师生服务，提供现场就餐和打包服务，欢迎光临~</div>
      </div>
    </div>
    <div class="requicontent">
      <!-- <div style="width:100%;height:100%;background:#eee;position: absolute;"></div> -->
      <div class="centcon">
        <div class="conleft">
          <div class="conleft-top">全部商品225</div>
          <div>
            <el-menu default-active="2" class="el-menu-vertical-demo">
              <el-sub-menu index="1">
                <template #title>
                  <el-icon><CaretRight /></el-icon>
                  <span>爆款商品</span>
                </template>
                <el-menu-item-group>
                  <el-menu-item index="1-1">
                    <div class="menus">
                      <div class="menusleft">子分类 2</div>
                      <div>商品 238</div>
                    </div>
                  </el-menu-item>
                </el-menu-item-group>
              </el-sub-menu>
            </el-menu>
          </div>
        </div>
        <div class="conright">
          <div class="righttop">
            <el-input
              v-model="input"
              style="min-width: 240px; flex: 1; margin-right: 10px; height: 30px"
              placeholder="可输入商品名称/条码/规格"
            />
            <el-checkbox v-model="checked" label="只选售卖中" size="large" />
            <el-checkbox v-model="checked" label="只选无折扣" size="large" />
            <el-button type="primary" style="margin-left: 10px">搜索</el-button>
          </div>
          <div class="righttwo">
            <div class="twoleft">
              <el-button type="primary" style="margin-right: 10px" @click="setshopnamedialog(true)"
                >节日关键词添加</el-button
              >
              <el-button type="primary" style="margin-right: 10px" @click="setzkdialog(true)">勾选修改折扣</el-button>
              <el-button type="primary" style="margin-right: 10px">勾选撤销折扣</el-button>
              <el-button type="primary" style="margin-right: 10px" @click="setyjdialog(true)">勾选修改原价</el-button>
            </div>
            <div class="twoleft">
              <el-button bg text>
                <img
                  style="width: 15px; height: 15px; margin-right: 5px"
                  src="../../icon/upshop.svg"
                  alt=""
                />批量上架</el-button
              >
              <el-button bg text
                ><img
                  style="width: 15px; height: 15px; margin-right: 5px"
                  src="../../icon/downshop.svg"
                  alt=""
                />批量下架</el-button
              >
              <el-button bg text @click="setkcdialog(true)"
                ><img
                  style="width: 15px; height: 15px; margin-right: 5px"
                  src="../../icon/inventory.svg"
                  alt=""
                />批量修改库存</el-button
              >
              <el-button bg text
                ><img
                  style="width: 15px; height: 15px; margin-right: 5px"
                  src="../../icon/discount.svg"
                  alt=""
                />导出折扣商品</el-button
              >
              <el-button bg text
                ><img
                  style="width: 15px; height: 15px; margin-right: 5px"
                  src="../../icon/postpone.svg"
                  alt=""
                />一键延期30天</el-button
              >
            </div>
          </div>
          <div class="tablebox">
            <shoptable />
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="zkdialog" title="修改折扣" width="600">
      <discount />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="setzkdialog(false)">取消</el-button>
          <el-button type="primary"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="yjdialog" title="修改原价" width="500">
      <original />

      <!-- <div>111</div> -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="setyjdialog(false)">取消</el-button>
          <el-button type="primary"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="shopnamedialog" title="批量修改商品名称" width="500">
      <product />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="setshopnamedialog(false)">取消</el-button>
          <el-button type="primary"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="kcdialog" title="批量修改库存" width="400">
      <inventory />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="setkcdialog(false)">取消</el-button>
          <el-button type="primary"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { Management, Refresh, CaretRight } from '@element-plus/icons-vue'
import shoptable from './components/shoptable.vue'
import discount from './components/discount.vue'
import original from './components/original.vue'
import product from './components/product.vue'
import inventory from './components/inventory.vue'
// import { Picture as IconPicture } from '@element-plus/icons-vue'
// import { getMyFunctions } from '/@/api/shop.ts'
// import shopactivity from './components/shopactivity.vue'
// import shoplist from "./components/shoplist.vue"
defineOptions({
  name: 'IntegralMt'
})
const toolState = ref(false)
const zkdialog = ref<boolean>(false)
const yjdialog = ref<boolean>(false)
const shopnamedialog = ref<boolean>(false)
const kcdialog = ref<boolean>(false)
const setzkdialog = (val: boolean) => {
  zkdialog.value = val
}
const setyjdialog = (val: boolean) => {
  yjdialog.value = val
}
const setshopnamedialog = (val: boolean) => {
  shopnamedialog.value = val
}
const setkcdialog = (val: boolean) => {
  kcdialog.value = val
}
const changeToolState = () => {
  toolState.value = !toolState.value
}
const funcList = ref([])
const endTime = ref('')
const input = ref('')
// const getFunctionList = () => {
//   getMyFunctions().then((res: any) => {
//     if (res.code === 200) {
//       funcList.value = res.data
//       funcList.value.forEach((item: any) => {
//         if (item.function_code === 'CONTENDANALYSE') {
//           if (new Date(item.end_time.replace(' ', 'T')) < new Date()) {
//             endTime.value = '已到期'
//           } else {
//             endTime.value = item.end_time
//           }
//         }
//       })
//     }
//   })
// }
// getFunctionList()
</script>
<style scoped lang="scss">
.tool-name {
  width: 100%;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  line-height: 40px;
}
.tool-time {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .time-left {
    .time {
      margin-right: 10px;
    }
  }
}
.shopcart {
  border: 1px solid #eee;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .carttext {
    color: #000;
    line-height: 30px;
    span {
      color: #8b929b;
    }
  }
}
.page-container {
  display: flex;
  flex-direction: column;
}
::v-deep.requicontent {
  flex: 1;
  // background: red;
  margin-top: 20px;
  position: relative;
  overflow: hidden;
  // padding: 10px;
  .centcon {
    width: 100%;
    height: 100%;
    display: flex;
    position: absolute;
    // overflow-y: auto;
  }
  .conleft {
    border-right: 1px solid #eee;
    height: 100%;
    width: 200px;
    display: flex;
    flex-direction: column;
    .el-menu-vertical-demo {
      flex: 1;
      overflow-y: auto;
    }
    .conleft-top {
      padding: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      //text-align: center;
    }
    .el-sub-menu__icon-arrow {
      display: none;
    }
  }
  .conright {
    height: 100%;
    flex: 1;
    padding-left: 10px;
    overflow: hidden;
    .righttop {
      display: flex;
      flex-wrap: wrap;
    }
    .righttwo {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      .twoleft {
        display: flex;
        margin: 10px 0;
        div {
          margin-right: 10px;
        }
      }
    }
  }
  .menus {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #bbbbbb;
    font-size: 12px;
    .menusleft {
      color: #000;
    }
  }
}
</style>
