<template>
  <div class="grouppage">
    <el-form v-show="uptab.admin" :model="uptab" :rules="rules" ref="ruleForm" label-width="100px"
      class="demo-ruleForm">
      <el-form-item label="账号" prop="admin_name">
        <el-input disabled v-model="uptab.admin_name"></el-input>
      </el-form-item>
      <el-form-item label="积分" prop="balance">
        <el-input disabled v-model="uptab.balance"></el-input>
      </el-form-item>
      <el-form-item label="分组" prop="group" required>
        <el-select v-model="uptab.group" placeholder="请选择分组">
          <el-option v-for="item in grouarr" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标签" required prop="bqidarr">
        <!-- <el-radio-group v-model="uptab.bqid">
      <el-radio v-for="item in groulist" :key="item.id" :label="item.id">{{item.name}}</el-radio>
    </el-radio-group> -->
        <el-checkbox-group v-model="uptab.bqidarr">
          <el-checkbox v-for="item in groulist" :key="item.id" :label="item.id" name="type">{{ item.name
            }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <div class="butbox">
          <el-button :loading="loading" class="addmdbut" @click="submitForm('ruleForm')">确定</el-button>
        </div>
      </el-form-item>
    </el-form>
    <el-form v-show="!uptab.admin" :model="form" :rules="rulesform" ref="ruleForm1" label-width="100px"
      class="demo-ruleForm">
      <el-form-item label="账号" required prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" required prop="password">
        <el-input v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item label="分组" prop="group" required>
        <el-select v-model="form.group" placeholder="请选择分组">
          <el-option v-for="item in grouarr" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标签" required prop="bqidarr">
        <!-- <el-radio-group v-model="form.bqid">
      <el-radio v-for="item in groulist" :key="item.id" :label="item.id">{{item.name}}</el-radio>
    </el-radio-group> -->
        <el-checkbox-group v-model="form.bqidarr">
          <el-checkbox v-for="item in groulist" :key="item.id" :label="item.id" name="type">{{ item.name
            }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <div class="butbox">
          <el-button :loading="loading" class="addmdbut" @click="submitForm('ruleForm1')">确定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { deleteadmintag, gettagpagelist, getlist, addchild, changegroup, updateadmintag } from "@/api/table.js"
export default {
  props: {
    activeitem: {
      typeof: Object,
      default: () => {
        return {}
      }
    },
    guanlianobj: {
      typeof: Object,
      default: () => {
        return {}
      }
    },
    tableData: {
      typeof: Array,
      default: () => {
        return []
      }
    }
  },
  watch: {
    guanlianobj: {
      handler(val) {
        if (val && val != {}) {
          this.obj = val;
          this.uptab = {
            admin_name: this.obj.admin_name,
            group: this.obj.group,
            admin: this.obj.admin,
            group_name: this.obj.group_name,
            balance: this.obj.balance,
            bqid: '',
            bqidarr: []
          }
          this.getcheckgrou()
          this.getgrou()
        } else {
          this.uptab = {}
          this.obj = {}
          this.getgrou()
        }
      },
      deep: true,
      immediate: true
    },
    tableData: {
      handler(val) {
        if (val && val != []) {
          this.grouarr = val;
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
  },
  data() {
    return {
      taglistid: [],
      loading: false,
      obj: {},
      grouarr: [],
      uptab: {},
      rules: {
        group: [
          { required: true, message: '请选择分组', trigger: 'change' }
        ],
        // bqid: [
        //   { required: true, message: '请选择标签', trigger: 'change' }
        // ],
        bqidarr: [
          { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }
        ],
      },
      groulist: [],
      form: {
        username: '',
        password: '',
        group: '',
        bqidarr: []
      },
      rulesform: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        group: [
          { required: true, message: '请选择分组', trigger: 'change' }
        ],
        bqidarr: [
          { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }
        ],
      }
    }
  },
  methods: {
    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          if (formName == 'ruleForm') {
            // 设置
            // group admin changegroup
            // admin tag updateadmintaguptab.bqid
            let data = {
              group: this.uptab.group,
              admin: this.uptab.admin
            }
            // console.log(data,"data111");
            // return;
            // let data1={
            //     tag:this.uptab.bqid,
            //     admin:this.uptab.admin
            // }
            let text = 'admin=' + this.uptab.admin + '&tag=' + this.uptab.bqidarr.join('&tag=')
            let text1 = 'admin=' + this.uptab.admin + '&tag=' + this.taglistid.join('&tag=')
            //
            let promarr = [1, 2].map(async (item) => {
              if (item == 1) {
                let res = await changegroup(data)
                if (res.code == 200) {
                  return { success: true, message: res.message }
                } else {
                  return { success: false, message: res.message }
                }

              } else {
                let res1 = await deleteadmintag(text1);
                if (res1.code == 200) {
                  let res = await updateadmintag(text)
                  if (res.code == 200) {
                    return { success: true, message: res.message }
                  } else {
                    return { success: false, message: res.message }
                  }
                } else {
                  return { success: false, message: res1.message }
                }

              }
            })
            this.loading = true;
            Promise.all(promarr).then(res => {
              this.loading = false;
              if (!res[0].success && res[1].success) {
                this.$message.warning('更改分组失败' + res[0].message)
              }
              if (!res[1].success && res[0].success) {
                this.$message.warning('更改标签失败' + res[1].message)
              }
              if (res[1].success && res[0].success) {
                this.$message.success('更改成功')
              }
              this.$emit('setguanlianshow')

            }).catch(() => {
              this.loading = false
            })
          } else {
            // 添加
            let data = {
              "group": this.form.group,
              "username": this.form.username,
              "password": this.form.password,
              "tag": [...this.form.bqidarr]
            }
            this.loading = true
            let res = await addchild(data)
            this.loading = false
            if (res.code == 200) {
              this.$emit('setguanlianshow')
              this.$message.success('添加成功')
            } else {
              this.$message.warning('添加失败')
            }
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    async getgrou() {
      let res = await gettagpagelist({ pageindex: 1, pagesize: 1000 })
      if (res.code == 200) {
        this.groulist = res.data.rows
        // console.log(this.obj,"this.obj");
      }
    },
    async getcheckgrou() {
      let res = await getlist({ admin: this.obj.admin })
      if (res.code == 200) {
        this.uptab.bqid = res.data[0].tag_id
        this.uptab.bqidarr = res.data.map(item => item.tag_id)
        this.taglistid = res.data.map(item => item.tag_id)
        // console.log(this.uptab.bqidarr,"this.uptab.bqid");

      }
    },
  }
}
</script>

<style lang="scss" scoped>
.grouppage {
  width: 100%;
  height: 500px;

  .butbox {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .addmdbut {
    // line-height: 30px;
    background: #fe0000;
    color: #fff;
    border-radius: 6px;
    border: none;
  }
}
</style>
