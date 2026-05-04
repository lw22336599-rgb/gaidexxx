<template>
  <div class="screen-container" />
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { getCity, getGroup } from '/@/api/shop.ts'
import { useAclStore } from '/@/store/modules/acl'

const { roleIncludeKA } = useAclStore()

const props = defineProps({
  queryParams: {
    type: Object,
    default: () => {}
  },
  shopTypeStr: String,
  shopType: Number,
  guard: {
    type: Array<string>,
    default: () => []
  }
})

const queryForm = reactive(props.queryParams)
const fun = ref([])
if (queryForm.func_code === 'APPDATA') {
  fun.value = [queryForm.func_code, queryForm.func_state]
}
const shopTypeString = ref(props.shopTypeStr)
const isFeature = ref(true)
if (shopTypeString.value && shopTypeString.value.includes('feature')) {
  isFeature.value = true
} else {
  isFeature.value = false
}
const online = ref('全部')
const onlineOptions = ['全部', '授权正常', '授权异常']
const stateOptions = [
  {
    label: '营业中',
    value: 4
  },
  {
    label: '停业中',
    value: 5
  },
  {
    label: '上线中',
    value: 6
  },
  {
    label: '已下线',
    value: 7
  }
]
const groupOptions = ref([])
const city = ref([])
const group = ref([])
const state = ref<any>('')
const emit = defineEmits(['updateQueryParams'])

// 监听 props.queryParams 的变化，同步内部状态
watch(
  () => props.queryParams,
  newParams => {
    if (newParams) {
      // 同步 queryForm
      Object.keys(newParams).forEach(key => {
        queryForm[key] = newParams[key]
      })

      // 同步筛选按钮状态
      // 重置城市选择
      if (!newParams.citys || newParams.citys.length === 0) {
        city.value = []
      }

      // 重置分组选择
      if (!newParams.group) {
        group.value = []
      }

      // 重置状态选择
      if (!newParams.state) {
        state.value = ''
      }

      // 重置功能选择
      if (!newParams.func_code) {
        fun.value = []
      } else if (newParams.func_code === 'APPDATA') {
        fun.value = [newParams.func_code, newParams.func_state]
      }

      // 重置在线状态
      if (newParams.ck_online === undefined && newParams.state === undefined) {
        online.value = '全部'
      } else if (newParams.ck_online === true) {
        online.value = '授权正常'
      } else if (newParams.state === 3) {
        online.value = '授权异常'
      }
    }
  },
  { deep: true, immediate: true }
)
const handleChangeCity = () => {
  if (city.value && city.value.length > 0) {
    queryForm.citys = city.value.map(item => item[1])
  } else {
    queryForm.citys = undefined
  }
  updateQuery()
}
const handleChangeGroup = () => {
  if (group.value && group.value.length > 0) {
    queryForm.group = group.value.at(-1)
  } else {
    queryForm.group = undefined
  }
  updateQuery()
}
const handleChangeFun = () => {
  console.log(fun.value)
  if (fun.value && fun.value.length > 0) {
    queryForm.func_code = fun.value[0]
    queryForm.func_state = fun.value[1]
  } else {
    queryForm.func_code = undefined
    queryForm.func_state = undefined
  }
  updateQuery()
}
const handleChangeState = () => {
  queryForm.state = state.value
  updateQuery()
}
const handleChangeOnline = () => {
  switch (online.value) {
    case '授权正常': {
      queryForm.ck_online = true
      queryForm.state = undefined
      break
    }
    case '授权异常': {
      queryForm.ck_online = undefined
      queryForm.state = 3
      break
    }
    default: {
      queryForm.ck_online = undefined
      queryForm.state = undefined
    }
  }
  updateQuery()
}
const funItemFeature = [
  {
    label: '自动防漏单',
    value: 'ZDCC',
    children: [
      {
        label: '全部',
        value: 0
      },
      {
        label: '已开启',
        value: 3
      },
      {
        label: '已关闭',
        value: 4
      },
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  },
  {
    label: '自动回复',
    value: 'IMZDHF',
    children: [
      {
        label: '全部',
        value: 0
      },
      {
        label: '已开启',
        value: 3
      },
      {
        label: '已关闭',
        value: 4
      },
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  },
  {
    label: '自动回评',
    value: 'ZDHP',
    children: [
      {
        label: '全部',
        value: 0
      },
      {
        label: '已开启',
        value: 3
      },
      {
        label: '已关闭',
        value: 4
      },
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  },
  {
    label: '自动点金',
    value: 'ZDTG',
    children: [
      {
        label: '全部',
        value: 0
      },
      {
        label: '已开启',
        value: 3
      },
      {
        label: '已关闭',
        value: 4
      },
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  },
  {
    label: '菜品动图',
    value: 'CPDT',
    children: [
      {
        label: '全部',
        value: 0
      },
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  },
  {
    label: '店铺多开',
    value: 'OPENSHOP',
    children: [
      {
        label: '全部',
        value: 0
      },
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  }
]
const funItemOperation = [
  {
    label: '运营版',
    value: 'APPDATA',
    children: [
      {
        label: '已到期',
        value: 5
      },
      {
        label: '即将到期',
        value: 2
      },
      {
        label: '未到期',
        value: 1
      }
    ]
  }
]
const updateQuery = () => {
  emit('updateQueryParams', queryForm)
}

const groupParams = reactive({
  grouptype: 1,
  recursionchild: true
})
const factory = (material: any) => {
  material.forEach((raw: any) => {
    raw.id = raw.Member.id
    raw.label = raw.Member.name
    raw.value = raw.Member.id
    raw.children && factory(raw.children)
  })
}
const getGroupList = () => {
  getGroup(groupParams).then((res: any) => {
    if (res.code === 200) {
      groupOptions.value = res.data
      factory(groupOptions.value)
    }
  })
}
const cityList = ref<Array<any>>([])
const getCityList = () => {
  getCity().then((res: any) => {
    if (res.code === 200) {
      let arr = []
      for (let key in res.data) {
        let children = res.data[key].map((item: any) => {
          return { value: item, label: item }
        })
        arr.push({ value: key, label: key, children })
      }
      cityList.value = arr
    }
  })
}

// 初始化数据
onMounted(() => {
  getGroupList()
  getCityList()
})
</script>

<style scoped lang="scss"></style>
