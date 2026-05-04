<template>
  <div>
    <vab-card>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="团队商家列表" name="first" />
        <el-tab-pane label="团队app设置" name="second" />
      </el-tabs>
      <div v-if="activeName === 'first'" class="filter-main">
        <div class="filter-item">
          <el-button :icon="Plus" type="primary" @click="handleAdd">添加商家</el-button>
        </div>
        <div class="filter-item">
          <el-segmented v-model="online" :options="onlineOptions" size="large" @change="handleChangeOnline" />
          <el-input
            v-model="queryForm.word"
            clearable
            placeholder="搜索门店名称或ID或备注"
            style="margin-left: 20px"
            @change="getAdminListData"
          />
        </div>
      </div>
      <div v-if="activeName === 'second'" class="filter-item">
        <el-segmented v-model="filterApp" :options="filterAppOptions" size="large" @change="handleChangeFilterApp" />
      </div>
    </vab-card>
    <vab-card style="margin-bottom: 0">
      <div v-if="activeName === 'first'">
        <el-table v-loading="listLoading" :data="list" height="calc(100vh - 350px)" style="width: 100%">
          <el-table-column align="center" label="账号" prop="user_name" />
          <el-table-column align="center" label="账号ID" prop="code" />
          <el-table-column align="center" label="剩余积分" prop="balance">
            <template #default="{ row }">
              <div :class="{ 'blur-text': demoMode }">{{ row.balance || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="MT门店数" prop="mt_count" />
          <el-table-column align="center" label="ELM门店数" prop="ele_count" />
          <el-table-column align="center" label="注册时间" prop="crtim" />
          <el-table-column align="center" label="上次登录时间" prop="login_time" />
          <el-table-column align="center" label="操作">
            <template #default="{ row }">
              <el-button type="text" @click="fpjf(row)">分配积分</el-button>
              <el-button type="text" @click="deleteShop(row)">停用</el-button>
            </template>
          </el-table-column>
        </el-table>
        <vab-pagination
          :current-page="queryForm.page"
          :page-size="queryForm.pageSize"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
      <div v-if="activeName === 'second'">
        <div v-if="appState === 1">
          <div class="main-title">
            <div class="main-title-left">
              <el-segmented
                v-model="filterVideo"
                :options="filterVideoOptions"
                size="large"
                style="margin-right: 20px"
                @change="handleChangeFilterVideo"
              />
              <el-switch v-model="useGrid" active-text="宫格" inactive-text="列表" @change="handleLayoutChange" />
            </div>
            <div class="main-title-right">
              <el-button :icon="Plus" type="primary" @click="publishTutorial">发布教程</el-button>
            </div>
          </div>
          <div class="main-container">
            <div ref="courses" :class="{ videobox: useGrid == true, 'videobox-drop': useGrid == false }">
              <div v-for="(course, index) in videoList" :key="course.id" class="videoitem" :data-index="index">
                <div class="vide">
                  <img :src="course.img" style="width: 100%; height: 100%; object-fit: cover" />
                </div>
                <div class="desc">
                  <div style="font-weight: 500; font-size: 14px; margin: 10px 0">{{ course.title }}</div>
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <div style="font-size: 12px">上架时间：{{ course.crtim }}</div>

                    <el-popover placement="bottom" trigger="click">
                      <div class="course-btn" @click="editCourse(course)">编辑</div>
                      <div class="course-btn" @click="delCourseData(course)">删除</div>
                      <template #reference>
                        <el-icon><more-filled /></el-icon>
                      </template>
                    </el-popover>
                  </div>
                </div>
              </div>
            </div>
            <vab-pagination
              :current-page="courseParams.page"
              :page-size="courseParams.pagesize"
              :total="videoTotal"
              @current-change="handleCourseCurrentChange"
              @size-change="handleCourseSizeChange"
            />
          </div>
        </div>
        <div v-if="appState === 2">
          <div style="width: 100%; display: flex; justify-content: flex-end">
            <el-button :icon="Plus" type="primary" @click="addMsgState">发布消息</el-button>
          </div>
          <el-table v-loading="listLoading" :data="msgTableData" height="calc(100vh - 350px)" style="width: 100%">
            <el-table-column label="标题名称" prop="title" width="150px" />
            <el-table-column label="时间" prop="uptim" width="200px" />
            <el-table-column label="消息内容" prop="msg" />
            <el-table-column label="消息备注" prop="notes" />
            <el-table-column label="操作" width="150px">
              <template #default="{ row }">
                <el-button :loading="btnLoading" @click="deleteMsg(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <vab-pagination
            :current-page="msgParams.page"
            :page-size="msgParams.pagesize"
            :total="msgTotal"
            @current-change="handleMsgCurrentChange"
            @size-change="handleMsgSizeChange"
          />
        </div>
        <div v-if="appState === 3">
          <el-table :data="feedbackListData" height="calc(100vh - 350px)" style="width: 100%">
            <el-table-column label="反馈时间" prop="uptim" width="200px" />
            <el-table-column label="反馈用户" prop="user" width="200px" />
            <el-table-column label="联系方式" prop="contact" />
            <el-table-column label="反馈图片" prop="img">
              <template #default="{ row }">
                <el-image
                  fit="cover"
                  :initial-index="4"
                  :max-scale="7"
                  :min-scale="0.2"
                  :preview-src-list="[row.img]"
                  :preview-teleported="true"
                  :src="row.img"
                  style="width: 100px; height: 100px"
                  :zoom-rate="1.2"
                />
              </template>
            </el-table-column>
            <el-table-column label="反馈内容" prop="msg" />
            <el-table-column fixed="right" label="是否已读" width="150px">
              <template #default="{ row }">
                <el-button type="text" @click="updateFeedback(row)">设为{{ row.is_read ? '已读' : '未读' }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <vab-pagination
            :current-page="feedbackParams.page"
            :page-size="feedbackParams.pagesize"
            :total="feedbackTotal"
            @current-change="handleFeedbackCurrentChange"
            @size-change="handleFeedbackSizeChange"
          />
        </div>
        <div v-if="appState === 4">
          <div v-loading="listLoading" class="setmein">
            <div style="flex: 1">
              <div style="font-weight: 500; font-size: 16px; margin-bottom: 10px">我的设置</div>
              <div class="inputbox">
                <span style="font-size: 14px; margin-right: 10px">团队logo</span>
                <div>
                  <vab-upload :img="userInfoForm.logo" :limit="1" @set-upload-img="getUploadImg" />
                  <div style="font-size: 14px; margin: 6px 0 10px 0">
                    *图片不得大于2M，长宽比1:1，格式为jpg/png，尺寸最小为240*240px，最优为800*800px
                  </div>
                </div>
              </div>
              <div class="inputbox">
                <div class="input-item">
                  <span style="font-size: 14px; margin-right: 10px">团队名称</span>
                  <el-input v-model="userInfoForm.team_name" style="width: 180px; margin-right: 20px" />
                </div>
                <div class="input-item">
                  <span style="font-size: 14px; margin-right: 10px">团队代码</span>
                  <el-input v-model="userInfoForm.team_code" disabled style="width: 180px" />
                </div>
              </div>
              <div style="font-weight: 500; font-size: 16px; margin-bottom: 10px">联系我们</div>
              <div class="inputbox">
                <div class="input-item">
                  <span style="font-size: 14px; margin-right: 10px">联系总部</span>
                  <el-input v-model="userInfoForm.contact_main" style="width: 180px; margin-right: 20px" />
                </div>
                <div class="input-item">
                  <span style="font-size: 14px; margin-right: 10px">联系客服</span>
                  <el-input v-model="userInfoForm.contact_server" style="width: 180px" />
                </div>
              </div>
              <div class="inputbox">
                <div class="input-item">
                  <span style="font-size: 14px; margin-right: 10px">联系运营</span>
                  <el-input v-model="userInfoForm.onteact_sell" style="width: 180px; margin-right: 20px" />
                </div>
              </div>
            </div>
            <div class="butbox">
              <el-button class="primary" :loading="btnLoading" type="primary" @click="updateTeamInfo">保 存</el-button>
            </div>
          </div>
        </div>
      </div>
    </vab-card>
    <el-dialog v-model="dialogFormVisible" title="添加用户" width="500px">
      <el-form ref="ruleForm" :model="userParams" :rules="userRule">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userParams.phone" autocomplete="off" size="small" />
        </el-form-item>
        <div style="font-size: 14px; color: #e02020">
          密码会自动以短信的形式下发到手机号，请确保填写的手机号能正常接收短信。
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="btnLoading" type="primary" @click="addAdmin">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="jfdioal" :destroy-on-close="true" title="分配积分" width="500px">
      <div class="jifenbox">
        <el-form ref="ruleFormRef" class="demo-ruleForm" label-width="100" :model="form" :rules="rules">
          <el-form-item label="对方用户ID" prop="id">
            <el-input v-model="form.id" disabled />
          </el-form-item>
          <el-form-item label="分配积分" prop="balance">
            <el-input v-model="form.balance" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="sumjfen">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog v-model="msgDialogState" :destroy-on-close="true" title="发布消息" width="500px">
      <div class="jifenbox" style="padding-bottom: 30px">
        <el-form ref="msgFormInstance" class="demo-ruleForm" label-width="100" :model="msgForm" :rules="msgRules">
          <el-form-item label="消息标题" prop="title">
            <el-input v-model="msgForm.title" />
          </el-form-item>
          <el-form-item label="消息内容" prop="msg">
            <el-input v-model="msgForm.msg" :rows="4" type="textarea" />
          </el-form-item>
          <el-form-item label="消息备注">
            <el-input v-model="msgForm.notes" :rows="4" type="textarea" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="sumAddMsg">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog
      v-model="tutorialsFormState"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="tutorialsForm.id ? '编辑教程' : '发布教程'"
      width="500px"
    >
      <div class="jifenbox" style="padding-bottom: 30px">
        <el-form
          ref="tutorialsFormInstance"
          class="demo-ruleForm"
          label-width="100"
          :model="tutorialsForm"
          :rules="tutorialsFormRules"
        >
          <el-form-item label="教程类目" prop="group">
            <el-select v-model="tutorialsForm.group" placeholder="请选择教程类目">
              <el-option v-for="item in videoOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="标题名称" placeholder="请输入标题名称" prop="title">
            <el-input v-model="tutorialsForm.title" />
          </el-form-item>
          <el-form-item label="视频封面" prop="img">
            <vab-upload :img="tutorialsForm.img" :limit="1" @set-upload-img="getUploadTutorialsImg" />
          </el-form-item>
          <el-form-item label="视频链接" placeholder="请输入视频链接" prop="src">
            <div v-loading="videoUploadLoading">
              <el-radio-group v-model="radioState" @change="changeRadioState">
                <el-radio value="1">视频上传</el-radio>
                <el-radio value="2">链接上传</el-radio>
              </el-radio-group>
              <el-upload
                v-if="radioState == 1"
                v-model:file-list="videoFileList"
                accept="video/*"
                action="system/method/file/upload"
                :before-upload="beforeUpload"
                drag
                :http-request="handleUpload"
                multiple
              >
                <i class="el-icon-upload" />
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              </el-upload>
              <el-input v-if="radioState == 2" v-model="tutorialsForm.src" />
            </div>
          </el-form-item>
          <el-form-item v-if="!videoUploadLoading">
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button @click="handleDialogClose">取消</el-button>
              <el-button :loading="btnLoading" type="primary" @click="confPublishTutorial">发布</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { MoreFilled, Plus } from '@element-plus/icons-vue'
import {
  addCourse,
  addMsg,
  addUser,
  delCourse,
  delMsg,
  getAdminList,
  getCourseCourses,
  getCourseGroups,
  getFeedback,
  getMsg,
  getTeamInfo,
  saveTeamInfo,
  setRead,
  updateAgency,
  updateCourse,
  giveIntegral
} from '/@/api/group.ts'
import { gp } from '/@vab/plugins/vab.ts'
import { translate } from '/@/i18n'
import { isPhone } from '/@/utils/validate.ts'
import type { TableInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '/@/store/modules/settings'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const activeName = ref('first')
const btnLoading = ref(false)
const tutorialsFormState = ref(false)
const handleDialogClose = () => {
  tutorialsFormState.value = false
  tutorialsForm = reactive({
    avtag: true,
    group: '',
    img: '',
    src: '',
    title: ''
  })
  radioState.value = '1'
}
const handleClick = () => {
  console.log(activeName.value)
}
const validatePhone = (rule: any, value: any, callback: any) => {
  if (isPhone(value)) {
    callback()
  } else {
    callback(new Error(translate('请输入正确的手机号')))
  }
}
const dialogFormVisible = ref(false)
const listLoading = ref(false)
const ruleForm = ref<TableInstance>()
const msgFormInstance = ref<TableInstance>()
const tutorialsFormInstance = ref<TableInstance>()
const userRule = {
  phone: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机号')
    },
    { validator: validatePhone, trigger: 'blur' }
  ]
}
const userParams = reactive({
  phone: '',
  is_boss: false
})
const rules = {
  id: [{ required: true, message: '请输入对方用户ID', trigger: 'blur' }],
  balance: [{ required: true, message: '请输入分配积分', trigger: 'blur' }]
}
const msgRules = {
  title: [{ required: true, message: '请输入标题名称', trigger: 'blur' }],
  msg: [{ required: true, message: '请输入消息内容', trigger: 'blur' }]
}
const handleAdd = () => {
  dialogFormVisible.value = true
  userParams.phone = ''
}
const addAdmin = () => {
  if (ruleForm.value)
    ruleForm.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        addUser(userParams)
          .then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('添加成功！', 'success', 'hey')
              getAdminListData()
              dialogFormVisible.value = false
            }
          })
          .finally(() => {
            btnLoading.value = false
          })
      }
    })
}
const queryForm = reactive<any>({
  page: 1,
  pageSize: 20,
  word: '',
  userType: 2,
  avtag: true
})
const list = ref<any>([])
const total = ref<number>(0)
const getAdminListData = () => {
  listLoading.value = true
  getAdminList(queryForm)
    .then((res: any) => {
      if (res.code === 200) {
        list.value = res.data.rows
        total.value = res.data.total
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}
getAdminListData()
const jfdioal = ref(false)
let form = reactive({
  id: '',
  balance: ''
})
const currentRow = ref({})
const ruleFormRef = ref<TableInstance>()
const fpjf = (row: any) => {
  jfdioal.value = true
  form = reactive({
    id: row.id,
    balance: ''
  })
  currentRow.value = row
}
const sumjfen = () => {
  if (ruleFormRef.value)
    ruleFormRef.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        giveIntegral({
          userId: form.id,
          giveVal: form.balance
        })
          .then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('分配成功', 'success', 'hey')
              getAdminListData()
              jfdioal.value = false
            }
          })
          .finally(() => {
            btnLoading.value = false
          })
        // updateAgency({
        //   id: form.id,
        //   balance: parseInt(form.balance) + parseInt(currentRow.value.balance),
        // })
        //   .then((res: any) => {
        //     if (res.code === 200) {
        //       gp.$baseMessage('分配成功', 'success', 'hey')
        //       getAdminListData()
        //       jfdioal.value = false
        //     }
        //   })
        //   .finally(() => {
        //     btnLoading.value = false
        //   })
      }
    })
}
const deleteShop = (row: any) => {
  listLoading.value = true
  updateAgency({
    id: row.id,
    avtag: !row.avtag
  })
    .then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('操作成功', 'success', 'hey')
        getAdminListData()
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}
const handleSizeChange = (value: number) => {
  queryForm.page = 1
  queryForm.pageSize = value
  getAdminListData()
}

const handleCurrentChange = (value: number) => {
  queryForm.page = value
  getAdminListData()
}
const online = ref('全部')
const onlineOptions = ['全部', '启用', '停用']
const handleChangeOnline = () => {
  switch (online.value) {
    case '启用': {
      queryForm.avtag = true
      break
    }
    case '停用': {
      queryForm.avtag = false
      break
    }
    default: {
      queryForm.avtag = undefined
    }
  }
  getAdminListData()
}
const filterApp = ref('教学')
const filterAppOptions = ['教学', '消息', '反馈', '我的']
const appState = ref(1)
const handleChangeFilterApp = () => {
  switch (filterApp.value) {
    case '教学': {
      appState.value = 1
      console.log(123456)
      break
    }
    case '消息': {
      appState.value = 2
      getMsgList()
      break
    }
    case '反馈': {
      appState.value = 3
      getFeedbackList()
      break
    }
    case '我的': {
      appState.value = 4
      getTeamInfoData()
      break
    }
  }
}
const filterVideo = ref('全部')
const filterVideoOptions = ref(['全部'])
const handleChangeFilterVideo = () => {
  switch (filterVideo.value) {
    case '产品教学': {
      courseParams.group = videoOptions.value.find((item: any) => item.name === '产品教学')?.id
      break
    }
    case '运营教学': {
      courseParams.group = videoOptions.value.find((item: any) => item.name === '运营教学')?.id
      break
    }
    default: {
      courseParams.group = undefined
    }
  }
  getCourseCoursesData()
}
const videoOptions = ref<any>([])
const getGroups = () => {
  getCourseGroups().then((res: any) => {
    if (res.code === 200) {
      videoOptions.value = res.data
      videoOptions.value.forEach((item: any) => {
        filterVideoOptions.value.push(item.name)
      })
    }
  })
}
const tutorialsFormRules = {
  group: [{ required: true, message: '请选择教程类目', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题名称', trigger: 'blur' }],
  img: [{ required: true, message: '请上传视频封面', trigger: 'blur' }],
  src: [{ required: true, message: '请输入视频链接', trigger: 'blur' }]
}
let tutorialsForm = reactive({
  avtag: true,
  group: '',
  img: '',
  src: '',
  title: ''
})
const publishTutorial = () => {
  tutorialsFormState.value = true
}
const confPublishTutorial = () => {
  if (tutorialsFormInstance.value)
    tutorialsFormInstance.value?.validate(async (valid: any) => {
      if (valid) {
        if (tutorialsForm.id) {
          btnLoading.value = true
          const { avtag, group, id, img, src, title } = tutorialsForm
          updateCourse({ avtag, group, id, img, src, title })
            .then((res: any) => {
              if (res.code === 200) {
                gp.$baseMessage('修改成功!', 'success', 'hey')
                tutorialsFormState.value = false
                getCourseCoursesData()
                tutorialsForm = reactive({
                  avtag: true,
                  group: '',
                  img: '',
                  src: '',
                  title: ''
                })
              }
            })
            .finally(() => {
              btnLoading.value = false
            })
        } else {
          btnLoading.value = true
          addCourse(tutorialsForm)
            .then((res: any) => {
              if (res.code === 200) {
                gp.$baseMessage('添加成功!', 'success', 'hey')
                tutorialsFormState.value = false
                getCourseCoursesData()
                tutorialsForm = reactive({
                  avtag: true,
                  group: '',
                  img: '',
                  src: '',
                  title: ''
                })
              }
            })
            .finally(() => {
              btnLoading.value = false
            })
        }
      }
    })
}
getGroups()
const courseLoading = ref(false)
const courseParams = reactive({
  page: 1,
  pagesize: 20,
  group: undefined
})
const videoList = ref<any>([])
const videoTotal = ref(0)
const getCourseCoursesData = () => {
  courseLoading.value = true
  getCourseCourses(courseParams)
    .then((res: any) => {
      if (res.code === 200) {
        videoList.value = res.data.rows
        videoList.value.sort((a: any, b: any) => b.index - a.index)
        videoTotal.value = res.data.total
      }
    })
    .finally(() => {
      courseLoading.value = false
    })
}
const handleCourseSizeChange = (value: number) => {
  courseParams.page = 1
  courseParams.pagesize = value
  getCourseCoursesData()
}

const handleCourseCurrentChange = (value: number) => {
  courseParams.page = value
  getCourseCoursesData()
}
const editCourse = (row: any) => {
  const data = JSON.parse(JSON.stringify(row))
  if (row.src) {
    radioState.value = '2'
  }
  tutorialsForm = reactive(data)
  tutorialsFormState.value = true
}
const delCourseData = (row: any) => {
  ElMessageBox.confirm('确认进行此操作吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    draggable: true
  }).then(() => {
    delCourse(row.id).then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('删除成功!', 'success', 'hey')
        getCourseCoursesData()
      }
    })
  })
}
getCourseCoursesData()
const useGrid = ref(true)
const handleLayoutChange = () => {
  console.log(useGrid.value)
}

const msgTableData = ref([])
const msgTotal = ref(0)
const msgParams = reactive({
  page: 1,
  pagesize: 20
})
const getMsgList = () => {
  listLoading.value = true
  getMsg(msgParams)
    .then((res: any) => {
      if (res.code === 200) {
        msgTableData.value = res.data.rows
        msgTotal.value = res.data.total
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}
const msgDialogState = ref(false)
let msgForm = reactive({
  title: '',
  msg: '',
  notes: ''
})
const addMsgState = () => {
  msgDialogState.value = true
  msgForm = reactive({
    title: '',
    msg: '',
    notes: ''
  })
}
const sumAddMsg = () => {
  if (msgFormInstance.value)
    msgFormInstance.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        addMsg(msgForm)
          .then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('添加成功!', 'success', 'hey')
              msgDialogState.value = false
              getMsgList()
            }
          })
          .finally(() => {
            btnLoading.value = false
          })
      }
    })
}
const deleteMsg = (row: any) => {
  console.log(row, '123')
  listLoading.value = true
  delMsg(row.id).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('删除成功!', 'success', 'hey')
      getMsgList()
    }
  })
}
const handleMsgSizeChange = (value: number) => {
  msgParams.page = 1
  msgParams.pagesize = value
  getMsgList()
}

const handleMsgCurrentChange = (value: number) => {
  msgParams.page = value
  getMsgList()
}
const feedbackParams = reactive({
  page: 1,
  pagesize: 20
})
const feedbackListData = ref([])
const feedbackTotal = ref(0)
const getFeedbackList = () => {
  listLoading.value = true
  getFeedback(feedbackParams).then((res: any) => {
    if (res.code === 200) {
      feedbackListData.value = res.data.rows
      feedbackTotal.value = res.data.total
    }
  })
}
const handleFeedbackSizeChange = (value: number) => {
  feedbackParams.page = 1
  feedbackParams.pagesize = value
  getFeedbackList()
}
const handleFeedbackCurrentChange = (value: number) => {
  feedbackParams.page = value
  getFeedbackList()
}
const updateFeedback = (row: any) => {
  setRead({
    id: row.id,
    is_read: !row.is_read
  }).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('设置成功', 'success', 'hey')
    }
    getFeedbackList()
  })
}
let userInfoForm = reactive({
  logo: '',
  team_name: '',
  team_code: '',
  contact_main: '',
  contact_server: '',
  onteact_sell: ''
})
const getTeamInfoData = () => {
  listLoading.value = true
  getTeamInfo()
    .then((res: any) => {
      if (res.code === 200) {
        const { logo, team_name, team_code, contact_main, contact_server, onteact_sell } = res.data
        userInfoForm = reactive({
          logo,
          team_name,
          team_code,
          contact_main,
          contact_server,
          onteact_sell
        })
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}
const getUploadImg = (fileList: any): void => {
  if (fileList.length > 0) {
    userInfoForm.logo = fileList[0].url
  } else {
    userInfoForm.logo = ''
  }
}
const getUploadTutorialsImg = (fileList: any): void => {
  if (fileList.length > 0) {
    tutorialsForm.img = fileList[0].url
  } else {
    tutorialsForm.img = ''
  }
}
const updateTeamInfo = () => {
  btnLoading.value = true
  saveTeamInfo(userInfoForm)
    .then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('设置成功', 'success', 'hey')
        getTeamInfoData()
      }
    })
    .finally(() => {
      btnLoading.value = false
    })
}
const videoFileList = ref([])
const videoUploadLoading = ref(false)
const radioState = ref('1')
const changeRadioState = () => {
  console.log(radioState.value)
}
const getToken = (): string => {
  return localStorage.getItem('shop-vite-token') || ''
}

const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/')
  if (!isVideo) {
    gp.$baseMessage('只能上传视频文件', 'error', 'hey')
  }
  return isVideo
}

const handleUpload = async (options: any) => {
  const formData = new FormData()
  formData.append('file', options.file)
  const baseUrlStr = localStorage.getItem('baseUrl')
  const { default: rawBaseUrl } = JSON.parse(baseUrlStr)
  const baseUrl = typeof rawBaseUrl === 'string' ? (rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`) : ''
  const action = `${baseUrl}system/method/file/upload`
  try {
    videoUploadLoading.value = true
    const response = await axios.post(action, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getToken()}`
      }
    })
    gp.$baseMessage('文件上传成功', 'success', 'hey')
    console.log('Upload successful:', response.data)
  } catch (error) {
    gp.$baseMessage('文件上传失败，请稍后再试', 'error', 'hey')
    videoFileList.value = []
    console.error('There was an error uploading the video!', error)
  } finally {
    videoUploadLoading.value = false
  }
}
</script>
<style scoped lang="scss">
.filter-main {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .filter-item {
    display: flex;
    align-items: center;
  }
}

.inputbox {
  display: flex;
  align-items: flex-start;

  span {
    line-height: 32px;
  }

  .input-item {
    margin-bottom: 10px;
    display: flex;
    align-items: flex-start;
  }
}

.main-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.videobox-drop {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;

  .videoitem {
    display: flex;
    margin-bottom: 10px;

    .vide {
      width: 100px;
      height: 100px;
      background: #d8d8d8;
      border-radius: 6px;
      overflow: hidden;
    }

    .desc {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      padding-left: 20px;
      padding-right: 50px;
    }
  }
}

.videobox {
  display: flex;
  margin-top: 10px;
  flex-wrap: wrap;
  // align-self:start;
  justify-content: start;

  .videoitem {
    margin-bottom: 10px;
    margin-right: 10px;
    width: calc((100% - 30px) / 4);

    .vide {
      width: 100%;
      height: 228px;
      background: #d8d8d8;
      border-radius: 6px;
      overflow: hidden;
    }

    .desc {
      padding: 8px 16px 16px;
    }
  }

  .videoitem:nth-of-type(4n) {
    margin-right: 0;
  }
}

.blur-text {
  filter: blur(3px);
  user-select: none;
}
</style>
