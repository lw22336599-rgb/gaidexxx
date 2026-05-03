<template>
  <el-dialog v-model="payDialogStateCom" :before-close="handleClose" title="极狐" width="900">
    <div class="shop">
      <div class="shoptop">
        <img alt="" src="/@/assets/shop_images/icon_005a.png" style="width:170px;height:170px" />
        <div style="flex: 1;box-sizing: border-box;padding: 15px;">
          <div class="title">极狐</div>
          <div>价格：<span :style="{ color: '#E02020' }">{{ currentMeal.cost }}积分</span></div>
          <div class="guigebox">
            <div>规格：</div>
            <div style="width: calc(100% - 50px); display: flex; flex-wrap: wrap; justify-content: space-between;">
              <div v-for="item in kmList" :key="item.id" class="meal-item"
                :class="{ 'is-meal-item': currentId === item.price_id }" @click="setActive(item)">
                <div>{{ item.showStr }}</div>
                <img v-show="currentId === item.price_id" alt="" class="postion"
                  src="/@/assets/shop_images/icon_004a.png" />
              </div>
            </div>
          </div>
          <el-button style="margin: 0 0 0 42px" type="primary" @click="payDialogStatus">立即订购</el-button>
        </div>
      </div>
      <div v-if="payTypeText === '全功能'" class="fuwuconten">
        <div class="title">服务介绍</div>
        <div class="cartlist">
          <vab-card v-for="item in cartList" :key="item.name" class="cartitem">
            <img alt="" :src="item.img" />
            <div>
              <p>{{ item.name }}</p>
              <p>{{ item.text }}</p>
            </div>
          </vab-card>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-if="payShow" v-model="payShow" center style="margin-top:300px" title="支付确认" width="400px">
    <div class="pay-box">
      <div class="pay-con">
        <div class="pay-tips">订单信息</div>
        <div class="pay-item">
          <div>应用名称</div>
          <div>极狐</div>
        </div>
        <div class="pay-item">
          <div>版本信息</div>
          <div>{{ currentMeal.showStr }}</div>
        </div>
        <div class="pay-item">
          <div>版本时长</div>
          <div>{{ currentMeal.add_time }}天</div>
        </div>
      </div>
      <div style="width:100%;display:flex;justify-content:center;align-items: center;margin-top: 20px">
        <el-button :loading="loading" type="primary" @click="submit">立即订购</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { getFunctionPriceList, payForAdminFunc } from '/@/api/shop.ts'
import { gp } from "/@vab/plugins/vab.ts";
import dgicon1 from "/@/assets/shop_images/dgicon1.png"
import dgicon3 from "/@/assets/shop_images/dgicon2.png"
import dgicon4 from "/@/assets/shop_images/dgicon3.png"
import dgicon5 from "/@/assets/shop_images/dgicon4.png"
import dgicon6 from "/@/assets/shop_images/dgicon5.png"
const props = defineProps<{
  shopType: number | string;
  payTypeText: string;
  payDialogState: boolean
}>();
const payDialogStateCom = computed(() => props.payDialogState)

const emit = defineEmits(['closeDialog', 'paySuccess']);
const payShow = ref(false);
const loading = ref(false);
const kmList = ref<any>([]);
const cartList = ref([
  { img: dgicon1, name: '支持pc/移动端', text: '操作便捷 提高效率' },
  { img: dgicon1, name: '一键登录', text: '多账号便捷管理' },
  { img: dgicon3, name: '防漏单助手', text: '提高订单及时率' },
  { img: dgicon4, name: 'IM回复', text: '消息自动回复' },
  { img: dgicon5, name: '自动回评', text: '自动回复好评差评' },
  { img: dgicon6, name: '智能点金', text: 'AI智能推广' },
  // { img: require('../../image/dgimg/dgicon6.png'), name: '菜品美化', text: '一键美化菜品图片' },
  // { img: require('../../image/dgimg/dgicon7.png'), name: '评分预测', text: '精准预测明日评分' },
]);
const currentId = ref('')
const currentMeal = ref({})
const setActive = (item: any) => {
  currentId.value = item.price_id;
  currentMeal.value = item
};

const submit = async () => {
  loading.value = true;
  const params = {
    shoptype: props.shopType,
    func_price: currentId.value,
  };
  payForAdminFunc(params).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('续费成功！', 'success', 'hey')
      payShow.value = false
      emit('paySuccess')
    }
  }).finally(() => {
    loading.value = false;
  })
};

const getKmListData = async () => {
  if (props.payTypeText) {
    const params = {
      shoptype: props.shopType,
      pricetitle: `${props.payTypeText}_月`,
      isKeyWord: true,
    };
    try {
      const res: any = await getFunctionPriceList(params);
      if (res.code === 200) {
        kmList.value = res.data;
        if (props.payTypeText === '全功能') {
          await getAppServe();
        }
        kmList.value.forEach((item: any) => {
          let showStr;
          if (item.func_name === '全功能_月') {
            showStr = `一个月（全功能）·${item.add_time}天·${item.cost}积分`;
          } else if (item.func_name === 'APP数据服务_月') {
            showStr = `一个月（美团运营版服务）·${item.add_time}天·${item.cost}积分`;
          } else {
            showStr = `一个月（${item.func_name.slice(0, -2)}）·${item.add_time}天·${item.cost}积分`;
          }
          item.showStr = showStr;
        });
        setActive(kmList.value[0])
      }
    } catch (error) {
      console.error('获取功能价格列表失败:', error);
    }
  }
};

const getAppServe = async () => {
  const params = {
    shoptype: props.shopType,
    pricetitle: 'APP数据服务_月',
    isKeyWord: true,
  };
  try {
    const res: any = await getFunctionPriceList(params);
    if (res.code === 200) {
      kmList.value.push(...res.data);
    }
  } catch (error) {
    console.error('获取APP服务价格失败:', error);
  }
};

const handleClose = () => {
  emit('closeDialog')
}
const payDialogStatus = () => {
  payShow.value = true;
}
getKmListData();
</script>
<style scoped lang="scss">
.shop {
  padding-bottom: 20px;

  .shoptop {
    display: flex;
    font-size: 14px;
    width: 100%;

    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .guigebox {

      display: flex;
      border-top: 1px solid #DFDFDF;
      padding-top: 15px;
      margin-top: 15px;


    }

    .buton {
      width: 107px;
      height: 32px;
      background: #FF9D0A;
      border-radius: 4px;
      font-size: 16px;
      text-align: center;
      line-height: 32px;
      color: #fff;
      margin-left: 41px;
    }
  }

  .cart {
    border: 1px solid #666;
    width: 48%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin-bottom: 20px;
    position: relative;
  }

  .postion {
    position: absolute;
    right: 0;
    bottom: 0;
  }

  .fuwuconten {
    border-top: 1px solid #DFDFDF;
    padding: 10px;
    margin-top: 15px;

    .title {
      font-size: 16px;
      margin-bottom: 15px;
    }

    .cartlist {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-self: start;
      justify-content: space-between;

      .cartitem {
        :deep() {
          .el-card__body {
            display: flex;
            width: 400px;
            height: 130px;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;

            img {
              width: 130px;
              height: 130px;
              margin-right: 10px;
            }

            >div {
              font-size: 14px;

              p:nth-of-type(1) {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
              }
            }
          }
        }
      }
    }
  }

}

.pay-box {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 20px;

  .pay-con {
    .pay-tips {
      font-size: 16px;
      margin-bottom: 16px;
    }

    .pay-item {
      font-size: 14px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
  }
}

.meal-item {
  height: 34px;
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  width: 100%;
  border: 1px solid #333;
  line-height: 34px;
  text-align: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.is-meal-item {
  border: 1px solid #E02020;
  position: relative;
}
</style>