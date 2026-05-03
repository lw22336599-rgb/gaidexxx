<template>
  <div class="page-container">
    <div class="tswechat-top">
      <div class="tswechatleft">
        <div class="tabs">
          <div :class="funstate == 1 ? 'yitab' : 'weitab'" @click="setfunstate(1)">已激活</div>
          <div :class="funstate == 5 ? 'yitab' : 'weitab'" @click="setfunstate(5)">未激活</div>
        </div>
        <div class="mdtabs">
          <div class="mdtitle">门店:</div>
          <el-cascader v-model="grouvalue" clearable :options="groupOptions" placeholder="请选择分组"
            :props="{ checkStrictly: true }" :show-all-levels="false" @change="handleChangeGroup" />
          <!--          <el-select v-model="grouvalue" placeholder="全部分组" >-->
          <!--            <el-option-->
          <!--              v-for="item in options"-->
          <!--              :key="item.value"-->
          <!--              :label="item.label"-->
          <!--              :value="item.value"-->
          <!--            />-->
          <!--          </el-select>-->
          <el-cascader v-model="city" clearable :collapse-tags="true" :options="cityList" placeholder="请选择城市"
            :props="{ multiple: true }" :show-all-levels="false" @change="handleChangeCity" />

          <el-input :prefix-icon="Search" v-model="queryParams.filter.word" style="width:240px"
            placeholder="输入门店名称或id或备注" @change="getshop()" />
        </div>
      </div>


      <div class="tswechatright">
        <template v-if="funstate == 1">
          <span v-if="localShopList.length > 0" class="batch-count"
            :class="{ 'batch-over-limit': localShopList.length > 200 }">
            已选 {{ localShopList.length }} 家{{ localShopList.length > 200 ? '（超过200无法执行）' : '' }}
          </span>
          <el-button type="primary" size="small" :disabled="localShopList.length > 200"
            @click="triggerBatchEnable(true)">批量开启</el-button>
          <el-button type="warning" size="small" :disabled="localShopList.length > 200"
            @click="triggerBatchEnable(false)">批量关闭</el-button>
          <el-button type="success" size="small" :disabled="localShopList.length > 200"
            @click="triggerBatchConfig">批量更新配置</el-button>
          <!-- <el-button type="info" size="small" :disabled="localShopList.length > 200"
            @click="triggerBatchPushNow">批量立即推送</el-button> -->
          <el-button v-if="localShopList.length > 0" type="default" size="small"
            @click="clearBatchSelection">清空选择</el-button>
        </template>
      </div>
    </div>

    <tswechattable ref="tswechattableRef" @getfuncdata="getfuncdata" @chatpushchang="chatpushchang"
      @getman="(bindTargetType) => getman(bindTargetType)" @setpayDialogState="setpayDialogState" @opendio="opendio"
      :totalnum="totalnum" :loadshow="loadshow" :tablelist="tablelist as any" @sethaddwechat="sethaddwechat"
      @setdrawer="setdrawer" @setqaddwechat="setqaddwechat" :funstate="funstate" @changeState="handleChangeState"
      @shopSelectionChange="onShopSelectionChange">
    </tswechattable>
    <el-pagination v-model:current-page="queryParams.page" background v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 40]" layout="total, sizes, prev, pager, next, jumper" :total="totalnum"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    <el-drawer :destroy-on-close="true" v-model="haddwechat" :title="wechatFriendDrawerTitle" size="800px"
      direction="rtl">
      <template #default>
        <addhao @setcheckfrien="setcheckfrien" @unbindingwx="unbindingwx" @filterbinding="filterbinding"
          @initfilterbinding="initfilterbinding" @bindingwx="bindingwx" :shopobj="shopobj"
          @filterfriendlist="filterfriendlist" :wxfriendlist="wxfriendlist" :tableData="tableData"
          @sethaddwechat="sethaddwechat" @getwxfriend="getwxfriend" :friend-list-params="friendListParams"></addhao>
      </template>
    </el-drawer>
    <el-drawer :destroy-on-close="true" v-model="qaddwechat" :title="wechatGroupDrawerTitle" size="800px"
      direction="rtl">
      <template #default>
        <addquan @setcheckflock="setcheckflock" @unbindingwx="unbindingwx" @filterbinding="filterbinding"
          @initfilterbinding="initfilterbinding" @bindingwx="bindingwx" :shopobj="shopobj"
          @filterfloclist="filterfloclist" :tableData="tableData" :wxfloclist="wxfloclist"
          @setqaddwechat="setqaddwechat" @getwxflock="getwxflock" :group-list-params="groupListParams"></addquan>
      </template>
    </el-drawer>
    <el-drawer :destroy-on-close="true" v-model="webhookDrawer" :title="webhookDrawerTitle" size="800px"
      direction="rtl">
      <template #default>
        <addwebhook :robots="webhookRobots" :bound-webhook-ids="boundWebhookIds" @binding-webhook="bindingWebhook"
          @unbinding-webhook="unbindingWebhook" @close="setWebhookDrawer(false)" />
      </template>
    </el-drawer>
    <el-dialog v-model="rbwechat" title="经营日报推送数据设置" width="450" style="height:350px">
      <rbwechatdia @setEnableFields="setEnableFields" :funcdata="funcdata" @setrbwechat="setrbwechat"></rbwechatdia>
    </el-dialog>
    <el-drawer body-class="bodybox" :size="sizenum" :with-header="false" v-model="drawer" direction="rtl">
      <template #default>
        <drawerwechat :funcdata="funcdata" @setfuncdata="setfuncdata" @setdrawer="setdrawer" :tsshopobj="shopobj"
          @sethaddwechat="sethaddwechat" @setqaddwechat="setqaddwechat" @setrbwechat="setrbwechat"></drawerwechat>
      </template>
    </el-drawer>
    <!-- <el-drawer body-class="bodybox" :size="sizenum" :with-header="false" v-model="qundrawer" direction="rtl">
      <template #default>
        <qundrawervue :tsshopobj="tsshopobj" @sethaddwechat="sethaddwechat" @setqaddwechat="setqaddwechat" @setrbwechat="setrbwechat"></qundrawervue>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button type="primary">保存</el-button>
          <el-button @click="setqundrawer(fasle)">取消</el-button>
        </div>
      </template>
    </el-drawer> -->
    <paydome v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="typetext" :shop-data="shopobj"
      @close-dialog="closePayDialog" @pay-success="paySuccess"></paydome>
    <el-dialog v-model="tutorialsDialogState" :close-on-click-modal="false" :destroy-on-close="true"
      :title="currentTutorials" width="900px" @close="closeTutorialsDialog">
      <div style="padding-bottom: 20px">
        <vab-player :config="configMp4" style="background-color: rgba(0, 0, 0, 0.87)" />
      </div>
    </el-dialog>
    <BatchSelectShopsDialog v-model="batchSelectShopsDialogVisible" :shop-type="shopType" :function-code="'CHATPUSH'"
      :action-title="pendingBatchActionTitle" @confirm="onBatchSelectShopsConfirm" />
    <BatchChatPushConfigDialog v-model="batchConfigDialogVisible"
      :shop-list="batchConfigShops.length ? batchConfigShops : localShopList" :shop-type="shopType"
      @success="onBatchConfigSuccess" />
    <BatchFailDialog v-model="batchFailDialogVisible" :success-count="batchFailSuccessCount"
      :failed-list="batchFailList" />
  </div>

</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import tswechattable from './components/tswechattable.vue';
import addhao from "./components/addhao.vue";
import addquan from "./components/addquan.vue";
import addwebhook from "./components/addwebhook.vue";
import rbwechatdia from './components/rbwechat.vue'
import drawerwechat from './components/drawerwechat.vue'
// import  qundrawervue from './components/qundraw.vue'
import paydome from '../shop/componentsV2/PayDialog.vue'
import BatchSelectShopsDialog from './components/BatchSelectShopsDialog.vue'
import BatchChatPushConfigDialog from './components/BatchChatPushConfigDialog.vue'
import BatchFailDialog from './components/BatchFailDialog.vue'
import { computed, onMounted, watch } from 'vue';
// import { getCity, getGroup, getShopV2, setconf_func, enableFunc, getConfFunc } from '/@/api/shop.ts' // 已替换为 TsModel API
import { newaxios } from "/@/api/setaxios"
import { gp } from '/@vab/plugins/vab.ts'
import { uniqueId } from 'lodash-es'
import { useUserStore } from '/@/store/modules/user'
import { ChatType } from '/@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { toWechatRobotItems, type WechatRobotItem } from '/@/types/wechatRobot'
import type { TreeData } from '/@/TsModel/Alien/Entity/TreeData'
import type { t_wmt_group } from '/@/TsModel/Alien/Entity/Tables/t_wmt_group'
import type { ChatMemberItem } from '/@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import type { ChatPushFuncData, ShopListItemWithChatPush, BindWxParams } from '/@/types/chatPush'
import type { t_chat_push_list } from '/@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { useRoute } from 'vue-router'
// import PayDialog from '/@/views/shop/components/PayDialog.vue'

// 获取当前路由
const route = useRoute()
// 从路由 meta 中获取店铺类型，默认为 1（美团外卖）
const shopType = computed(() => (route.meta?.type as number) || 1)

const mdvalue = ref('')
const grouvalue = ref('')
const tutorialsDialogState = ref(false)
const currentTutorials = ref('使用教程')
const configMp4 = reactive({
  url: '',
  id: uniqueId('uuid_mp4_'),
  lang: 'zh',
  volume: 0,
  autoplay: true,
  screenShot: true,
  playbackRate: [0.5, 0.75, 1, 1.5, 2],
  fluid: true,
},)
// const cityvalue = ref('')
// const typevalue = ref('')
const mdname = ref('')
let loadshow = ref<boolean>(true)
const drawer = ref<boolean>(false)
let haddwechat = ref<boolean>(false)
let qaddwechat = ref<boolean>(false)
let webhookDrawer = ref<boolean>(false)
let rbwechat = ref<boolean>(false)
const sizenum = ref<string>('800px')
// let qundrawer=ref<boolean>(false)
let payDialogState = ref<boolean>(false)
let groupOptions = ref<TreeData<t_wmt_group>[]>([])
const tswechattableRef = ref<InstanceType<typeof tswechattable> | null>(null)
const batchSelectShopsDialogVisible = ref(false)
const batchConfigDialogVisible = ref(false)
const batchConfigShops = ref<any[]>([])
const batchFailDialogVisible = ref(false)
const batchFailSuccessCount = ref(0)
const batchFailList = ref<{ ShopId: string; Reason: string }[]>([])
type PendingBatchAction = 'enable' | 'disable' | 'config' | 'push' | null
const pendingBatchAction = ref<PendingBatchAction>(null)
const pendingBatchActionTitle = computed(() => {
  const map: Record<NonNullable<PendingBatchAction>, string> = {
    enable: '批量开启',
    disable: '批量关闭',
    config: '批量更新配置',
    push: '批量立即推送'
  }
  return pendingBatchAction.value ? map[pendingBatchAction.value] : ''
})
const importedShops = ref<any[]>([])
const tableSelectedRows = ref<any[]>([])
const getShopId = (s: { id?: string; shop?: string }) => s.id ?? s.shop ?? ''

const localShopList = computed(() => {
  const byId = new Map<string, any>()
  importedShops.value.forEach((s) => {
    const id = getShopId(s)
    if (id) byId.set(id, { ...s, id })
  })
  tableSelectedRows.value.forEach((s) => {
    const id = getShopId(s)
    if (id) byId.set(id, { ...s, id })
  })
  return Array.from(byId.values())
})
// let tsshopobj=ref<Object>({})

const stateOptions = [
  {
    label: '营业中',
    value: 4
  },
  {
    label: '暂停营业',
    value: 5
  },
  {
    label: '店铺上线中',
    value: 6
  },
  {
    label: '店铺已下线',
    value: 7
  }
]
let tableData = ref<WechatRobotItem[]>([])
let webhookRobots = ref<t_chat_push_list[]>([])
let wxfloclist = ref<ChatMemberItem[]>([])
let initwxfloclist = ref<ChatMemberItem[]>([])
const city = ref([])
const boundWebhookIds = ref<string[]>([])
let funcdata = ref<ChatPushFuncData>({
  "shop": null,
  "code": "CHATPUSH",
  "ConfObj": {
    "PushGroupOffIds": [
      // {
      // 	"ChatOffId": "wxid_sbgpqr1heq2v12",
      // 	"MemberOffid": "45912716029@chatroom"
      // }
    ],
    "PushFriendOffids": [],
    "PushNormalClose": {
      "Enable": true,
      "Time": null
    },
    "PushNormalAd": {
      "MinAdBalance": 10,
      "Enable": true,
      "Time": null
    },
    "PushBadComment": {
      "Enable": true,
      "Time": null
    },
    "PushShopReport": {
      "EnableFields": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16
      ],
      "Enable": true,
      "Time": null
    },
    "PushShopEndTime": {
      "Enable": false,
      "Time": null
    },
    "PushShopOut": {
      "Enable": true,
      "Time": null
    },
    "PushStrFirst": null,
    "PushStrLast": null,
    "MarkTop": true,
    "MarkLow": true,
    "CommandBind": true
  },
  "LastExceptionStr": null
}
)
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  filter: {
    shopType: shopType.value,
    func_code: 'CHATPUSH',
    func_state: 1,
    citys: undefined,
    group: undefined,
    word: undefined,
    state: undefined,
  }
})
let wxfriendlist = ref<ChatMemberItem[]>([])
let initwxfriendlist = ref<ChatMemberItem[]>([])
// 好友列表分页参数
const friendListParams = reactive({
  pageIndex: 1,
  pageSize: 20,
  keyword: '',
  total: 0
})
// 群列表分页参数
const groupListParams = reactive({
  pageIndex: 1,
  pageSize: 20,
  keyword: '',
  total: 0
})
/** 非 null 时好友列表仅请求这些 OffId（与后端 OnlyMemberOffIds 一致） */
const friendListOnlyMemberOffIds = ref<string[] | null>(null)
/** 非 null 时群列表仅请求这些 OffId */
const groupListOnlyMemberOffIds = ref<string[] | null>(null)
const groupParams = reactive({
  grouptype: 1,
  recursionchild: true
})
let checkfrien = ref<WechatRobotItem | null>(null);
let checkflock = ref<WechatRobotItem | null>(null);
const setcheckfrien = (val: WechatRobotItem) => {
  checkfrien.value = val
  // console.log(val);
  friendListOnlyMemberOffIds.value = null
  friendListParams.pageIndex = 1
  friendListParams.keyword = ''
  getwxfriend(friendListParams.pageIndex, friendListParams.pageSize, friendListParams.keyword)
}
const setcheckflock = (val: WechatRobotItem) => {
  checkflock.value = val
  groupListOnlyMemberOffIds.value = null
  groupListParams.pageIndex = 1
  groupListParams.keyword = ''
  getwxflock(groupListParams.pageIndex, groupListParams.pageSize, groupListParams.keyword)
}
// const settsshopobj=(obj:Object)=>{
//   tsshopobj.value=obj
// }
const setpayDialogState = (val: boolean) => {
  payDialogState.value = val;
}
const getGroupList = () => {
  apiManager.groupApi.GetGroups(groupParams.grouptype, groupParams.recursionchild).then((data) => {
    groupOptions.value = data
    factory(groupOptions.value)
  })
}
const handleChangeGroup = () => {
  if (grouvalue.value && grouvalue.value.length > 0) {
    queryParams.filter.group = grouvalue.value.at(-1)
  } else {
    queryParams.filter.group = undefined
  }
  getshop()
}
const handleChangeState = (state: number | undefined) => {
  // 当选择"全部"时，设置为 null 而不是 undefined，避免后端反序列化错误
  queryParams.filter.state = state ?? null;
  getshop()
}
const factory = (material: any) => {
  material.forEach((raw: any) => {
    raw.id = raw.Member.id;
    raw.label = raw.Member.name;
    raw.value = raw.Member.id;
    raw.children && factory(raw.children);
  })
};
const handleChangeCity = () => {
  if (city.value && city.value.length > 0) {
    queryParams.filter.citys = city.value.map(item => item[1])
  } else {
    queryParams.filter.citys = undefined
  }
  getshop()
}

let funstate = ref<number>(1)
let tablelist = ref<ShopListItemWithChatPush[]>([])
let totalnum = ref<number>(0)

const setfunstate = (num: number) => {
  if (num == funstate.value) {
    return;
  }
  funstate.value = num;
  queryParams.filter.func_state = num;
  queryParams.filter.state = undefined;
  getshop();
}
const cityList = ref<Array<any>>([])
const getCityList = () => {
  apiManager.serviceApi.GetProvinceWithCitys().then((data) => {
    let arr = []
    for (let key in data) {
      let children = data[key].map((item: any) => {
        return { value: item, label: item }
      })
      arr.push({ value: key, label: key, children })
    }
    cityList.value = arr;
  })
}
const getshop = async () => {
  // queryParams.filter.func_state=funstate.value;
  loadshow.value = true;
  const data = await apiManager.shopmgApi.GetShopList(queryParams);
  loadshow.value = false;
  // console.log(data,"res");
  tablelist.value = data.rows;
  tablelist.value = data.rows.map(item => {
    const funcList = item.func_info ?? [];
    let arr = funcList.filter((f) => f.code == 'CHATPUSH');
    if (arr.length) {
      item.chatendtime = arr[0].end_time;
      item.chatcheck = arr[0].enable;
    } else {
      item.chatcheck = false;
    }
    return item;
  })
  totalnum.value = data.total;
}
const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`)
  queryParams.pageSize = val;
  getshop()
}
const handleCurrentChange = (val: number) => {
  // console.log(`current page: ${val}`)
  queryParams.page = val;
  getshop()
}
// onMounted(()=>{
//   getshop()
// })
const sethaddwechat = (val: boolean) => {
  haddwechat.value = val
}
const setqaddwechat = (val: boolean) => {
  qaddwechat.value = val
}
const setWebhookDrawer = (val: boolean) => {
  webhookDrawer.value = val
}
const setrbwechat = (val: boolean) => {
  rbwechat.value = val
}
const setdrawer = (val: boolean) => {
  drawer.value = val
}
// const setqundrawer=(val:boolean)=>{
//   qundrawer.value=val
// }
let shopobj = ref<ShopListItemWithChatPush>({} as ShopListItemWithChatPush);
let typetext = ref('推送服务')
const opendio = (obj: ShopListItemWithChatPush) => {
  shopobj.value = obj;
}

// 抽屉标题计算属性
const wechatFriendDrawerTitle = computed(() => {
  const shopName = shopobj.value?.name || '未知店铺'
  return `为 ${shopName} 绑定微信号推送`
})

const wechatGroupDrawerTitle = computed(() => {
  const shopName = shopobj.value?.name || '未知店铺'
  return `为 ${shopName} 绑定微信群推送`
})

const webhookDrawerTitle = computed(() => {
  const shopName = shopobj.value?.name || '未知店铺'
  return `为 ${shopName} 绑定 WebHook 推送`
})
const closePayDialog = () => {
  payDialogState.value = false
}
const paySuccess = () => {
  payDialogState.value = false
  queryParams.page = 1;
  getshop();
}
// 绑定目标类型：1=微信好友推送，2=微信群推送，3=WebHook 机器人推送
const getman = (bindTargetType: number) => {
  getwex(bindTargetType)
  // let roidtext:string|null=localStorage.getItem('roidobj')
  // // console.log(roidtext,"roidtext");
  // if(!Boolean(roidtext)){
  //   gp.$baseMessage('请先绑定机器人')
  //   return;
  // }
  // let roidobj=JSON.parse(roidtext)
  // const userStore = useUserStore()
  // const { token } = userStore
  // newaxios({
  // method: 'GET',
  // url: roidobj.url+'ChatClient/GetMyInfo',
  // headers: {
  //   'token': token,
  //   'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //   'ClientKey':roidobj.ClientKey
  // },
  // timeout: 5000
  // }).then(res=>{
  // let {data}=res
  // tableData.value=data.data
  // if(num==1){
  //   getwxfriend()
  // }
  // if(num==2){
  //   getwxflock()
  // }
  // if(num==1){
  //   sethaddwechat(true)
  //     }
  //     if(num==2){
  //       setqaddwechat(true)
  //     }
  // console.log(data,"res");
  // })
}
// 根据绑定目标类型加载可用的机器人列表
const getwex = (bindTargetType: number) => {
  let chatTypes: ChatType[] | undefined

  // 1、2 仍然是微信好友/群推送，只取微信客户端类型
  if (bindTargetType === 1 || bindTargetType === 2) {
    chatTypes = [ChatType.WechatPc, ChatType.WechatIpad, ChatType.WechatWeb]
  }
  // 3 为 WebHook 推送，只取 WebHook 机器人
  if (bindTargetType === 3) {
    chatTypes = [ChatType.WechatWebHook, ChatType.DingdingWebHook, ChatType.FeishuWebHook]
  }

  apiManager.chatMgApi.GetPageList(1, 20, chatTypes).then(data => {
    if (bindTargetType === 3) {
      // WebHook 推送：后端已通过 chatTypes 参数过滤，直接使用返回结果
      webhookRobots.value = data.rows
      if (!webhookRobots.value.length) {
        gp.$baseMessage('暂未配置任何 WebHook 机器人', 'warning')
        return
      }
      setWebhookDrawer(true)
      return
    }

    // 先过滤微信类型的机器人（排除 WebHook 类型）
    const wechatRobots = data.rows.filter(item => {
      const chatType = item.chat_type
      // 只保留微信PC、微信iPad、微信Web类型
      return (
        chatType === ChatType.WechatPc ||
        chatType === ChatType.WechatIpad ||
        chatType === ChatType.WechatWeb
      )
    })

    // 转换为扩展类型（添加 type 字段，表示是否在线）
    const robotItems = toWechatRobotItems(wechatRobots)

    // 过滤出在线的微信机器人
    tableData.value = robotItems.filter(item => item.type === true)

    if (tableData.value.length) {
      if (bindTargetType == 1) {
        setcheckfrien(tableData.value[0])
      }
      if (bindTargetType == 2) {
        setcheckflock(tableData.value[0])
      }
      if (bindTargetType == 1) {
        sethaddwechat(true)
      }
      if (bindTargetType == 2) {
        setqaddwechat(true)
      }
    } else {
      // 区分是没有微信机器人还是机器人掉线
      if (wechatRobots.length) {
        gp.$baseMessage('微信机器人掉线')
      } else {
        gp.$baseMessage('未绑定微信机器人')
      }
    }
  })
}
const getwxfriend = async (
  pageIndex: number = 1,
  pageSize: number = 20,
  keyword: string = ''
): Promise<boolean> => {
  if (!checkfrien.value) return true

  try {
    const data = await apiManager.chatMgApi.GetFriendList(
      checkfrien.value.id,
      pageIndex,
      pageSize,
      keyword || undefined,
      friendListOnlyMemberOffIds.value
    )
    const items = data.Items ?? []
    const filtdata = items.filter((item: ChatMemberItem) => item.Offid.startsWith('wxid'))
    wxfriendlist.value = filtdata
    friendListParams.total = data.Total ?? items.length
    friendListParams.pageIndex = data.PageIndex ?? pageIndex
    friendListParams.pageSize = pageSize
    friendListParams.keyword = keyword
    return true
  } catch {
    gp.$baseMessage('获取好友列表失败', 'error')
    friendListParams.total = 0
    friendListParams.pageIndex = 1
    friendListParams.pageSize = 20
    return false
  }
}
const filterfriendlist = (text: string) => {
  friendListParams.keyword = text
  friendListParams.pageIndex = 1
  getwxfriend(friendListParams.pageIndex, friendListParams.pageSize, text)
}
const getwxflock = async (
  pageIndex: number = 1,
  pageSize: number = 20,
  keyword: string = ''
): Promise<boolean> => {
  if (!checkflock.value) return true

  try {
    const data = await apiManager.chatMgApi.GetGroupList(
      checkflock.value.id,
      pageIndex,
      pageSize,
      keyword || undefined,
      groupListOnlyMemberOffIds.value
    )
    const items = data.Items ?? []
    wxfloclist.value = items
    groupListParams.total = data.Total ?? items.length
    groupListParams.pageIndex = data.PageIndex ?? pageIndex
    groupListParams.pageSize = pageSize
    groupListParams.keyword = keyword
    return true
  } catch {
    gp.$baseMessage('获取群列表失败', 'error')
    groupListParams.total = 0
    groupListParams.pageIndex = 1
    groupListParams.pageSize = 20
    return false
  }
}
const filterfloclist = (text: string) => {
  groupListParams.keyword = text
  groupListParams.pageIndex = 1
  getwxflock(groupListParams.pageIndex, groupListParams.pageSize, text)
}

const bindingwx = (row: BindWxParams) => {
  let { type, obj, rodiobj } = row
  funcdata.value.shop = shopobj.value.id;
  if (type == 1) {
    let arr = null;
    let fridenlist = { ChatOffId: rodiobj.offid, MemberOffid: obj.Offid }
    arr = funcdata.value.ConfObj.PushFriendOffids.filter(item => item.MemberOffid == obj.Offid)
    if (arr && arr.length) {
      gp.$baseMessage('该好友已绑定')
      return;
    }
    funcdata.value.ConfObj.PushFriendOffids.push(fridenlist);
  } else if (type == 2) {
    let brr = null;
    let grouplist = { ChatOffId: rodiobj.offid, MemberOffid: obj.Offid }
    brr = funcdata.value.ConfObj.PushGroupOffIds.filter(item => item.MemberOffid == obj.Offid)
    if (brr && brr.length) {
      gp.$baseMessage('该群聊已绑定')
      return;
    }
    funcdata.value.ConfObj.PushGroupOffIds.push(grouplist);
  }
  apiManager.functionuserApi.SetConf_func(funcdata.value as any).then(data => {
    gp.$baseMessage('绑定成功', 'success', 'hey')

    if (type == 1) {
      getwxfriend(friendListParams.pageIndex, friendListParams.pageSize, friendListParams.keyword)
    } else if (type == 2) {
      getwxflock(groupListParams.pageIndex, groupListParams.pageSize, groupListParams.keyword)
    }
  }).catch(() => {
    gp.$baseMessage('绑定失败', 'error', 'hey')
  })
}
const refreshBoundWebhookIds = () => {
  const items = funcdata.value.ConfObj?.PushGroupOffIds || []
  boundWebhookIds.value = items
    .filter(item => item.ChatOffId && !item.MemberOffid)
    .map(item => item.ChatOffId)
}

const bindingWebhook = (robot: t_chat_push_list) => {
  if (!funcdata.value.ConfObj) {
    return
  }
  funcdata.value.shop = shopobj.value.id

  const items = funcdata.value.ConfObj.PushGroupOffIds || []
  const exists = items.some(item => item.ChatOffId === robot.id && !item.MemberOffid)
  if (exists) {
    gp.$baseMessage('该 WebHook 机器人已绑定', 'warning')
    return
  }

  items.push({ ChatOffId: robot.id, MemberOffid: null })
  funcdata.value.ConfObj.PushGroupOffIds = items

  apiManager.functionuserApi.SetConf_func(funcdata.value as any).then(() => {
    gp.$baseMessage('绑定成功', 'success', 'hey')
    refreshBoundWebhookIds()
  }).catch(() => {
    gp.$baseMessage('绑定失败', 'error', 'hey')
  })
}
const setfuncdata = (obj: Partial<ChatPushFuncData['ConfObj']>) => {
  Object.assign(funcdata.value.ConfObj, obj)
  funcdata.value.shop = shopobj.value.id;
  apiManager.functionuserApi.SetConf_func(funcdata.value as any).then(data => {
    gp.$baseMessage('设置成功', 'success', 'hey')
    setdrawer(false);
  }).catch(() => {
    gp.$baseMessage('设置失败', 'error', 'hey')
  })
}
const setEnableFields = (arr: Array<number>) => {
  if (funcdata.value.ConfObj.PushShopReport) {
    funcdata.value.ConfObj.PushShopReport.EnableFields = arr
  }

}
// 功能开关
const chatpushchang = (val: ShopListItemWithChatPush) => {
  // enableFunc
  let obj = {
    "code": "CHATPUSH",
    "enable": val.chatcheck || false,
    "shop": val.id
  }
  apiManager.functionuserApi.Enable_func(obj).then(data => {
    gp.$baseMessage('操作成功!', 'success', 'hey');
    getshop()
  }).catch(() => {
    gp.$baseMessage('操作失败!', 'error', 'hey');
    // tablelist.value.chatcheck=!val.chatcheck;
    getshop()
  })
}
const getfuncdata = (obj: { id: string, type: number }) => {
  let { id, type } = obj;
  apiManager.functionuserApi.GetConf_func({ code: 'CHATPUSH', shop: id }).then(data => {
    const confObj = data.conf_json || {}
    const firld = confObj.PushFriendOffids?.filter((item: any) => item?.MemberOffid && item?.ChatOffId) || []
    // 群推送需要兼容普通微信群与 WebHook 机器人，这里只要求 ChatOffId 有值
    const group = confObj.PushGroupOffIds?.filter((item: any) => item?.ChatOffId) || []

    funcdata.value = {
      shop: id,
      code: 'CHATPUSH',
      ConfObj: {
        ...confObj,
        PushFriendOffids: firld,
        PushGroupOffIds: group
      },
      LastExceptionStr: data.LastExceptionStr
    }
    refreshBoundWebhookIds()

    if (type == 1) {
      setdrawer(true)
    }
  })
}

const onBatchSelectShopsConfirm = (shops: any[]) => {
  clearBatchSelection()
  batchSelectShopsDialogVisible.value = false
  const action = pendingBatchAction.value
  pendingBatchAction.value = null
  const shopList = shops.map((s) => ({ ...s, id: getShopId(s) })).filter((s) => s.id)
  if (action === 'enable') batchEnableWithShops(true, shopList)
  else if (action === 'disable') batchEnableWithShops(false, shopList)
  else if (action === 'config') {
    batchConfigShops.value = shopList
    batchConfigDialogVisible.value = true
  } else if (action === 'push') batchPushNowWithShops(shopList)
}

const onShopSelectionChange = (selectedRows: any[]) => {
  tableSelectedRows.value = selectedRows
}

watch(batchSelectShopsDialogVisible, (val) => {
  if (!val) pendingBatchAction.value = null
})

watch(batchConfigDialogVisible, (val) => {
  if (!val) batchConfigShops.value = []
})

const BATCH_MAX_COUNT = 200

const triggerBatchEnable = (enable: boolean) => {
  if (localShopList.value.length === 0) {
    pendingBatchAction.value = enable ? 'enable' : 'disable'
    batchSelectShopsDialogVisible.value = true
    return
  }
  batchEnable(enable)
}

const triggerBatchConfig = () => {
  if (localShopList.value.length === 0) {
    pendingBatchAction.value = 'config'
    batchSelectShopsDialogVisible.value = true
    return
  }
  batchConfigDialogVisible.value = true
}

const triggerBatchPushNow = () => {
  if (localShopList.value.length === 0) {
    pendingBatchAction.value = 'push'
    batchSelectShopsDialogVisible.value = true
    return
  }
  batchPushNow()
}

const getShopIds = (shops?: any[]) => {
  const ids = (shops ?? localShopList.value).map((s) => getShopId(s)).filter(Boolean) as string[]
  return [...new Set(ids)]
}

const showBatchResult = (res: { SuccessCount: number; FailedList?: { ShopId: string; Reason: string }[] }) => {
  const failedList = res.FailedList ?? []
  if (failedList.length === 0) {
    return `成功 ${res.SuccessCount} 家`
  }
  batchFailSuccessCount.value = res.SuccessCount
  batchFailList.value = failedList
  batchFailDialogVisible.value = true
  return `成功 ${res.SuccessCount} 家，失败 ${failedList.length} 家（详见弹窗）`
}

const batchEnableWithShops = async (enable: boolean, shops: any[]) => {
  const shopIds = getShopIds(shops)
  if (shopIds.length === 0) {
    gp.$baseMessage('请先选择店铺', 'warning', 'hey')
    return
  }
  if (shopIds.length > BATCH_MAX_COUNT) {
    gp.$baseMessage(`单次最多支持${BATCH_MAX_COUNT}家店铺`, 'warning', 'hey')
    return
  }
  try {
    const res = await apiManager.functionuserApi.BatchEnable_func({
      ShopType: shopType.value,
      Code: 'CHATPUSH',
      ShopIds: shopIds,
      Enable: enable,
    })
    const msg = showBatchResult(res)
    gp.$baseMessage(`批量${enable ? '开启' : '关闭'}${msg}`, 'success', 'hey')
    getshop()
  } catch {
    gp.$baseMessage('批量操作失败', 'error', 'hey')
  }
}

const batchEnable = async (enable: boolean) => {
  const shopIds = getShopIds()
  if (shopIds.length === 0) {
    gp.$baseMessage('请先选择店铺', 'warning', 'hey')
    return
  }
  if (shopIds.length > BATCH_MAX_COUNT) {
    gp.$baseMessage(`单次最多支持${BATCH_MAX_COUNT}家店铺`, 'warning', 'hey')
    return
  }
  try {
    const res = await apiManager.functionuserApi.BatchEnable_func({
      ShopType: shopType.value,
      Code: 'CHATPUSH',
      ShopIds: shopIds,
      Enable: enable,
    })
    const msg = showBatchResult(res)
    gp.$baseMessage(`批量${enable ? '开启' : '关闭'}${msg}`, 'success', 'hey')
    clearBatchSelection()
    getshop()
  } catch {
    gp.$baseMessage('批量操作失败', 'error', 'hey')
  }
}

const batchPushNowWithShops = async (shops: any[]) => {
  const shopIds = getShopIds(shops)
  if (shopIds.length === 0) {
    gp.$baseMessage('请先选择店铺', 'warning', 'hey')
    return
  }
  if (shopIds.length > BATCH_MAX_COUNT) {
    gp.$baseMessage(`单次最多支持${BATCH_MAX_COUNT}家店铺`, 'warning', 'hey')
    return
  }
  try {
    const res = await apiManager.chatPushDataApi.BatchPushDataNow({
      ShopType: shopType.value,
      ShopIds: shopIds,
    })
    const msg = showBatchResult(res)
    gp.$baseMessage(`批量推送${msg}`, 'success', 'hey')
  } catch {
    gp.$baseMessage('批量推送失败', 'error', 'hey')
  }
}

const batchPushNow = async () => {
  const shopIds = getShopIds()
  if (shopIds.length === 0) {
    gp.$baseMessage('请先选择店铺', 'warning', 'hey')
    return
  }
  if (shopIds.length > BATCH_MAX_COUNT) {
    gp.$baseMessage(`单次最多支持${BATCH_MAX_COUNT}家店铺`, 'warning', 'hey')
    return
  }
  try {
    const res = await apiManager.chatPushDataApi.BatchPushDataNow({
      ShopType: shopType.value,
      ShopIds: shopIds,
    })
    const msg = showBatchResult(res)
    gp.$baseMessage(`批量推送${msg}`, 'success', 'hey')
    clearBatchSelection()
  } catch {
    gp.$baseMessage('批量推送失败', 'error', 'hey')
  }
}

const clearBatchSelection = () => {
  importedShops.value = []
  tableSelectedRows.value = []
  tswechattableRef.value?.clearSelection?.()
}

const onBatchConfigSuccess = (res?: { SuccessCount: number; FailedList?: { ShopId: string; Reason: string }[] }) => {
  batchConfigDialogVisible.value = false
  batchConfigShops.value = []
  clearBatchSelection()
  getshop()
  if (res && (res.FailedList?.length ?? 0) > 0) {
    batchFailSuccessCount.value = res.SuccessCount
    batchFailList.value = res.FailedList ?? []
    batchFailDialogVisible.value = true
  }
}

const filterbinding = async (type: number) => {
  if (type == 1 && funcdata.value.ConfObj && checkfrien.value) {
    const currentRobotId = checkfrien.value.id
    const currentRobotOffid = checkfrien.value.offid || checkfrien.value.id

    const boundFriendOffids =
      funcdata.value.ConfObj.PushFriendOffids
        ?.filter(
          item =>
            item.MemberOffid &&
            item.ChatOffId &&
            (item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid)
        )
        .map(item => item.MemberOffid as string) || []

    if (boundFriendOffids.length === 0) {
      friendListOnlyMemberOffIds.value = null
      wxfriendlist.value = []
      friendListParams.total = 0
      return
    }

    if (!checkfrien.value.on_line && !checkfrien.value.key) {
      gp.$baseMessage('机器人未在线，无法获取已绑定好友列表。请确保电脑端机器人已连接', 'warning')
      friendListOnlyMemberOffIds.value = null
      const arr: ChatMemberItem[] = []
      funcdata.value.ConfObj.PushFriendOffids?.forEach(item => {
        if (item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid) {
          wxfriendlist.value.forEach(wxitem => {
            if (item.MemberOffid == wxitem.Offid) {
              arr.push(wxitem)
            }
          })
        }
      })
      wxfriendlist.value = arr
      friendListParams.total = arr.length
      return
    }

    friendListOnlyMemberOffIds.value = boundFriendOffids
    friendListParams.pageIndex = 1
    const ok = await getwxfriend(1, friendListParams.pageSize, friendListParams.keyword)
    if (!ok) {
      friendListOnlyMemberOffIds.value = null
      const arr: ChatMemberItem[] = []
      funcdata.value.ConfObj.PushFriendOffids?.forEach(item => {
        if (item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid) {
          wxfriendlist.value.forEach(wxitem => {
            if (item.MemberOffid == wxitem.Offid) {
              arr.push(wxitem)
            }
          })
        }
      })
      wxfriendlist.value = arr
      friendListParams.total = arr.length
    }
  } else if (type == 2 && funcdata.value.ConfObj && checkflock.value) {
    const currentRobotId = checkflock.value.id
    const currentRobotOffid = checkflock.value.offid || checkflock.value.id

    const boundGroupOffIds =
      funcdata.value.ConfObj.PushGroupOffIds
        ?.filter(
          item =>
            item.MemberOffid &&
            item.ChatOffId &&
            (item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid)
        )
        .map(item => item.MemberOffid as string) || []

    if (boundGroupOffIds.length === 0) {
      groupListOnlyMemberOffIds.value = null
      wxfloclist.value = []
      groupListParams.total = 0
      return
    }

    if (!checkflock.value.on_line && !checkflock.value.key) {
      gp.$baseMessage('机器人未在线，无法获取已绑定群列表。请确保电脑端机器人已连接', 'warning')
      groupListOnlyMemberOffIds.value = null
      const arr: ChatMemberItem[] = []
      funcdata.value.ConfObj.PushGroupOffIds?.forEach(item => {
        if (item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid) {
          wxfloclist.value.forEach(wxitem => {
            if (item.MemberOffid === wxitem.Offid) {
              arr.push(wxitem)
            }
          })
        }
      })
      wxfloclist.value = arr
      groupListParams.total = arr.length
      return
    }

    groupListOnlyMemberOffIds.value = boundGroupOffIds
    groupListParams.pageIndex = 1
    const ok = await getwxflock(1, groupListParams.pageSize, groupListParams.keyword)
    if (!ok) {
      groupListOnlyMemberOffIds.value = null
      const arr: ChatMemberItem[] = []
      funcdata.value.ConfObj.PushGroupOffIds?.forEach(item => {
        if (item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid) {
          wxfloclist.value.forEach(wxitem => {
            if (item.MemberOffid === wxitem.Offid) {
              arr.push(wxitem)
            }
          })
        }
      })
      wxfloclist.value = arr
      groupListParams.total = arr.length
    }
  }
}
const initfilterbinding = (type: number) => {
  if (type == 1) {
    friendListOnlyMemberOffIds.value = null
    friendListParams.keyword = ''
    friendListParams.pageIndex = 1
    getwxfriend(friendListParams.pageIndex, friendListParams.pageSize, friendListParams.keyword)
  } else if (type == 2) {
    groupListOnlyMemberOffIds.value = null
    groupListParams.keyword = ''
    groupListParams.pageIndex = 1
    getwxflock(groupListParams.pageIndex, groupListParams.pageSize, groupListParams.keyword)
  }
}
const unbindingwx = (data: { type: number, row: ChatMemberItem }) => {
  let { type, row } = data;
  let obj: ChatPushFuncData = JSON.parse(JSON.stringify(funcdata.value))
  if (type == 1 && obj.ConfObj) {
    obj.ConfObj.PushFriendOffids = funcdata.value.ConfObj?.PushFriendOffids?.filter(item => item.MemberOffid != row.Offid) || []
  } else if (type == 2 && obj.ConfObj) {
    obj.ConfObj.PushGroupOffIds = funcdata.value.ConfObj?.PushGroupOffIds?.filter(item => item.MemberOffid != row.Offid) || []
  }
  apiManager.functionuserApi.SetConf_func(obj as any).then(data => {
    gp.$baseMessage('解绑成功', 'success')
    funcdata.value = obj
    filterbinding(type)
    // if(type==1){
    //   getwxfriend()
    // }else if(type==2){
    //   getwxflock()
    // }
  }).catch(() => {
    gp.$baseMessage('解绑失败', 'error')
    filterbinding(type)
  })
}
const unbindingWebhook = (robot: t_chat_push_list) => {
  const obj: ChatPushFuncData = JSON.parse(JSON.stringify(funcdata.value))
  if (obj.ConfObj) {
    obj.ConfObj.PushGroupOffIds =
      obj.ConfObj.PushGroupOffIds?.filter(item => !(item.ChatOffId === robot.id && !item.MemberOffid)) || []
  }

  apiManager.functionuserApi.SetConf_func(obj as any).then(() => {
    gp.$baseMessage('解绑成功', 'success')
    funcdata.value = obj
    refreshBoundWebhookIds()
  }).catch(() => {
    gp.$baseMessage('解绑失败', 'error')
  })
}
const opennewurl = () => {
  // configMp4.url
  tutorialsDialogState.value = true

}
const closeTutorialsDialog = () => {
  configMp4.url = ''
  tutorialsDialogState.value = false
}

// 监听路由变化，当店铺类型变化时重新加载店铺列表
watch(funstate, (val) => {
  if (val !== 1) {
    tableSelectedRows.value = []
    tswechattableRef.value?.clearSelection?.()
  }
})

watch(shopType, (newType, oldType) => {
  // 只有在当前路由是门店推送相关页面且值真正变化时才执行
  const isShopWechatRoute = route.name === 'Tswechat' || route.name === 'Elmtswechat' || route.name === 'Jdtswechat'
  if (isShopWechatRoute && newType !== oldType && newType !== queryParams.filter.shopType) {
    queryParams.filter.shopType = newType
    queryParams.page = 1
    getshop()
  }
}, { flush: 'post' })

onMounted(() => {
  getshop()
  getGroupList()
  getCityList()
  const handleResize = () => {
    // 在这里处理窗口大小变化的事件
    if (window.innerWidth <= 800) {
      sizenum.value = "100%"
    } else {
      sizenum.value = "800px"
    }
  };

  // 添加事件监听器
  window.addEventListener('resize', handleResize);

  // 清理函数，在组件卸载时移除事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});
</script>

<style scoped lang="scss">
.page-container {
  overflow: hidden;
}

::v-deep.tswechat-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  //min-width: 1200px;
  overflow-x: auto;
  padding-bottom: 10px;

  .tswechatleft {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .tswechatright {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 350px;

    .batch-count {
      color: var(--el-text-color-secondary);
      font-size: 13px;
      margin-right: 4px;

      &.batch-over-limit {
        color: var(--el-color-warning);
      }
    }

    .roidtype {
      width: 150px;
      display: flex;
      align-items: center;
      margin-left: 10px;

      .typedian {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #58e67c;
        margin: 0 5px;
      }
    }

    .roidname {
      display: flex;
      width: 150px;
      align-items: center;
      margin-left: 10px;

      img {
        margin-left: 5px;
      }
    }
  }

  .tabs {
    display: flex;
    font-size: 12px;

    div {
      width: 55px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      border: 1px solid #b6b4b4;
    }

    .yitab {
      background: var(--el-color-primary);
      color: #fff;
    }
  }

  .mdtabs {
    display: flex;
    align-items: center;
    margin-left: 10px;

    .mdtitle {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
      margin-right: 5px;
      width: 50px;
    }

    .el-select {
      width: 160px !important;
      margin-right: 10px;
    }

  }

  .bodybox {
    width: 50% !important;
  }
}

// ::v-deep .page-container{
//       .el-drawer{
//         width: 50% !important;
//     }
//     .bodybox{
//         width: 50% !important;

//     }
// }</style>