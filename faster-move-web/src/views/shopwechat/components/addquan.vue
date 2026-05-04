<template>
  <div class="hwechat">
    <div class="addwxid">
      <div>机器人：</div>
      <div class="addwid">
        <div class="addwxidcont">
          <el-radio-group v-model="checked" @change="changegroup">
            <div v-for="item in rodiobjlist" :key="item.id" class="fleximg">
              <!-- <el-checkbox v-model="checked" size="large" /> -->
              <el-radio :value="item.id" size="large" />
              <div class="imgbox">
                <img :src="item.head_img" alt="" :class="{ 'blur-avatar': demoMode }" />
              </div>
              <div class="name" :class="{ 'blur-text': demoMode }">{{ item.name }}</div>
            </div>
          </el-radio-group>
        </div>
        <!-- <el-button @click="addwx" type="primary" :icon="Plus" text>添加新微信号</el-button> -->
      </div>
    </div>
    <div class="top">
      <el-input
        v-model="mdname"
        :prefix-icon="Search"
        style="margin-right: 20px"
        placeholder="输入群昵称或备注搜索"
        @change="handleEnter"
      />
      <el-checkbox v-model="bindingcheck" style="margin-right: 20px" @change="yfilterbinding"> 已绑定群聊 </el-checkbox>
      <el-button type="primary" @click="emitflock">刷新群列表</el-button>
    </div>
    <div class="center">
      <el-table :data="tableData" style="width: 100%" height="100%">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="Offid" label="群id">
          <template #default="{ row }">
            <div :class="{ 'blur-text': demoMode }">{{ row.Offid || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="群昵称">
          <template #default="{ row }">
            <div :class="{ 'blur-text': demoMode }">{{ row.Name || '-' }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="num" label="群人数">
        </el-table-column> -->
        <el-table-column prop="num" label="类别">
          <template #default>
            <div>群</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <div v-if="!bindingcheck" class="butlist" @click="binding(scope.row)">绑定</div>
            <div v-else class="butlist" @click="unbinding(scope.row)">解绑</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="groupListParams.pageIndex"
        v-model:page-size="groupListParams.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="groupListParams.total"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <div class="bottom">
      <el-button @click="exidt">取消</el-button>
      <el-button type="primary" @click="exidt">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '/@/store/modules/settings'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const props = defineProps({
  tableData: Array as () => any[],
  wxfloclist: Array as () => any[],
  shopobj: Object as () => any,
  groupListParams: Object as () => any
})

let rodiobjlist = ref<any[]>([])
let rodiobj = reactive({
  head_img: '',
  name: ''
})
const checked = ref('1')
const tableData = ref<any[]>([])
const mdname = ref('')
const bindingcheck = ref<boolean>(false)

const groupListParams = reactive({
  pageIndex: 1,
  pageSize: 20,
  keyword: '',
  total: 0
})

const emit = defineEmits([
  'setcheckflock',
  'setqaddwechat',
  'getwxflock',
  'filterfloclist',
  'bindingwx',
  'filterbinding',
  'initfilterbinding',
  'unbindingwx'
])

const exidt = () => {
  bindingcheck.value = false
  emit('setqaddwechat', false)
}

const emitflock = () => {
  mdname.value = ''
  groupListParams.keyword = ''
  groupListParams.pageIndex = 1
  emit('getwxflock', groupListParams.pageIndex, groupListParams.pageSize, groupListParams.keyword)
}

const handleEnter = () => {
  mdname.value = mdname.value.trim()
  emit('filterfloclist', mdname.value)
}

const handleSizeChange = (val: number) => {
  groupListParams.pageSize = val
  groupListParams.pageIndex = 1
  emit('getwxflock', groupListParams.pageIndex, groupListParams.pageSize, groupListParams.keyword)
}

const handleCurrentChange = (val: number) => {
  groupListParams.pageIndex = val
  emit('getwxflock', groupListParams.pageIndex, groupListParams.pageSize, groupListParams.keyword)
}

const binding = (row: any) => {
  emit('bindingwx', { type: 2, obj: row, rodiobj: rodiobj })
}

const unbinding = (row: any) => {
  emit('unbindingwx', { type: 2, row })
}

const yfilterbinding = () => {
  if (bindingcheck.value) {
    emit('filterbinding', 2)
  } else {
    emit('initfilterbinding', 2)
  }
}

const changegroup = () => {
  rodiobj = rodiobjlist.value.find((item: any) => item.id == checked.value)
  emit('setcheckflock', rodiobj)
}

watch(
  () => props.groupListParams,
  newVal => {
    if (newVal) {
      // 确保所有字段都有值，避免 undefined
      groupListParams.pageIndex = newVal.pageIndex ?? 1
      groupListParams.pageSize = newVal.pageSize ?? 20
      groupListParams.keyword = newVal.keyword ?? ''
      groupListParams.total = newVal.total ?? 0
    }
  },
  { deep: true, immediate: true }
)

watch(
  props,
  () => {
    rodiobjlist.value = props.tableData as any
    if (rodiobjlist.value && rodiobjlist.value.length > 0) {
      checked.value = (rodiobjlist.value[0] as any).id
      rodiobj = rodiobjlist.value[0]
    }
    tableData.value = props.wxfloclist as any
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="scss">
::v-deep.hwechat {
  width: 100%;
  height: 100%;
  min-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-table {
    flex: 1;
    overflow: auto;
  }

  .addwxid {
    .addwid {
      flex: 1;
      height: 60px;
      min-height: 60px;
      overflow: hidden;
    }

    display: flex;
    width: 100%;
    margin-bottom: 16px;

    .addwxidcont {
      height: 100%;
      width: 100%;
      overflow-y: auto;

      .fleximg {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

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

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .center {
    flex: 1;
    overflow: hidden;
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .butlist {
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .pagination-wrapper {
    padding: 10px 0;
    display: flex;
    justify-content: flex-end;
  }

  .bottom {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);
  }

  .blur-text {
    filter: blur(3px);
    user-select: none;
  }

  .blur-avatar {
    filter: blur(3px);
    user-select: none;
  }
}
</style>
