<template>
  <div class="hwechat">
    <div class="center">
      <el-checkbox v-for="item in checklist" :key="item.lable" v-model="item.checked" :label="item.lable" />
    </div>
    <div class="bottom">
      <el-button @click="exidt">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props=defineProps({
  funcdata:Object
})
const emit = defineEmits(['setrbwechat','setEnableFields']);
const exidt=()=>{
  emit('setrbwechat',false)
}
// const checked=ref(true)
let checklist=ref([
  {
    lable:'昨日订单数',
    checked:true,
  },
  {
    lable:'店铺评分',
    checked:true,
  },
  {
    lable:'店铺评价数',
    checked:true,
  },
  {
    lable:'实际收入',
    checked:true,
  },
  {
    lable:'营业额',
    checked:true,
  },
  {
    lable:'活动补贴',
    checked:true,
  },
  {
    lable:'曝光人数',
    checked:true,
  },
  {
    lable:'入店人数',
    checked:true,
  },
  {
    lable:'入店转化率',
    checked:true,
  },
  {
    lable:'推广花费',
    checked:true,
  },
  {
    lable:'推广曝光量',
    checked:true,
  },
  {
    lable:'推广进店量',
    checked:true,
  },
  {
    lable:'下单转化率',
    checked:true,
  },
  {
    lable:'推广进店率',
    checked:true,
  },
  {
    lable:'实付单均价',
    checked:true,
  },
  {
    lable:'下单人数',
    checked:true,
  },
  
])
const submit=()=>{
  let arr:Array<number>=[]
  checklist.value.map((item,index)=>{
    if(item.checked){
      arr.push(index+1)
    }
  })
  // console.log(arr,"arr");
  emit('setEnableFields',arr)
  exidt();
}
watch(props,()=>{
  checklist.value=checklist.value.map(item=>{
    item.checked=false;
    return item;
  })
  props.funcdata.ConfObj.PushShopReport.EnableFields.map(item=>{
    checklist.value[item-1].checked=true;
  })
},{deep:true,immediate:true})
</script>

<style scoped lang="scss">
::v-deep.hwechat{
  width: 100%;
  height: 250px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .el-table{
    height: 100%;
  }

  .center{
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
  }
  .butlist{
    color: #699be7;
  }
  .el-checkbox {
    width: 100px;
  }
  .bottom{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
