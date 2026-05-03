<template>
  <div class="notice-container">
    <el-row :gutter="10">
      <el-col :span="4">
        <div class="title">
          内容分类
        </div>
        <el-menu active-text-color="#000000" class="el-menu-vertical-demo" :default-active="active">
          <el-menu-item index="1" @click="setQueryList(1)">
            <el-icon><warning-filled /></el-icon>
            <template #title>
              <span >平台公告</span>
            </template>
          </el-menu-item>
          <el-menu-item index="2" @click="setQueryList(2)">
            <el-icon><list /></el-icon>
            <template #title>
              <span >更新日志</span>
            </template>
          </el-menu-item>
          <el-menu-item index="3" @click="getFeedback">
            <el-icon><list /></el-icon>
            <template #title>
              <span >反馈</span>
            </template>
          </el-menu-item>
          <el-menu-item index="4" @click="dtManage">
            <el-icon><picture-filled /></el-icon>
            <span>动图管理</span>
          </el-menu-item>
          <el-menu-item index="5" @click='setoemshow(true)'>
            <el-icon><picture-filled /></el-icon>
            <span>OEM贴牌管理</span>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="20">
        <div v-if="(!isDtManage)&&oemshow==false" class="table-main">
          <div class="table-tips" style="height: 10px;"></div>
          <div class="table-tools">
            <div v-if="!openFeedback" class="buton pointer" @click="addNotice"><img
              alt="" src="/src/icon/addicon.png">添加{{
                queryParams.type === 1 ? '公告' : '日志' }}
            </div>
          </div>
          <div class="table-box">
            <el-table v-loading="tabeleLoading" :data="tableData" height="calc(100vh - 300px)" style="width: 100%">
              <el-table-column label="id" prop="id" width="160" />
              <el-table-column v-if="!openFeedback" label="标题" prop="name" />
              <el-table-column v-if="queryParams.type === 2 && !openFeedback" label="内容" prop="content" />
              <el-table-column v-if="!openFeedback" label="状态" width="140">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.avtag"
                    active-color="#13ce66"
                    :active-value="true"
                    disabled
                    inactive-color="#ff4949"
                    :inactive-value="false"
                    @change="setSwitch(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column v-if="openFeedback" label="反馈信息">
                <template #default="{ row }">
                  <div>{{ row.msg }}</div>
                </template>
              </el-table-column>
              <el-table-column v-if="openFeedback" label="反馈图片" width="240">
                <template #default="{ row }">
                  <div v-if="row.img && row.img.length > 0">
                    <el-image
                      v-for="(item, index) in row.img"
                      :key="index"
                      :preview-src-list="row.img"
                      :src="item"
                      style="width: 100px;
                      height: 100px"
                    />
                  </div>
                  <div v-else>
                    暂无图片
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="openFeedback" label="联系方式" width="140">
                <template #default="{ row }">
                  <div>{{ row.contact }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="openFeedback ? '反馈时间' : '发布时间'" prop="crtim" width="160" />
              <el-table-column v-if="!openFeedback" label="操作" width="200">
                <template #default="{ row }">
                  <el-button @click="noticeEdit(row)">编辑</el-button>
                  <el-button type="danger" @click="noticeDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-model:current-page="queryParams.pageindex"
              v-model:page-size="queryParams.pagesize"
              v-model:total="total"
              background
              layout="total, prev, pager, next"
              style="margin-top: 20px;"
              @current-change="getList"
            />
          </div>
        </div>
        <div v-if="isDtManage&&oemshow==false" class="dt-container">
          <el-row :gutter="10">
            <el-col :span="4" style="padding-left: 25px">
<!--              <div class="table-tools" style="margin-top: 10px">-->
<!--                <div class="buton pointer"><img alt="" src="../image/icon/addicon.png">添加动图</div>-->
<!--              </div>-->
              <el-tree :data="groupList" :props="defaultProps" @node-click="handleNodeClick"/>
            </el-col>
            <el-col :span="20">
              <div class="table-main">
                <div class="table-box">
                  <el-table v-loading="tabeleLoading" :data="tableData" height="calc(100vh - 200px)" style="width: 100%">
                    <el-table-column label="id" prop="id" width="160" />
                    <el-table-column label="标题" prop="name" width="300"/>
                    <el-table-column label="状态" width="140">
                      <template #default="{ row }">
                        <el-switch
                          v-model="row.avtag"
                          active-color="#13ce66"
                          :active-value="true"
                          disabled
                          inactive-color="#ff4949"
                          :inactive-value="false"
                          @change="setSwitch(row)"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="反馈信息" width="240">
                      <template #default="{ row }">
                        <div>{{ row.msg }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column label="反馈图片" width="240">
                      <template #default="{ row }">
                        <div v-if="row.img && row.img.length > 0">
                          <el-image
                            v-for="(item, index) in row.img"
                            :key="index"
                            :preview-src-list="row.img"
                            :src="item"
                            style="width: 100px; height: 100px"
                          />
                        </div>
                        <div v-else>
                          暂无图片
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="联系方式" width="140">
                      <template #default="{ row }">
                        <div>{{ row.contact }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column :label="openFeedback ? '反馈时间' : '发布时间'" prop="crtim" width="160" />
                    <el-table-column v-if="!openFeedback" label="操作" width="200">
                      <template #default="{ row }">
                        <el-button @click="noticeEdit(row)">编辑</el-button>
                        <el-button type="danger" @click="noticeDelete(row)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-pagination
                    v-model:current-page="queryParams.pageindex"
                    v-model:page-size="queryParams.pagesize"
                    v-model:total="total"
                    background layout="total, prev, pager, next"
                    style="margin-top: 20px;"
                    @current-change="getList"
                  />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="oembox" v-if="oemshow">
          <div class="addadmin">
            <div class="sbmit1" @click="addadminshow(true)"><el-icon color="#ffffff" style="margin-right: 5px;"><Plus /></el-icon>添加用户</div>
            <!-- <el-button type="primary" :icon="Plus"></el-button> -->
            <!-- <el-button type="primary" :icon="Plus" @click="addadminshow(true)">添加用户</el-button> -->
          </div>
          <el-table :data="oemtableData" style="width: 100%;" height="calc(100vh - 200px)">
          <el-table-column prop="date" label="所属用户" width="180" />
          <el-table-column prop="name" label="软件名称" align="center" width="180" />
          <el-table-column prop="address" label="软件logo" align="center" width="180" >
            <template #default="{row}">
                <div style="display: flex;justify-content: center;">
                  <el-image style="width: 100px; height: 100px" :src="row.url" fit="contain" />
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="软件icon" align="center" width="180">
            <template #default="{row}">
                <div style="display: flex;justify-content: center;">
                  <el-image style="width: 100px; height: 100px" :src="row.url" fit="contain" />
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="登录插画" align="center" width="180">
            <template #default="{row}">
                <div style="display: flex;justify-content: center;">
                  <el-image style="width: 180px; height: 100px" :src="row.url" fit="contain" />
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="注册插画" align="center" width="180">
            <template #default="{row}">
                <div style="display: flex;justify-content: center;">
                  <el-image style="width: 180px; height: 100px" :src="row.url" fit="contain" />
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="找回密码插画" align="center" width="180">
            <template #default="{row}">
                <div style="display: flex;justify-content: center;">
                  <el-image style="width: 180px; height: 100px" :src="row.url" fit="contain" />
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="剩余贴牌数" align="center" width="180" />

          <el-table-column prop="address" label="操作" align="center" width="180">
            <template #default>
                <div class="butflex">
                    <el-button type="primary" text='primary' style="margin-left:5px;" @click="sunshow=true">编辑</el-button>
                    <el-button type="danger" text='danger' style="margin-left:5px;">停用</el-button>
                </div>
            </template>
          </el-table-column>
        </el-table>
        </div>
      </el-col>
    </el-row>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="80%">
      <div v-if="queryParams.type === 1" class="announcement-editor-container">
        <!-- 左右分栏布局 -->
        <div class="editor-layout">
          <!-- 左侧：预览效果 -->
          <div class="preview-panel">
            <div class="preview-title">预览效果</div>
            <div class="preview-box">
              <div class="preview-message-box">
                <div class="preview-header">
                  <span class="preview-icon">⚠️</span>
                  <span class="preview-title-text">公告</span>
                </div>
                <div class="preview-content" v-html="formatPreviewContent(ruleForm.name)"></div>
                <div class="preview-footer">
                  <el-button type="primary" size="small">我知道啦</el-button>
                </div>
              </div>
            </div>
            <div class="preview-tips">
              <el-alert
                title="提示"
                type="info"
                :closable="false"
                show-icon
                :description="'这是公告弹窗的预览效果，实际显示时会根据内容自动调整大小'"
              />
            </div>
          </div>

          <!-- 右侧：编辑内容 -->
          <div class="edit-panel">
            <div class="edit-title">编辑内容</div>
            <div class="form-container">
              <el-form ref="ruleForm" class="demo-ruleForm" label-width="80px" :model="ruleForm" :rules="rules">
                <el-form-item label="公告内容" prop="name">
                  <el-input
                    v-model="ruleForm.name"
                    type="textarea"
                    :rows="15"
                    placeholder="请输入公告内容，支持换行&#10;例如：&#10;【V5.3.1版本更新】&#10;亲爱的用户：&#10;本次更新带来全新体验：&#10;🌟 新增功能&#10;1.聚合多平台客服管理：统一处理各平台消息"
                    :autosize="{ minRows: 15, maxRows: 20 }"
                    show-word-limit
                    maxlength="2000"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新日志类型保持原样 -->
      <div v-else class="form-container">
        <el-form ref="ruleForm" class="demo-ruleForm" label-width="100px" :model="ruleForm" :rules="rules">
          <el-form-item label="标题" prop="name">
            <el-input v-model="ruleForm.name" placeholder="请输入公告标题"/>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="ruleForm.content" :rows="5" type="textarea" placeholder="请输入公告内容"/>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span  class="dialog-footer">
          <el-button :loading="btnLoading" type="primary" @click="submitForm('ruleForm')">{{ confirmText }}</el-button>
          <el-button @click="resetForm('ruleForm')">取消</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="adminshow" width="36%" :show-close="false">
      <template #header>
      <div class="my-header">
        <div class="adduserbox"> <el-icon style="margin-right: 5px;" color="#5391f7"><Folder /></el-icon>添加用户</div>
        <div></div>
      </div>
    </template>
    <div>
      <div style="margin: 10px;">请输入用户id:</div>
      <el-input v-model="userfrom.userId" placeholder="请输入用户id"></el-input>
      <div style="margin: 10px;">可贴牌的应用数:</div>
      <el-input v-model="userfrom.userId" placeholder="请输入可贴牌的应用数"></el-input>
      <div style="margin: 10px;">分配的登录网址:</div>
      <el-input v-model="userfrom.userId" placeholder="请输入分配的登录网址"></el-input>
    </div>
    <div class="flexbox">
      <div class="clun" @click="adminshow=false">取消</div>
      <div class="sbmit">保存</div>
    </div>
    </el-dialog>
    <el-dialog v-model="sunshow" title="编辑" width="60%" center>

    <el-form :model="form" >
      <el-form-item label="所属用户:" :label-width="'150px'">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="软件登录地址:" :label-width="'150px'">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="软件名称:" :label-width="'150px'">
      <el-input v-model="form.name" />
    </el-form-item>
    <div class="imgboxflex" style="display: flex; justify-content: center;align-self: center;">
      <el-form-item label="软件logo:"  >
        <el-upload
                      class="avatar-uploader"
                      action=""
                      :show-file-list="false"
                      :limit="1"
                      ref="uploadRef"
                      :http-request="(e)=>{httpRequest(e,3)}"
                    >
                      <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar" />
                      <div v-else style="width: 178px;height: 178px;display: flex;align-items: center;justify-content: center;">
                          <el-icon  class="avatar-uploader-icon"><Plus /></el-icon>
                      </div>
                    </el-upload>
    </el-form-item>
    <el-form-item label="软件icon:" style="margin-left:20px ;">
      <el-upload
                      class="avatar-uploader"
                      action=""
                      :show-file-list="false"
                      :limit="1"
                      ref="uploadRef"
                      :http-request="(e)=>{httpRequest(e,3)}"
                    >
                      <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar" />
                      <div v-else style="width: 178px;height: 178px;display: flex;align-items: center;justify-content: center;">
                          <el-icon  class="avatar-uploader-icon"><Plus /></el-icon>
                      </div>
                    </el-upload>
    </el-form-item>
    </div>
    <div style="display: flex; justify-content: center;align-self: center;margin-bottom: 10px;">
      <div >
        <div style="text-align: center;margin-bottom: 10px;">登录插画</div>
        <el-form-item>
      <el-upload
                      class="avatar-uploader"
                      action=""
                      :show-file-list="false"
                      :limit="1"
                      ref="uploadRef"
                      :http-request="(e)=>{httpRequest(e,3)}"
                    >
                      <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar1" />
                      <div v-else style="width: 300px;height: 178px;display: flex;align-items: center;justify-content: center;">
                          <el-icon  class="avatar-uploader-icon"><Plus /></el-icon>
                      </div>
                    </el-upload>
    </el-form-item>
      </div>
      <div style="margin-left:10px;">
        <div style="text-align: center;margin-bottom: 10px;">登录插画</div>
        <el-form-item>
          <el-upload
                      class="avatar-uploader"
                      action=""
                      :show-file-list="false"
                      :limit="1"
                      ref="uploadRef"
                      :http-request="(e)=>{httpRequest(e,3)}"
                    >
                      <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar1" />
                      <div v-else style="width: 300px;height: 178px;display: flex;align-items: center;justify-content: center;">
                          <el-icon  class="avatar-uploader-icon"><Plus /></el-icon>
                      </div>
                    </el-upload>
    </el-form-item>
      </div>
      <div style="margin-left:10px ;">
        <div style="text-align: center;margin-bottom: 10px;">登录插画</div>
        <el-form-item>
          <el-upload
                      class="avatar-uploader"
                      action=""
                      :show-file-list="false"
                      :limit="1"
                      ref="uploadRef"
                      :http-request="(e)=>{httpRequest(e,3)}"
                    >
                      <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar1" />
                      <div v-else style="width:300px;height: 178px;display: flex;align-items: center;justify-content: center;">
                          <el-icon  class="avatar-uploader-icon"><Plus /></el-icon>
                      </div>
                    </el-upload>
    </el-form-item>
      </div>
    </div>
    <el-form-item label="贴牌时间:" :label-width="'150px'">
      <el-input v-model="form.name" />
    </el-form-item>
    </el-form>
    <div class="flexbox">
      <div class="clun" @click="sunshow=false">取消</div>
      <div class="sbmit" style="width: 100px;">重新打包</div>
    </div>
    </el-dialog>
  </div>
</template>
<script>
import { addcalendar, apis, deletecalendar, editcalendar, getlistorderbyctime } from '/@/api/table.js';
import { List, PictureFilled, WarningFilled ,Plus,Folder} from '@element-plus/icons-vue'
import { gp } from '/@vab/plugins/vab'
export default {
  components: {
    List, PictureFilled, WarningFilled,Plus,Folder
  },
  data() {
    return {
      userfrom:{
        userId:'',
      },
      adminshow:false,
      sunshow:false,
      form:{
        name:'',
        imageUrl:''
      },
      oemtableData:[
        {
          url:'',
          date: '2016-05-03',
          name: 'Tom',
          address: 'No. 189, Grove St, Los Angeles',
        }
      ],
      tableData: [],
      active: '1',
      activeTab: 'edit', // 标签页：edit 编辑内容，preview 预览效果
      currentNotice: {},
      value: true,
      queryParams: {
        pagesize: 20,
        pageindex: 1,
        type: 1,
        state: 0
      },
      tabeleLoading: false,
      total: 0,
      ruleForm: {
        name: '',
        content: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请填写内容', trigger: 'blur' }
        ]
      },
      oemshow:false,
      dialogVisible: false,
      dialogTitle: '提示',
      confirmText: '确认',
      btnLoading: false,
      isAdd: true,
      feedbackParams: {
        page: 1,
        pagesize: 20
      },
      openFeedback: false,
      isDtManage: false,
      defaultProps: {
        children: 'children',
        label: (a, b) => {
          return a.Member.name
        }
      },
      groupList: []
    }
  },
  mounted() {
    this.getList()
    this.getGroupList()
  },
  methods: {
    httpRequest(fileBox,num){
    const reader = new FileReader();
  reader.addEventListener('load', () => {
    let formData = new FormData();
    const fileOfBlob = new File([fileBox.file], fileBox.file.name);
    formData.append('file', fileOfBlob);
    form.imageUrl=fileBox.file.path
    // filerequ(formData).then((res: any) => {
    //   if (!res.url) {
    //     return gp.$baseMessage('上传失败！', 'error', 'hey')
    //   }
    //   currentGif.value = {
    //     gif: res.url,
    //     id: Date.now(),
    //   }
    // })
  })
  reader.readAsDataURL(fileBox.file);
  this.$refs.uploadRef.clearFiles()

},
    addadminshow(val){
      this.adminshow=val;
    },
    setoemshow(val){
      this.isDtManage=false
      this.oemshow=val
    },
    getGroupList() {
      apis('GET', 'shop.get.group', { grouptype: 4, recursionchild: true, }).then(res => {
        if (res.code === 200) {
          this.groupList = res.data
          console.log(this.groupList, 'groupList')
        }
      })
    },
    handleNodeClick(data) {
      console.log(data);
    },
    dtManage() {
      this.oemshow=false;
      this.isDtManage = true
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          if (this.isAdd) {
            addcalendar(this.ruleForm).then(res => {
              if (res.code === 200) {
                gp.$baseMessage('添加成功！', 'success', 'hey')
                this.getList()
                this.resetForm('ruleForm')
              }
            }).catch(error => {
              console.log(error)
            }).finally(() => {
              this.btnLoading = false
            })
          } else {
            editcalendar(this.ruleForm).then(res => {
              if (res.code === 200) {
                gp.$baseMessage('修改成功！', 'success', 'hey')
                this.getList()
                this.resetForm('ruleForm')
              }
            }).catch(error => {
              console.log(error)
            }).finally(() => {
              this.btnLoading = false
            })
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.dialogVisible = false
    },
    setQueryList(type) {
    this.oemshow=false
      this.openFeedback = false
      this.queryParams.type = type
      this.queryParams.pageindex = 1
      this.isDtManage = false
      this.getList()
    },
    getList() {
      this.tabeleLoading = true
      if (!this.queryParams.type) {
        console.log(this.queryParams, '123')
        const {pageindex, pagesize} = this.queryParams
        this.feedbackParams = {
          page: pageindex,
          pageSize: pagesize
        }
        return this.getFeedback()
      }
      getlistorderbyctime(this.queryParams).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.rows
          this.total = res.data.total
        }
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.tabeleLoading = false
      })
    },
    getFeedback() {
      this.oemshow=false
      this.isDtManage = false
      this.queryParams.type = null
      this.tabeleLoading = true

      if (typeof apis !== 'function') {
        console.error('apis is not a function');
        this.tabeleLoading = false;
        return;
      }

      apis('GET', 'feedback.list', this.feedbackParams)
        .then(res => {
          if (res && res.code === 200) {
            this.tableData = res.data.rows
            this.total = res.data.total
            this.openFeedback = true
          }
        })
        .catch(error => {
          console.error('Feedback API error:', error);
          gp.$baseMessage('获取反馈列表失败', 'error', 'hey');
        })
        .finally(() => {
          this.tabeleLoading = false
        })
    },
    addNotice() {
      this.isAdd = true
      this.dialogTitle = this.queryParams.type === 1 ? '添加公告' : '添加日志'
      this.confirmText = '立即创建'
      this.ruleForm.type = this.queryParams.type
      this.activeTab = 'edit' // 默认显示编辑标签页
      this.dialogVisible = true
    },
    noticeEdit(row) {
      this.isAdd = false
      this.dialogTitle = this.queryParams.type === 1 ? '修改公告' : '修改日志'
      this.confirmText = '立即修改'
      const { id, name, content, type } = row
      if (this.queryParams.type === 1) {
        this.ruleForm = { id, name, type, content: '' }
      } else {
        this.ruleForm = { id, name, content, type }
      }
      this.activeTab = 'edit' // 默认显示编辑标签页
      this.dialogVisible = true
    },
    // 格式化预览内容，将换行符转换为 <br> 标签
    formatPreviewContent(content) {
      if (!content) return '请输入公告内容'
      return content.replace(/\n/g, '<br>')
    },
    noticeDelete(row) {
      deletecalendar(row.id).then(res => {
        if (res.code === 200) {
          gp.$baseMessage('删除成功！', 'success', 'hey')
          this.getList()
        }
      }).catch()
    },
    setSwitch(row) {
      console.log(row)
    }
  }
}
</script>
<style lang="scss" scoped>
   .avatar-uploader ::v-deep .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }
::v-deep .imgboxflex{
  .avatar-uploader .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    .avatar-uploader .avatar1 {
      width: 200px;
      height: 178px;
      display: block;
    }


    .avatar-uploader .el-upload:hover {
      border-color: var(--el-color-primary);
    }
    .uplod{
        width: 178px;
        height: 178px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
    //   width: 178px;
    //   height: 178px;
      text-align: center;
    }
}
.notice-container ::v-deep .is-active{
    background-color: var(--el-color-primary-light-9);
  }
  .my-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--el-padding) 0 var(--el-padding);
  }

  // 公告编辑器容器 - 左右分栏布局
  .announcement-editor-container {
    .editor-layout {
      display: flex;
      gap: 20px;
      height: calc(100vh - 350px);
      min-height: 500px;
    }

    // 左侧预览面板
    .preview-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      overflow: hidden;

      .preview-title {
        padding: 15px 20px;
        font-size: 16px;
        font-weight: 500;
        color: #333;
        background: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
      }

      .preview-box {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
        background: #fafafa;
        overflow-y: auto;
      }

      .preview-message-box {
        width: 100%;
        max-width: 420px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        overflow: hidden;

        .preview-header {
          display: flex;
          align-items: center;
          padding: 20px 20px 15px;
          border-bottom: 1px solid #ebeef5;

          .preview-icon {
            font-size: 20px;
            margin-right: 8px;
          }

          .preview-title-text {
            font-size: 18px;
            font-weight: 500;
            color: #303133;
          }
        }

        .preview-content {
          padding: 20px;
          text-align: left;
          line-height: 1.8;
          color: #333;
          font-size: 14px;
          min-height: 150px;
          max-height: 400px;
          overflow-y: auto;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .preview-footer {
          display: flex;
          justify-content: center;
          padding: 15px 20px 20px;
          border-top: 1px solid #ebeef5;
        }
      }

      .preview-tips {
        padding: 15px 20px;
        border-top: 1px solid #ebeef5;
        background: #fff;
      }
    }

    // 右侧编辑面板
    .edit-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      overflow: hidden;

      .edit-title {
        padding: 15px 20px;
        font-size: 16px;
        font-weight: 500;
        color: #333;
        background: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
      }

      .form-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;

        :deep(.el-textarea) {
          .el-textarea__inner {
            font-family: inherit;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        }
      }
    }
  }

  .adduserbox{
    display: flex;
    align-items: center;
    font-weight: 500;
  }
  .flexbox{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
    padding-bottom: var(--el-padding);
    .clun{
      padding: 10px 15px;
      width: 80px;
      text-align: center;
      border: 1px solid #cec8c8;
    }
    .sbmit{
      padding: 10px 15px;
      color: #fff;
      width: 80px;
      text-align: center;
      background: var(--el-color-primary);
      margin-left: 10px;
    }
  }
  .sbmit1{
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    padding: 10px 15px;
      color: #fff;
      text-align: center;
      background: var(--el-color-primary);
      margin-left: 10px;
  }
  .oembox{
    .imgbox{
    width: 50px;
    height: 50px;
    background: #8c939d;
    border-radius: 8px;
    overflow: hidden;
}
.butflex{
    display: flex;
    align-items: center;
    justify-content: center;
}
.addadmin{
  display: flex;
  justify-content: end;
}
  }
.notice-container {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  background-color: #ffffff;

  .title {
    font-weight: bold;
    font-size: 18px;
    line-height: 60px;
  }

  .table-main {
    width: 100%;
    box-sizing: border-box;
    padding: 0 20px;
  }
}

.buton {
  width: 100px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #2CCA87;
  color: #2CCA87;
  border-radius: 4px;
  margin-right: 10px;

  img {
    margin-right: 5px;
  }
}

.table-tools {
  margin-bottom: 20px;
}
</style>
