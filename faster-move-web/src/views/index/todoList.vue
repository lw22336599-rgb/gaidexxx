<template>
  <vab-card class="todo-card">
    <template #header>
      <div class="header-main">
        <div class="header-left">
          <vab-icon icon="calendar-todo-fill" />
          待办事项
        </div>
        <div class="header-right" @click="openAdd">
          + 添加待办事项
        </div>
      </div>
    </template>
    <div class="num-container">
      <div class="span" @click="todo">本日待办：{{ dayTodo }}</div>
      <div style="display:flex;align-items: center;">
        <div style="width: 6px;height: 6px;background: #2CCA87;margin-right:5px"></div>
        <span class="span" @click="beDone">已完成：{{ done }}</span>
        <div style="width: 6px;height: 6px;background: #FE0000;margin-right:5px;margin-left:5px"></div>
        <span class="span" @click="beUndone">未完成：{{ undone }}</span>
      </div>
    </div>
    <div style="width: 100%;height: 110px;overflow-y: scroll">
      <div v-for="item in list" :key="item.id" class="list-container">
        <div class="list-content">
          <div class="dian" :style="{ background: item.top == 1 ? '#e95648' : item.top == 2 ? '#ff9d28' : item.top == 3 ? '#0488de' : '#ebedef' }"></div>{{ item.name }}--{{ item.content }}
        </div>
        <el-popover ref="dcPopover" placement="bottom" popper-class="daibanbox" trigger="click">
          <div>
            <div v-if="item.state !== 2" class="pointer" style="text-align: center;cursor: pointer" @click="edit(item)">编辑事项</div>
            <div class="pointer" style="text-align: center;cursor: pointer" @click="del(item.id)">删除事项</div>
            <div v-if="item.state !== 2" class="pointer" style="text-align: center;cursor: pointer" @click="setOk(item)">标记已完成</div>
          </div>
          <template #reference>
            <div><vab-icon icon="more-fill"/></div>
          </template>
        </el-popover>
      </div>
    </div>
<!--    <el-pagination class="pagination" :current-change="getTodoList" layout="prev, pager, next" :total="total"/>-->
    <el-dialog
      v-if="todoDialogState"
      v-model="todoDialogState"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="todoForm.id ? '编辑待办' : '新增待办'"
      width="40%"
    >
      <el-form ref="todoRef" label-width="80px" :model="todoForm" :rules="todoRules">
        <el-form-item label="标题" prop="name">
          <el-input v-model="todoForm.name" placeholder="请输入标题"/>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="todoForm.content" placeholder="请输入内容" :rows="5" type="textarea"/>
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="todoForm.top">
            <el-radio fill="#e95648" :label="1">紧急</el-radio>
            <el-radio fill="#ff9d28" :label="2">高</el-radio>
            <el-radio fill="#0488de" :label="3">中</el-radio>
            <el-radio fill="#ebedef" :label="4">低</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button :loading="loading" type="primary" @click="submitFeedback">{{ todoForm.id ? '修 改' : '提 交' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </vab-card>
</template>
<script setup lang="ts">
import {gp} from "/@vab/plugins/vab.ts";
import {addCalendar, delCalendar, editCalendar, getListOrderByCtime} from "/@/api/business.ts";
import type {FormInstance, FormRules} from "element-plus";
import { ElMessageBox } from 'element-plus'

const dayTodo = ref(0)
const done = ref(0)
const undone = ref(0)
const list = ref<Array<any>>([])
const total = ref(0)
const todoDialogState = ref(false)
const loading = ref(false)
const queryParams = reactive<any>({
  pageindex: 1,
  pagesize: 10,
  type: 3,
  state: 0
})
const todoRules = reactive<FormRules>({
  name: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入标题',
    },
  ],
  content: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入内容',
    },
  ],
  top: [
    {
      required: true,
      trigger: 'blur',
      message: '请选择优先级',
    },
  ]
})
let todoForm = reactive({
  name: '',
  top: 3,
  content: ''
})
const props = defineProps({
  todoData: {
    type: Object,
    default: () => {},
  },
})
watch(
  props.todoData,
  () => {
    done.value = props.todoData.done
    undone.value = props.todoData.undone
  },
  { immediate: true }
)
const todoRef = ref<FormInstance>()
const submitFeedback = () => {
  if (todoRef.value)
    todoRef.value?.validate(async (valid: any) => {
      if (valid) {
        const {name, top, content, id, type, state, avtag} = todoForm
        if (id) {
          loading.value = true
          editCalendar({name, top, content, id, type, state, avtag}).then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('修改成功', 'success', 'hey')
              handleClose()
              getTodoList()
            }
          }).finally(() => {
            loading.value = false
          })
        } else {
          loading.value = true
          addCalendar({name, top, content, type: 3, state: 1, avtag: true}).then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('提交成功', 'success', 'hey')
              handleClose()
              getTodoList()
            }
          }).finally(() => {
            loading.value = false
          })
        }
      }
    })
}

const todo = () => {
  queryParams.pageindex = 1
  queryParams.state = 0
  getTodoList()
}
const beDone = () => {
  queryParams.pageindex = 1
  queryParams.state = 2
  getTodoList()
}
const beUndone = () => {
  queryParams.pageindex = 1
  queryParams.state = 1
  getTodoList()
}
const edit = (item: any) => {
  todoForm = reactive(item)
  todoDialogState.value = true
}
const del = (id: any) => {
  delCalendar(id).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('删除成功', 'success', 'hey')
      getTodoList()
    }
  })
}
const setOk = (item: any) => {
  ElMessageBox.confirm(
    '确认已完成吗?',
    'Warning',
    {
      confirmButtonText: '确 认',
      cancelButtonText: '取 消',
      type: 'warning',
    }
  )
    .then(() => {
      const {name, top, content, id, type, avtag} = item
      loading.value = true
      editCalendar({name, top, content, id, type, state: 2, avtag}).then((res: any) => {
        if (res.code === 200) {
          gp.$baseMessage('修改成功', 'success', 'hey')
          queryParams.state = 2
          getTodoList()
        }
      }).finally(() => {
        loading.value = false
      })
    })
    .catch(() => {})
}
const openAdd = () => {
  todoDialogState.value = true
}
const handleClose = () => {
  todoDialogState.value = false
  todoForm.top = 3
  todoForm.name = ''
  todoForm.content = ''
}
const getTodoList = () => {
  getListOrderByCtime(queryParams).then((res: any) => {
    if (res.code === 200) {
      list.value = res.data.rows
      total.value = res.data.total
      switch (queryParams.state) {
      case 0: {
        dayTodo.value = res.data.total
      break;
      }
      case 1: {
        undone.value = res.data.total
      break;
      }
      case 2: {
        done.value = res.data.total
      break;
      }
      // No default
      }
    }
  })
}
onMounted(() => {
  if (props.todoData) {
    done.value = props.todoData.done
    undone.value = props.todoData.undone
  }
  getTodoList()
})
</script>
<style scoped lang="scss">
.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .header-right {
    cursor: pointer;
    color: rgb(44, 202, 135);
  }
}
.num-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  color: rgb(102, 102, 102);
  background: rgb(248, 248, 252);
  box-sizing: border-box;
  padding: 10px 6px;
  .span {
    cursor: pointer;
  }
}
.list-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
}
.list-container:hover {
  background: #ccc;
  border-radius: 4px;
}
.list-content {
  display: flex;
  align-items: center;

  .dian {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #333333;
    margin-right: 6px;
  }
}
.pagination {
  margin-top: 0;
}
</style>
