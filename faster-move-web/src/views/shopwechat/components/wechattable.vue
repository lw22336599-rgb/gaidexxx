<template>
  <el-table :data="porps.tablist" height="calc(100vh - 300px)" style="width: 100%;" >
    <!-- :header-cell-style="back" -->
    <el-table-column prop="head_img" label="微信头像" width="100" >
      <template #default="scope">
        <div class="imgbox">
          <img :src="scope.row.head_img" alt="" />
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="微信昵称" width="220">
      <template #default='scope'>
        <div class="maine"> {{scope.row.name}}</div>
      </template>
    </el-table-column>
    <!-- <el-table-column prop="Name" label="微信号" width="180">
      <template #default='scope'>
        <div class="maine"> {{scope.row.Name}}</div>
      </template>
    </el-table-column> -->
    <el-table-column prop="offid" label="wxid" align="center">
      <template #default='scope'>
        <div class="maine"> {{scope.row.offid}}</div>
      </template>
    </el-table-column>
    <el-table-column prop="type" label="机器人状态">
      <template #default='scope'>
        <div v-if="scope.row.type" class="succebox"><div class="succedian"></div>在线</div>
        <div v-else class="errorbox"><div class="errordian"></div>掉线</div>
      </template>
    </el-table-column>
    <!-- <el-table-column prop="address" label="更新数据">
      <template #default>
        <div class="succebox"><div class="succedian"></div>信息同步中</div>
      </template>
    </el-table-column> -->
    <el-table-column prop="address" label="管理员列表">
      <template #default='{row}'>
        <div class="see" @click="getman(row)">查看<el-icon color="var(--el-color-primary)" class="seeicon">
          <arrow-right />
        </el-icon></div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import {ArrowRight} from '@element-plus/icons-vue'
import { useUserStore } from '/@/store/modules/user'
import {newaxios} from "/@/api/setaxios"
const emit=defineEmits(['setlogshow','settableData','setmanageshow']);
const porps=defineProps({
  tablist:Array
})
const opendiao=()=>{
  emit('setlogshow',true);
}
const openman=()=>{
  emit('setmanageshow',true)
}
const getman=(row)=>{
  // host
//   let roidtext:string|null=localStorage.getItem('roidobj')
//   if(!roidtext){
//   return;
// }
  // let roidobj=JSON.parse(roidtext)
  const userStore = useUserStore()
  const { token } = userStore
  newaxios({
  method: 'GET',
  url: row.host+'/ChatClient/GetMannagerList',
  headers: {
    'token': token,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'ClientKey':row.key
  },
  timeout: 5000
}).then(res=>{
  let {data}=res
  emit('settableData',data.data)
  // console.log(data,"res");
  openman()
})
}

</script>

<style scoped lang="scss">
.maine{
  color: #666 !important;
}
.succebox{
  color: #00BD74;
  display: flex;
  align-items: center;
  // justify-content: center;
}
.succedian{
  background: #00BD74;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 5px;
}
.errorbox{
  color: #FE0000;
  display: flex;
  align-items: center;
  // justify-content: center;
}
.errordian{
  // background: #FE0000;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 5px;
}
.see{
  color: var(--el-color-primary);;
  display: flex;
  align-items: center;
  cursor: pointer;
  .seeicon{
    margin-left: 3px;
  }
}
.imgbox{
  width: 40px;
  height: 40px;
  background: #DFDFDF;
  border-radius: 50%;
  overflow: hidden;
  img{
    width: 100%;
    height: 100%;
  }
}
.butlist{
  // width: 100%;
  // height: 100%;
  display: flex;
  // justify-content: center;
  align-content: center;
  font-size: 16px;
  color: var(--el-color-primary);;
  .setbutton{
    margin-right: 20px;
    cursor: pointer;
  }
  .delbutton{
    cursor: pointer;
  }
}
</style>
