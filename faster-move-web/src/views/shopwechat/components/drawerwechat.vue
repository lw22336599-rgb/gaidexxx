<template>
  <div class="drawerwechat">
    <div class="conten">
      <!--    <h4 style="text-align: center">开启微信号推送</h4>-->
      <div class="shop-name" @click="handleOpenShop">{{ shopobj.name }}</div>
      <!--    <div>-->
      <!--      推送状态：<el-switch-->
      <!--      v-model="type"-->
      <!--      class="ml-2"-->
      <!--    />-->
      <!--    </div>-->
      <!--    <div class="addwxid">-->
      <!--      <div>推送微信号：</div>-->
      <!--      <div class="addwid">-->
      <!--        <div class="addwxidcont">-->
      <!--          <div class="fleximg">-->
      <!--            <el-checkbox v-model="checked" size="large" />-->
      <!--            <div class="imgbox"></div>-->
      <!--            <div class="name">name</div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--        <el-button @click="addwx" type="primary" :icon="Plus" text>绑定新微信号</el-button>-->
      <!--      </div>-->
      <!--    </div>-->
      <div>推送内容设置：</div>
      <div class="tscont">
        <div style="width:48%;height: fit-content;" v-for="item in tipslist" :key="item.name">
          <div class="caritem" v-if="item.show">
            <div class="carttop">
              <div>
                <div style="font-size: var(--el-font-size-base);">{{ item.name }}</div>
                <div v-if="item.name == '门店经营日报'" class="tstime">推送时间：
                  <el-time-select v-model="timetxet" style="width: 140px" start="06:00" step="01:00" end="20:00" />

                </div>
                <div v-if="item.name == '推广异常提醒'" class="tstime">推广金额低于：
                  <el-input v-model="MinAdBalance" style="width: 60px" />元提醒
                </div>
              </div>
              <div class="carttips">
                <el-switch v-if="item.show" v-model="item.Enable" class="ml-2" />
                <!-- <div style="color:var(--el-color-primary);cursor: pointer;font-size: var(--el-font-size-base);">立即推送</div> -->
                <div
                  style="color:var(--el-color-primary);cursor: pointer;font-size: var(--el-font-size-base);margin-top: 8px"
                  @click="jycal" v-if="item.name == '门店经营日报'">数据设置</div>
              </div>
            </div>

            <div style="font-size: var(--el-font-size-base);">{{ item.text }}</div>
          </div>
        </div>
      </div>
      <div class="inpulist">
        <el-checkbox v-model="checkedtop" size="large" />
        <div style="margin:0 5px;">为提醒内容加上前缀：</div>
        <el-input v-model="PushStrFirst" style="width: 400px;margin-right:5px" />
        <img src="../../../icon/wechattips.svg" alt="">
      </div>
      <div class="inpulist">
        <el-checkbox v-model="checkedlow" size="large" />
        <div style="margin:0 5px;">为提醒内容加上后缀：</div>
        <el-input v-model="PushStrLast" style="width: 400px;margin-right:5px" />
        <img src="../../../icon/wechattips.svg" alt="">
      </div>
      <div class="inpulist">
        <el-checkbox v-model="MarkTop" size="large" />
        <div style="margin:0 5px;">上升指标用 ↑ 标识</div>
        <img src="../../../icon/wechattips.svg" alt="" style="margin-right:10px">
        <el-checkbox v-model="MarkLow" size="large" />
        <div style="margin:0 5px;">下降指标用 ↓ 标识</div>
        <img src="../../../icon/wechattips.svg" alt="">
      </div>
      <div class="inpulist">
        <el-checkbox disabled v-model="CommandBind" size="large" />
        <div style="margin:0 5px;">开启指令绑定(此功能主要用于不在电脑前，使用指令给门店绑定微信号推送或微信群推送)</div>
      </div>
      <div class="diakey">
        <div class="keyitem">
          <div class="itemtext">
            <div style="margin:0 5px 0 0;">指令1:绑定微信号或者微信群</div>
            <img src="../../../icon/wechattips.svg" alt="">
          </div>
          <div style="color:var(--el-color-primary);">绑定+门店ID</div>
          <div class="itemtext">
            <div style="margin:0 5px 0 0;">指令4:查看已设置管理列表</div>
            <img src="../../../icon/wechattips.svg" alt="">
          </div>
          <div style="color:var(--el-color-primary);">查看管理员列表</div>
          <!-- <div class="itemtext">
          <div style="margin:0 5px 0 0;">指令3:机器人状态</div>
          <img src="../../../icon/wechattips.svg" alt="">
        </div>
        <div style="color:var(--el-color-primary);">查机器人状态</div> -->
        </div>
        <div class="keyitem">
          <div class="itemtext">
            <div style="margin:0 5px 0 0;">指令2:设置管理员</div>
            <img src="../../../icon/wechattips.svg" alt="">
          </div>
          <div style="color:var(--el-color-primary);">对任意微信好友发送设置管理员</div>

        </div>
        <div class="keyitem">
          <div class="itemtext">
            <div style="margin:0 5px 0 0;">指令3:取消管理员</div>
            <img src="../../../icon/wechattips.svg" alt="">
          </div>
          <div style="color:var(--el-color-primary);">对已设置的管理员发送取消管理员</div>
        </div>
      </div>
      <div style="color:#aaaaaa;margin-bottom: 10px;">(考虑到部分用户，机器人手机不经常带身边所以增加管理员功能，管理员也有权限发送指令绑定门店)</div>
    </div>
    <div class="foolter">
      <el-button type="primary" @click="setfuncobj">保存</el-button>
      <el-button @click="closedarw">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { Plus } from "@element-plus/icons-vue";
// const type = ref(true);
import { gp } from '/@vab/plugins/vab.ts'
import { openShopWindow } from '/@/utils/openShopWin'
const checkedtop = ref(true);
const checkedlow = ref(true);
// const input=ref('')
const timetxet = ref('08:00')
const MinAdBalance = ref(10)
const tipslist = ref([
  {
    name: '闭店监控',
    text: '监控门店在正常营业时段出现异常时提醒。',
    Enable: true,
    Time: null,
    type: 'PushNormalClose',
    show: false,
  },
  {
    name: '推广异常提醒',
    text: '监控门店推广余额不足及出价冲突时提醒。',
    Enable: true,
    type: 'PushNormalAd',
    Time: null,
    MinAdBalance: 10,
    show: false,
  },
  {
    name: '新增评价提醒',
    text: '推送昨日门店新增评价数量。',
    Enable: true,
    Time: null,
    type: 'PushBadComment',
    show: false,
  },
  {
    name: '门店经营日报',
    text: '昨日经营数据，一键推送掌握',
    Enable: true,
    type: 'PushShopReport',
    Time: null,
    EnableFields: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    show: false,
  },
  {
    name: '到期提醒',
    text: '门店功能到期前7天自提醒，避免服务中断。',
    Enable: false,
    type: 'PushShopEndTime',
    Time: null,
    show: false,
  },
  {
    name: '店铺掉线提醒',
    text: '门店状态实时监控，掉线立即通知。',
    Enable: true,
    type: 'PushShopOut',
    Time: null,
    show: false,
  }
])

const props = defineProps({
  tsshopobj: Object,
  funcdata: Object,
})
const PushStrFirst = ref<String>('');
const PushStrLast = ref<String>('');
const MarkTop = ref<boolean>(true)
const MarkLow = ref<boolean>(true)
const CommandBind = ref<boolean>(true)
let shopobj = ref<any>({ name: '' })
const emit = defineEmits(['sethaddwechat', 'setqaddwechat', 'setrbwechat', 'setdrawer', 'setfuncdata']);
const addwx = () => {
  // emit('setqaddwechat',true)
  emit('sethaddwechat', true)
}
const jycal = () => {
  emit('setrbwechat', true)
}
const closedarw = () => {
  emit('setdrawer', false)
}
const handleOpenShop = async () => {
  if (shopobj.value && shopobj.value.id) {
    await openShopWindow(shopobj.value)
  } else {
    gp.$baseMessage('店铺信息不完整，无法打开店铺后台', 'error')
  }
}
const setfuncobj = () => {
  let obj = { MarkTop: MarkTop.value, MarkLow: MarkLow.value, CommandBind: CommandBind.value };
  if (PushStrFirst.value) {
    obj.PushStrFirst = PushStrFirst.value
  } else {
    obj.PushStrFirst = null
  }
  if (PushStrLast.value) {
    obj.PushStrLast = PushStrLast.value
  } else {
    obj.PushStrLast = null
  }
  tipslist.value.map(item => {
    // {PushShopOut:{Enable:true}}
    let key = item.type;
    obj[key] = { Enable: item.Enable, Time: item.Time }
    if (key == 'PushNormalAd') {
      obj[key].MinAdBalance = item.MinAdBalance
      obj[key].MinAdBalance = MinAdBalance.value
    }
    if (key == 'PushShopReport') {
      obj[key].EnableFields = item.EnableFields
      obj[key].Time = timetxet.value
    }
    // if(key=='PushShopReport'){
    // }
  })
  console.log(obj, "obj");
  // return;
  emit('setfuncdata', obj)
  // closedarw()
}
watch(props, () => {
  shopobj.value = props.tsshopobj;
  MarkTop.value = props.funcdata.ConfObj.MarkTop;
  MarkLow.value = props.funcdata.ConfObj.MarkLow;
  CommandBind.value = props.funcdata.ConfObj.CommandBind;
  PushStrFirst.value = props.funcdata.ConfObj.PushStrFirst || '新的一天祝您单量节节高！';
  PushStrLast.value = props.funcdata.ConfObj.PushStrLast || '以上是为您整理的店铺昨日经营数据。';
  // if(shopobj.value.shop_type==2){
  //   tipslist.value=[{
  //   name:'到期提醒',
  //   text:'门店功能到期前7天自提醒，避免服务中断。',
  //   Enable:false,
  //   type:'PushShopEndTime',
  //   Time:null,
  //   show:false,
  // },
  // {
  //   name:'店铺掉线提醒',
  //   text:'门店状态实时监控，掉线立即通知。',
  //   Enable:true,
  //   type:'PushShopOut',
  //   Time:null,
  //   show:false,
  // }]
  // }
  tipslist.value = tipslist.value.map(item => {
    for (let key in props.funcdata.ConfObj) {
      if (key == item.type) {
        item.Enable = props.funcdata.ConfObj[key].Enable
        item.Time = props.funcdata.ConfObj[key].Time
        if (key == 'PushNormalAd') {
          item.MinAdBalance = props.funcdata.ConfObj[key].MinAdBalance
          MinAdBalance.value = item.MinAdBalance || 10
        }
        if (key == 'PushShopReport') {
          item.EnableFields = props.funcdata.ConfObj[key].EnableFields
          timetxet.value = item.Time || '08:00'
        }

      }
    }
    return item
  })
  // 所有店铺类型都显示所有推送内容
  tipslist.value = tipslist.value.map(item => {
    item.show = true;
    return item
  })
  console.log(tipslist.value, "tipslist.valu");

}, { deep: true, immediate: true })

</script>

<style scoped lang="scss">
::v-deep.drawerwechat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  //   overflow-x: auto;
  .shop-name {
    cursor: pointer;
    color: var(--el-color-primary);
    font-weight: 500;
    margin-bottom: 10px;

    &:hover {
      text-decoration: underline;
    }
  }

  .tstime {
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-base);
    margin-top: 5px;
  }

  .conten {
    flex: 1;
    overflow-y: auto;
  }

  .addwxid {
    .addwid {
      flex: 1;
      min-height: 100px;
      max-height: 200px;
      overflow: hidden;
    }

    display: flex;
    width: 100%;

    .addwxidcont {
      width: 300px;
      overflow-y: auto;
      border: 1px solid #eee;
      padding: 10px;

      .fleximg {
        display: flex;
        align-items: center;

        .imgbox {
          width: 50px;
          height: 50px;
          background: #d3d3d3;
          margin: 0 10px;

          img {
            height: 100%;
            width: 100%;
          }
        }

        .name {
          font-weight: 600;
        }
      }
    }
  }

  .tscont {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 10px;

    .caritem {
      font-size: 12px;
      width: 100%;
      min-width: 150px;
      min-height: 100px;
      background: #fafafa;
      padding: 10px 10px;
      box-sizing: border-box;
      //   margin-right: 10px;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;

      .carttop {
        flex: 1;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
    }

    .carttips {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }

  .inpulist {
    display: flex;
    align-items: center;

    .el-checkbox {
      margin-right: 0;
    }
  }

  .diakey {
    display: flex;

    .keyitem {
      flex: 1;
      margin-right: 5px;

      .itemtext {
        display: flex;
        flex-wrap: wrap;
        margin-top: 5px;
        margin-bottom: 5px;
      }
    }
  }

  .foolter {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>