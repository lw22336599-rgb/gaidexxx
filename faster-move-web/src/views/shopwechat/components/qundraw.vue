<template>
  <div class="drawerwechat">
    <h4 style="text-align: center">开启微信群推送</h4>
    <div>当前门店名称：{{ shopobj.name}}</div>
    <div>
      推送状态：<el-switch
      v-model="type"
      class="ml-2"
    />
    </div>
    <div class="addwxid">
      <div>推送微信群：</div>
      <div class="addwid">
        <div class="addwxidcont">
          <div class="fleximg">
            <el-checkbox v-model="checked" size="large" />
            <div class="imgbox"></div>
            <div class="name">name</div>
          </div>
        </div>
        <el-button @click="addwx" type="primary" :icon="Plus" text>绑定新微信群</el-button>
      </div>
    </div>
    <div>推送内容设置：</div>
    <div class="tscont">
      <div class="caritem" v-for="item in tipslist" :key="item.name">
        <div class="carttop">
          <div style="font-size: var(--el-font-size-base);">{{item.name}}</div>
          <div class="carttips">
            <el-switch
              v-model="type"
              class="ml-2"
            />
            <div style="color:var(--el-color-primary);cursor: pointer;font-size: var(--el-font-size-base);">立即推送</div>
            <div style="color:var(--el-color-primary);cursor: pointer;font-size: var(--el-font-size-base);margin-top: 8px;" @click="jycal" v-if="item.name=='门店经营日报'">数据设置</div>
          </div>
        </div>
        <div style="font-size: var(--el-font-size-base);">{{item.text}}</div>
      </div>
    </div>
    <div class="inpulist">
      <el-checkbox v-model="checked" size="large" />
      <div style="margin:0 5px;">为提醒内容加上前缀：</div>
      <el-input v-model="input" style="width: 400px;margin-right:5px;"/>
      <img src="../../../icon/wechattips.svg" alt="">
    </div>
    <div class="inpulist">
      <el-checkbox v-model="checked" size="large" />
      <div style="margin:0 5px;">为提醒内容加上后缀：</div>
      <el-input v-model="input" style="width: 400px;margin-right:5px"/>
      <img src="../../../icon/wechattips.svg" alt="">
    </div>
    <div class="inpulist">
      <el-checkbox v-model="checked" size="large" />
      <div style="margin:0 5px;">上升指标用 ↑ 标识</div>
      <img src="../../../icon/wechattips.svg" alt="" style="margin-right:10px">
      <el-checkbox v-model="checked" size="large" />
      <div style="margin:0 5px;">下降指标用 ↓ 标识</div>
      <img src="../../../icon/wechattips.svg" alt="">
    </div>
    <div class="inpulist">
      <el-checkbox v-model="checked" size="large" />
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
          <div style="margin:0 5px 0 0;">指令3:机器人状态</div>
          <img src="../../../icon/wechattips.svg" alt="">
        </div>
        <div style="color:var(--el-color-primary);">查机器人状态</div>
      </div>
      <div class="keyitem">
        <div class="itemtext">
          <div style="margin:0 5px 0 0;">指令2:设置管理员</div>
          <img src="../../../icon/wechattips.svg" alt="">
        </div>
        <div style="color:var(--el-color-primary);">对任意微信好友发送设置管理员</div>
        <div class="itemtext">
          <div style="margin:0 5px 0 0;">指令4:查看已设置管理列表</div>
          <img src="../../../icon/wechattips.svg" alt="">
        </div>
        <div style="color:var(--el-color-primary);">查管理员列表</div>
      </div>
      <div class="keyitem">
        <div class="itemtext">
          <div style="margin:0 5px 0 0;">指令5:取消管理员</div>
          <img src="../../../icon/wechattips.svg" alt="">
        </div>
        <div style="color:var(--el-color-primary);">对已设置的管理员发送取消管理员</div>
      </div>
    </div>
    <div style="color:#aaaaaa">(考虑到部分用户，机器人手机不经常带身边所以增加管理员功能，管理员也有权限发送指令绑定门店)</div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
const type = ref(true);
const checked = ref(true);
const input=ref('')
const props=defineProps({
  tsshopobj:Object
})
let shopobj=ref({name:''})
const tipslist=ref([
  {
    name:'闭店监控',
    text:'监控门店在正常营业时段出现异常时提醒。',
  },
  {
    name:'推广异常提醒',
    text:'监控门店推广余额不足及出价冲突时提醒。',
  },
  {
    name:'中差评提醒',
    text:'监控门店出现中差评时隔天提醒。',
  },
  {
    name:'门店经营日报',
    text:'昨日经营数据，一键推送掌握',
  },
  {
    name:'到期提醒',
    text:'门店功能到期前7天自提醒，避免服务中断。',
  },
  {
    name:'店铺掉线提醒',
    text:'门店状态实时监控，掉线立即通知。',
  }
])
const emit = defineEmits(['sethaddwechat','setqaddwechat','setrbwechat']);
const addwx=()=>{
  emit('setqaddwechat',true)
  // emit('sethaddwechat',true)
}
const jycal=()=>{
  emit('setrbwechat',true)
}
watch(props,()=>{
  shopobj.value=props.tsshopobj;
},{deep:true,immediate:true})
</script>

<style scoped lang="scss">
::v-deep.drawerwechat {
  width: 100%;
  height: 100%;
  //   overflow-x: auto;
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
      height: 100px;
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
      width: 48%;
      min-width: 150px;
      min-height: 100px;
      background: #fafafa;
      padding: 10px 10px;
      box-sizing: border-box;
      //   margin-right: 10px;
      margin-bottom: 10px;
      .carttop {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
    }
    .carttips{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
  .inpulist{
    display: flex;
    align-items: center;
    .el-checkbox{
      margin-right:0 ;
    }
  }
  .diakey{
    display: flex;
    .keyitem{
      flex: 1;
      margin-right: 5px;
      .itemtext{
        display: flex;
        flex-wrap: wrap;
        margin-top: 5px;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
