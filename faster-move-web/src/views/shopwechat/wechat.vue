<template>
  <div class="page-container">
    <div class="wechat-title">
      <div class="titleleft">
        <div class="titletext">微信机器人账号</div>
        <el-button style="margin-left: 10px" type="primary" @click="opennewurl">下载机器人</el-button>
      </div>
      <div class="tittleright">
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button
          style="background: var(--el-color-primary); border-color: var(--el-color-primary)"
          type="danger"
          @click="setlogshow(true)"
          >添加机器人</el-button
        >
      </div>
    </div>
    <div class="wechat-table">
      <wechattableVue
        :tablist="tablist"
        @setmanageshow="setmanageshow"
        @setlogshow="setlogshow"
        @settableData="settableData"
      />
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog v-model="logshow" title="机器人配置" width="750" center>
      <div class="ridoset">
        <div class="dialogtitle">请在下方填入服务器地址:</div>
        <el-input v-model="textarea" resize="none" style="width: 100%" placeholder="请输入" />

        <!--        </div>-->
        <div class="botbox">
          <el-button type="info" @click="setlogshow(false)">取消</el-button>
          <el-button type="danger" @click="save">保存</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="manageshow" title="管理员列表" style="width: 450px">
      <manager :tableData="tableData" @setmanageshow="setmanageshow" />
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import wechattableVue from './components/wechattable.vue'
import { gp } from '/@vab/plugins/vab.ts'
import { useUserStore } from '/@/store/modules/user'
import { newaxios } from '/@/api/setaxios'
import manager from './components/manager.vue'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { ChatType } from '/@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import { toWechatRobotItems, type WechatRobotItem } from '/@/types/wechatRobot'
let currentPage = ref(1)
let pageSize = ref(10)
let logshow = ref<Boolean>(false)
let textarea = ref<String>('')
let dxradio = ref(true)
let addradio = ref(true)
let jionradio = ref(false)
let sendradio = ref(false)
let checkList = ['ab']
let total = ref(0)
let manageshow = ref<Boolean>(false)
let tableData = ref([])
const tablist = ref<any>([])

const setlogshow = (val: Boolean) => {
  logshow.value = val
}
const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`)
  currentPage.value = val
  getwex()
}
const handleCurrentChange = (val: number) => {
  // console.log(`current page: ${val}`)
  pageSize.value = val
  getwex()
}
const save = () => {
  if (!textarea.value) {
    gp.$baseMessage('请填写地址', 'error', 'hey')
    return
  }
  textarea.value = textarea.value.trim()
  let arr = textarea.value.split('?')
  let url = arr[0]
  let arrtext = arr[1].split('&')
  let text = ''
  arrtext.map(item => {
    if (item.indexOf('ClientKey') != -1) {
      text = item.split('=')[1]
    }
  })
  // console.log(url,text);
  if (!url || !text) {
    gp.$baseMessage('请填写正确的地址', 'error', 'hey')
    return
  }
  let roidobj = { url: url, ClientKey: text }
  localStorage.setItem('roidobj', JSON.stringify(roidobj))
  const userStore = useUserStore()
  const { token } = userStore
  newaxios({
    method: 'GET',
    url: url + 'ChatClient/GetMyInfo',
    headers: {
      Token: token,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ClientKey: text
    },
    timeout: 5000
  })
    .then(res => {
      // console.log(res);
      let { data } = res
      let newdata = data.data
      newdata.type = 1
      getwex()
      // tablist.value=[newdata];
      localStorage.setItem('roadilist', tablist.value)
      // console.log(tablist.value,"tablist.value");
      gp.$baseMessage('添加成功', 'success', 'hey')
      setlogshow(false)
    })
    .catch(err => {
      // console.log(err);
      gp.$baseMessage('添加失败', 'error', 'hey')
      // setlogshow(false)
    })
}

const refresh = () => {
  getwex()
  //   let roadilist=localStorage.getItem('roadilist')
  //   if(roadilist&&roadilist.length){
  //     tablist.value=roadilist;
  //   }
  //   let roidtext:string|null=localStorage.getItem('roidobj')
  //   if(!roidtext){
  //   return;
  // }
  //   let roidobj=JSON.parse(roidtext)
  //   const userStore = useUserStore()
  //   const { token } = userStore
  // newaxios({
  //   method: 'GET',
  //   url: roidobj.url+'ChatClient/GetMyInfo',
  //   headers: {
  //     'Token': token,
  //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //     'ClientKey':roidobj.ClientKey
  //   },
  //   timeout: 5000
  // }).then(res=>{
  //   // console.log(res);
  //   let {data}=res;
  //   let newdata=data.data;
  //   newdata.type=1;
  //   tablist.value=[newdata];
  //   // console.log(tablist.value,"tablist.value");
  // }).catch(err=>{
  //   // console.log(err);
  //   tablist.value=tablist.value.map(item=>{
  //     item.type=0;
  //     return item;
  //   })
  // })
}
const setmanageshow = (val: Boolean) => {
  manageshow.value = val
}
const settableData = (val: Array) => {
  tableData.value = val
}
const opennewurl = () => {
  globalThis.electron.opennewurl('https://share.feijipan.com/s/8REUnpZT', '机器人下载')
}

const getwex = () => {
  apiManager.chatMgApi.GetPageList(currentPage.value, pageSize.value).then(data => {
    console.log(data)
    total.value = data.total

    // 先过滤微信类型的机器人（排除 Webhook 类型）
    const wechatRobots = data.rows.filter(item => {
      const chatType = item.chat_type
      // 只保留微信PC、微信iPad、微信Web类型
      return chatType === ChatType.WechatPc || chatType === ChatType.WechatIpad || chatType === ChatType.WechatWeb
    })

    // 转换为扩展类型（添加 type 字段，表示是否在线）
    tablist.value = toWechatRobotItems(wechatRobots)
  })
}
onMounted(() => {
  getwex()
})
</script>
<style scoped lang="scss">
.wechat-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // height: 68px;
  .titleleft {
    display: flex;
    align-items: center;

    .titletext {
      font-weight: 500;
      font-size: 20px;
      color: #333333;
      margin-right: 10px;
    }

    .texttips {
      font-size: 14px;
      color: #999999;
      margin-right: 5px;
    }

    .tipimg {
      width: 10px;
      height: 10px;
    }
  }
}

::v-deep .ridoset {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;

  .el-checkbox__inner {
    border-radius: 50%;
  }

  .is-checked {
    .el-checkbox__inner {
      background-color: #fe0000;
      border-color: #fe0000;
    }

    .el-checkbox__label {
      color: var(--el-checkbox-text-color);
    }
  }

  // align-items: center;
  .dialogtitle {
    width: 100%;
    font-size: 16px;
    color: #333333;
    margin: 5px;
  }

  .botbox {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }
}
</style>
