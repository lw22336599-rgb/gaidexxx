<template>
  <div class="hwechat">
    <div class="center">
      <el-table :data="porps.tableData" style="width: 100%">
        <el-table-column prop="Name" label="微信昵称" />
        <el-table-column prop="Offid" label="wxid" />
        <!-- <el-table-column  label="操作">
          <template #default="scope">
            <div class="butlist" @click="submit(scope.row)">
              取消绑定
            </div>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="bottom">
      <el-button @click="exidt">取消</el-button>
      <el-button type="primary" @click="exidt">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const porps = defineProps({
  tableData: Array
})

const emit = defineEmits(['setmanageshow'])
const exidt = () => {
  emit('setmanageshow', false)
}
// const submit=(row:object)=>{
//   console.log(row);

// }
</script>

<style scoped lang="scss">
::v-deep.hwechat {
  width: 100%;
  height: 250px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .el-table {
    height: 100%;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .center {
    flex: 1;
    overflow: hidden;
  }
  .butlist {
    color: var(--el-color-primary);
  }
  .bottom {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    padding-bottom: 10px;
  }
}
</style>
