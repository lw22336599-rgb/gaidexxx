<template>
<div class="page-container">
  <div v-loading="pageLoading" class="page-main">
    <div class="page-item">
      <el-button :icon="Plus" type="primary" @click="createGroup">创建分组</el-button>
      <div class="item-main">
        <div v-for="(item,index) in groupList" :key="index" class="group-item" :class="{'is-active-group': index === firstCurrentIndex}" @click="selectGroup('first', index)">
          <div class="group-item-name">{{ item.Member.name }}</div>
          <div class="group-item-right">
            <el-popover
              placement="top-start"
              trigger="hover"
            >
              <div class="group-tool-list">
                <div class="group-tool-item" @click="createGroup(item)"><el-icon><plus /></el-icon><span class="group-tool-item-btn">创建分组</span></div>
                <div class="group-tool-item" @click="editGroup(item)"><el-icon><edit /></el-icon><span class="group-tool-item-btn">编辑分组</span></div>
                <div class="group-tool-item"  @click="delGroupForId(item, 'first', index)"><el-icon><delete /></el-icon><span class="group-tool-item-btn">删除分组</span></div>
              </div>
              <template #reference>
                <el-icon><more-filled /></el-icon>
              </template>
            </el-popover>
            <el-icon><arrow-right /></el-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="page-item">
      <el-button :icon="Plus" type="primary" @click="relevanceShop('first')">关联门店</el-button>
      <div class="item-main">
        <div v-for="(item,index) in secondGroupList" :key="index" class="group-item" :class="{'is-active-group': index === secondCurrentIndex}" @click="selectGroup('second', index)">
          <div class="group-item-name">{{ item.Member.name }}</div>
          <div class="group-item-right">
            <el-popover
              placement="top-start"
              trigger="hover"
            >
              <div class="group-tool-list">
                <div class="group-tool-item" @click="createGroup(item)"><el-icon><plus /></el-icon><span class="group-tool-item-btn">创建分组</span></div>
                <div class="group-tool-item" @click="editGroup(item)"><el-icon><edit /></el-icon><span class="group-tool-item-btn">编辑分组</span></div>
                <div class="group-tool-item" @click="delGroupForId(item, 'second', index)"><el-icon><delete /></el-icon><span class="group-tool-item-btn">删除分组</span></div>
              </div>
              <template #reference>
                <el-icon><more-filled /></el-icon>
              </template>
            </el-popover>
            <el-icon><arrow-right /></el-icon>
          </div>
        </div>
      </div>
      <div v-if="secondCurrentShopList && secondCurrentShopList.length > 0" class="relevance-shop-main">
        <div class="relevance-shop-title">
          <div class="title-left">关联门店：</div>
          <div class="title-right">({{ secondCurrentShopList.length }}家)</div>
        </div>
        <div class="relevance-shop-list">
          <div v-for="(item,index) in secondCurrentShopList" :key="index" class="relevance-shop-item">
            <div class="shop-item-left">
              <img alt="" src="/@/assets/home_images/icon_001.png" style="width: 20px;height: 20px;">
              <div class="shop-detail-main">
                <div class="shop-detail-name">{{ item.name }}</div>
                <div class="shop-detail-id">ID:{{ item.office_id }}</div>
              </div>
            </div>
            <div class="shop-item-right" @click="delShopForId(item, 'first', index)">
              <el-icon><delete /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-item">
      <el-button v-if="secondGroupList && secondGroupList.length > 0" :icon="Plus" type="primary" @click="relevanceShop('second')">关联门店</el-button>
      <div class="item-main">
        <div v-for="(item,index) in thirdGroupList" :key="index" class="group-item" :class="{'is-active-group': index === thirdCurrentIndex}" @click="selectGroup('third', index)">
          <div class="group-item-name">{{ item.Member.name }}</div>
          <div class="group-item-right">
            <el-popover
              placement="top-start"
              trigger="hover"
            >
              <div class="group-tool-list">
                <div class="group-tool-item" @click="editGroup(item)"><el-icon><edit /></el-icon><span class="group-tool-item-btn">编辑分组</span></div>
                <div class="group-tool-item" @click="delGroupForId(item, 'third', index)"><el-icon><delete /></el-icon><span class="group-tool-item-btn">删除分组</span></div>
              </div>
              <template #reference>
                <el-icon><more-filled /></el-icon>
              </template>
            </el-popover>
            <el-icon><arrow-right /></el-icon>
          </div>
        </div>
      </div>
      <div class="relevance-shop-main">
        <div v-if="thirdCurrentShopList && thirdCurrentShopList.length > 0" class="relevance-shop-title">
          <div class="title-left">关联门店：</div>
          <div class="title-right">({{ thirdCurrentShopList.length }}家)</div>
        </div>
        <div class="relevance-shop-list">
          <div v-for="(item,index) in thirdCurrentShopList" :key="index" class="relevance-shop-item">
            <div class="shop-item-left">
              <img alt="" src="/@/assets/home_images/icon_001.png" style="width: 20px;height: 20px;">
              <div class="shop-detail-main">
                <div class="shop-detail-name">{{ item.name }}</div>
                <div class="shop-detail-id">ID:{{ item.office_id }}</div>
              </div>
            </div>
            <div class="shop-item-right" @click="delShopForId(item, 'second', index)">
              <el-icon><delete /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-item">
      <el-button v-if="thirdGroupList && thirdGroupList.length > 0" :icon="Plus" type="primary" @click="relevanceShop('third')">关联门店</el-button>
      <div v-if="fourCurrentShopList && fourCurrentShopList.length > 0" class="relevance-shop-main">
        <div class="relevance-shop-title">
          <div class="title-left">关联门店：</div>
          <div class="title-right">({{ fourCurrentShopList.length }}家)</div>
        </div>
        <div class="relevance-shop-list">
          <div v-for="(item,index) in fourCurrentShopList" :key="index" class="relevance-shop-item">
            <div class="shop-item-left">
              <img alt="" src="/@/assets/home_images/icon_001.png" style="width: 20px;height: 20px;">
              <div class="shop-detail-main">
                <div class="shop-detail-name">{{ item.name }}</div>
                <div class="shop-detail-id">ID:{{ item.office_id }}</div>
              </div>
            </div>
            <div class="shop-item-right" @click="delShopForId(item, 'third', index)">
              <el-icon><delete /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="addGroupState" :before-close="closeGroup" :destroy-on-close="true" :title="groupForm.id ? '编辑分组' : '添加分组'" width="500px">
      <div style="padding-bottom: 40px">
        <el-form ref="ruleFormRef" label-width="100" :model="groupForm" :rules="groupRules">
          <el-form-item v-if="groupForm.parentName" label="上级分组">
            <el-input v-model="groupForm.parentName" disabled />
          </el-form-item>
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="groupForm.name" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="confirmGroup">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-drawer
      v-model="drawerState"
      :before-close="handleDrawerClose"
      :direction="direction"
      size="50%"
      title="关联门店"
    >
      <div class="drawer-container">
        <div class="drawer-title">当前组织：{{ currentLastGroup.Member.name }}</div>
        <div class="drawer-filter">
          <div class="filter-left">
            <el-segmented v-model="organizationValue" :options="organizationOptions" size="default" @change="setOrganizationValue"/>
          </div>
          <div class="filter-right">
            <el-select v-model="shopListParams.shop_type" placeholder="Select" style="width: 160px" @change="getShopList">
              <el-option
                v-for="item in shopTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-cascader v-model="shopListParams.shop_city" clearable :options="cityOptions" style="width: 160px" @change="getShopList" />
            <el-input v-model="shopListParams.word" clearable placeholder="搜索门店名称或ID或备注" style="width: 160px" @change="getShopList"/>
          </div>
        </div>
        <div class="filter-table">
          <el-table v-loading="drawerLoading" :data="drawerTableData" height="calc(100vh - 300px)" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="门店信息" prop="date" width="400" >
              <template #default="{row}">
                <div style="display: flex; align-items: flex-start">
                  <img v-if="row.shop_type === 1" alt="" src="/@/assets/home_images/icon_001.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <img v-if="row.shop_type === 2" alt="" src="/@/assets/home_images/icon_002.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <img v-if="row.shop_type === 3" alt="" src="/@/assets/home_images/icon_003.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <img v-if="row.shop_type === 4" alt="" src="/@/assets/home_images/icon_004.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <img v-if="row.shop_type === 5" alt="" src="/@/assets/home_images/icon_005.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <img v-if="row.shop_type === 6" alt="" src="/@/assets/home_images/icon_006.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <img v-if="row.shop_type === 7" alt="" src="/@/assets/home_images/icon_007.png" style="width: 20px;height: 20px;margin-right: 8px">
                  <div>
                    <div>{{ row.name }}</div>
                    <div style="font-size: 12px;opacity: .7;">ID: {{ row.office_id }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="城市" prop="city" width="180" />
            <el-table-column label="分组" prop="group_name" />
          </el-table>
          <vab-pagination
            :current-page="shopListParams.page"
            :page-size="shopListParams.pageSize"
            :total="drawerTotal"
            @current-change="handleDrawerCurrentChange"
            @size-change="handleDrawerSizeChange"
          />
          <el-button :loading="confirmRelevanceShopState" style="margin-top: 10px" type="primary" @click="confirmRelevanceShop">{{ organizationValue === '未关联分组' ? '关联' : '取消关联' }}门店</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</div>
</template>

<script setup lang="ts">
import { getCity, getGroup, getShopListHas } from '/@/api/shop.ts'
import { ArrowRight, Delete, Edit, MoreFilled, Plus } from '@element-plus/icons-vue'
import {
  addGroup,
  connectShopUserGroup,
  connectShopUserRemoveGroup,
  delGroup,
  getBindShopList,
  removeGroup,
  updateGroup,
} from '/@/api/group.ts'
import { gp } from '/@vab/plugins/vab.ts'
import type { DrawerProps, TableInstance } from 'element-plus';
import { ElMessageBox } from 'element-plus'

const groupList = ref<any>([])
const secondGroupList = ref<any>([])
const thirdGroupList = ref<any>([])
const pageLoading = ref(false)
const firstCurrentIndex = ref(0)
const secondCurrentIndex = ref(0)
const thirdCurrentIndex = ref(0)
const secondCurrentShopList = ref<any>([])
const thirdCurrentShopList = ref<any>([])
const fourCurrentShopList = ref<any>([])
const groupParams = reactive({
  grouptype: 1,
  recursionchild: true
})
const refreshShop = ref(true)
const ruleFormRef = ref<TableInstance>()
const bindShopParams = reactive({
  page: 1,
  pagesize: 100,
  groupid: ''
})
const addGroupState = ref(false)
const btnLoading = ref(false)
let groupForm = reactive({
  id: '',
  type: 1,
  name: '',
  parentName: ''
})
const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
}
let currentGroupDetail = ref({})
const confirmGroup = () => {
  if (ruleFormRef.value)
    ruleFormRef.value?.validate(async (valid: any) => {
      if (valid) {
        refreshShop.value = true
        btnLoading.value = true
        if (groupForm.id) {
          updateGroup({
            id: groupForm.id,
            name: groupForm.name,
            notes: ''
          }).then((res: any) => {
            if (res && res.code === 200) {
              gp.$baseMessage('修改成功！', 'success', 'hey')
              sequenceGetShopList()
              closeGroup()
            }
          }).finally(() => {
            btnLoading.value = false
          })
        } else {
          addGroup({
            Parent: currentGroupDetail.value ? currentGroupDetail.value.Member?.id : null,
            name: groupForm.name,
            notes: '',
            type: groupForm.type,
          }).then((res: any) => {
            if (res && res.code === 200) {
              gp.$baseMessage('创建成功！', 'success', 'hey')
              sequenceGetShopList()
              closeGroup()
            }
          }).finally(() => {
            btnLoading.value = false
          })
        }
      }
    })
}
const createGroup = (item: any) => {
  if (item && item.Member) {
    currentGroupDetail.value = item
    groupForm.parentName = item.Member.name
  } else {
    currentGroupDetail.value = {}
    groupForm.parentName = ''
  }
  addGroupState.value = true
}
const editGroup = (item: any) => {
  addGroupState.value = true
  currentGroupDetail.value = item
  groupForm.parentName = ''
  groupForm.name = item.Member.name
  groupForm.id = item.Member.id
}
const delGroupForId = (item: any, type: string, index: number) => {
  ElMessageBox.confirm('请检查是否存在子分组？', '危险警告', {
    confirmButtonText: '直接删除',
    cancelButtonText: '取消',
    draggable: true,
  }).then(() => {
    refreshShop.value = true
    delGroup(item.Member.id).then((res: any) => {
      if (res && res.code === 200) {
        gp.$baseMessage('删除成功！', 'success', 'hey')
        sequenceGetShopList()
        switch (type) {
        case 'first': {
          if (index === firstCurrentIndex.value) {
            firstCurrentIndex.value = 0
          }
        break;
        }
        case 'second': {
          if (index === secondCurrentIndex.value) {
            secondCurrentIndex.value = 0
          }
        break;
        }
        case 'third': {
          if (index === thirdCurrentIndex.value) {
            thirdCurrentIndex.value = 0
          }
        break;
        }
        // No default
        }
      }
    })
  })
    .catch()
}
const closeGroup = () => {
  groupForm = reactive({
    id: '',
    type: 1,
    name: '',
    parentName: ''
  })
  addGroupState.value = false
}
const sequenceGetShopList = async () => {
  try {
    pageLoading.value = true
    if (refreshShop.value) {
      const res: any = await getGroup(groupParams)
      if (res.code === 200) {
        groupList.value = res.data
        changeGroup()
      }
    }
    if (groupList.value && groupList.value.length > 0) {
      bindShopParams.groupid = groupList.value[firstCurrentIndex.value].Member.id
      const res1: any = await getBindShopList(bindShopParams)
      if (res1.code === 200) {
        secondCurrentShopList.value = res1.data.rows
      }
    } else {
      secondCurrentShopList.value = []
    }
    if (secondGroupList.value && secondGroupList.value.length > 0) {
      bindShopParams.groupid = secondGroupList.value[secondCurrentIndex.value].Member.id
      const res2: any = await getBindShopList(bindShopParams)
      if (res2.code === 200) {
        thirdCurrentShopList.value = res2.data.rows
      }
    } else {
      thirdCurrentShopList.value = []
    }
    if (thirdGroupList.value && thirdGroupList.value.length > 0) {
      bindShopParams.groupid = thirdGroupList.value[thirdCurrentIndex.value].Member.id
      const res3: any = await getBindShopList(bindShopParams)
      if (res3.code === 200) {
        fourCurrentShopList.value = res3.data.rows
      }
    } else {
      fourCurrentShopList.value = []
    }
  } finally {
    pageLoading.value = false
  }
}
sequenceGetShopList()
const selectGroup = (type: string, index: number) => {
  refreshShop.value = false
  switch (type) {
  case 'first': {
    firstCurrentIndex.value = index
    secondCurrentIndex.value = 0
    thirdCurrentIndex.value = 0
  break;
  }
  case 'second': {
    secondCurrentIndex.value = index
    thirdCurrentIndex.value = 0
  break;
  }
  case 'third': {
    thirdCurrentIndex.value = index
  break;
  }
  // No default
  }
  changeGroup()
  sequenceGetShopList()
}
const changeGroup = () => {
  if (groupList.value[firstCurrentIndex.value] && groupList.value[firstCurrentIndex.value].children && groupList.value[firstCurrentIndex.value].children.length > 0) {
    secondGroupList.value = groupList.value[firstCurrentIndex.value].children
    if (secondGroupList.value[secondCurrentIndex.value].children && secondGroupList.value[secondCurrentIndex.value].children.length > 0) {
      thirdGroupList.value = secondGroupList.value[secondCurrentIndex.value].children
    } else {
      thirdGroupList.value = []
    }
  } else {
    secondGroupList.value = []
    thirdGroupList.value = []
  }
}
const selectShopGroupId = ref()
const delShopForId = (item: any, type: string, index: number) => {
  const {office_id, id} = item
  switch (type) {
  case 'first': {
    selectShopGroupId.value = groupList.value[firstCurrentIndex.value].Member.id
  break;
  }
  case 'second': {
    selectShopGroupId.value = secondGroupList.value[secondCurrentIndex.value].Member.id
  break;
  }
  case 'third': {
    selectShopGroupId.value = thirdGroupList.value[thirdCurrentIndex.value].Member.id
  break;
  }
  // No default
  }
  removeGroup({
    groupId: selectShopGroupId.value,
    shopIds: [id],
    shopOfficeIds: [office_id]
  }).then((res: any) => {
    if (res.code === 200) {
      switch (type) {
      case 'first': {
        secondCurrentShopList.value.splice(index, 1)
      break;
      }
      case 'second': {
        thirdCurrentShopList.value.splice(index, 1)
      break;
      }
      case 'third': {
        fourCurrentShopList.value.splice(index, 1)
      break;
      }
      // No default
      }
      gp.$baseMessage('删除成功！', 'success', 'hey')
    }
  })
}
const direction = ref<DrawerProps['direction']>('rtl')
const drawerState = ref(false)
const organizationValue = ref('未关联分组')
const organizationOptions = ['未关联分组', '已关联分组']
const cityOptions = ref<any>([])
const drawerTableData = ref([])
const drawerTotal = ref(0)
const drawerLoading = ref(false)
const multipleSelection = ref<any>([])
const confirmRelevanceShopState = ref(false)
const getCityOptions = () => {
  getCity().then((res: any) => {
    if (res.code === 200) {
      let arr = []
      for (let key in res.data) {
        let children = res.data[key].map((item: any) => {
          return { value: item, label: item }
        })
        arr.push({ value: key, label: key, children })
      }
      cityOptions.value = [...arr];
    }
  })
}
getCityOptions()
const shopListParams = reactive({
  hasGroup: false,
  page: 1,
  pageSize: 20,
  shop_type: 1,
  shop_city: [],
  word: ''
})
const shopTypeOptions = [
  {
    value: 1,
    label: '美团',
  },
  {
    value: 2,
    label: '饿了么',
  }
]
const handleDrawerClose = () => {
  drawerState.value = false
}
const currentLastGroup = ref({
  Member: {
    name: ''
  }
})
const relevanceShop = (type: string) => {
  switch (type) {
  case 'first': {
    currentLastGroup.value = groupList.value[firstCurrentIndex.value]
  break;
  }
  case 'second': {
    currentLastGroup.value = secondGroupList.value[secondCurrentIndex.value]
  break;
  }
  case 'third': {
    currentLastGroup.value = thirdGroupList.value[thirdCurrentIndex.value]
  break;
  }
  // No default
  }
  drawerState.value = true
  getShopList()
}
const setOrganizationValue = (value: any) => {
  if (value === '未关联分组') {
    shopListParams.hasGroup = false
  } else if (value === '已关联分组') {
    shopListParams.hasGroup = true
  }
  getShopList()
}
const handleSelectionChange = (value: any) => {
  multipleSelection.value = value
}
const getShopList = () => {
  drawerLoading.value = true
  getShopListHas(shopListParams).then((res: any) => {
    if (res.code === 200) {
      drawerTableData.value = res.data.rows
      drawerTotal.value = res.data.total
    }
  }).finally(() => {
    drawerLoading.value = false
  })
}
const handleDrawerCurrentChange = (value: number) => {
  shopListParams.page = value
  getShopList()
}
const handleDrawerSizeChange = (value: number) => {
  shopListParams.page = 1
  shopListParams.pageSize = value
  getShopList()
}
const confirmRelevanceShop = () => {
  confirmRelevanceShopState.value = true
  const shopIds = []
  const shopOfficeIds = []
  multipleSelection.value.forEach((item: any) => {
    shopIds.push(item.id)
    shopOfficeIds.push(item.office_id)
  })
  if (organizationValue.value === '未关联分组') {
    connectShopUserGroup({
      groupId: currentLastGroup.value.Member.id,
      shopIds,
      shopOfficeIds
    }).then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('关联成功！', 'success', 'hey')
        getShopList()
        sequenceGetShopList()
      }
    }).finally(() => {
      confirmRelevanceShopState.value = false
    })
  } else {
    connectShopUserRemoveGroup({
      groupId: currentLastGroup.value.Member.id,
      shopIds,
      shopOfficeIds
    }).then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('关联成功！', 'success', 'hey')
        getShopList()
        sequenceGetShopList()
      }
    }).finally(() => {
      confirmRelevanceShopState.value = false
    })
  }
}
</script>
<style scoped lang="scss">
.page-container {
  width: 100%;
  box-sizing: border-box;
  .page-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    height: calc(
      var(--vh, 1vh) * 100 - var(--el-nav-height) - var(--el-tabs-height) - var(--el-padding) * 3 - var(--el-footer-height) - var(--el-padding) * 2 - 2px
    );
    .page-item {
      width: calc((100% - 60px) / 4);
      box-sizing: border-box;
      border-right: 1px solid #eee;
      padding-right: 20px;
      margin-right: 20px;
      height: calc(
        var(--vh, 1vh) * 100 - var(--el-nav-height) - var(--el-tabs-height) - var(--el-padding) * 3 - var(--el-footer-height) - var(--el-padding) * 2 - 2px
      );
      overflow-y: scroll;
      .item-main {
        margin-top: 20px;
        width: 100%;
        .group-item {
          width: 100%;
          height: 32px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          border-radius: 6px;
          margin-bottom: 8px;
          .group-item-name {

          }
          .group-item-right {
            display: flex;
            align-items: center;
            width: 40px;
            justify-content: space-between;
          }
        }
        .group-item:hover {
          background-color: #eee;
        }
        .is-active-group {
          background-color: #eee;
        }
      }
    }
    .page-item:last-child {
      border-right: none;
      margin-right: 0;
    }
  }
}
.relevance-shop-main {
  .relevance-shop-title {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 32px;
    .title-left {

    }
    .title-right {

    }
  }
  .relevance-shop-list {
    .relevance-shop-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .shop-item-left {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        width: calc(100% - 14px);
        img {
          margin-right: 10px;
        }
        .shop-detail-main {
          .shop-detail-name {
            font-size: 14px;
          }
          .shop-detail-id {
            font-size: 12px;
            opacity: .7;
          }
        }
      }
      .shop-item-right {
        width: 14px;
        cursor: pointer;
      }
    }
  }
}
.group-tool-list {
  .group-tool-item {
    text-align: center;
    line-height: 32px;
    .group-tool-item-btn {
      margin-left: 10px;
    }
  }
  .group-tool-item:hover {
    background-color: #eee;
    cursor: pointer;
  }
}
.drawer-container {
  .drawer-title {
    margin-bottom: 10px;
  }
  .drawer-filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}
</style>
