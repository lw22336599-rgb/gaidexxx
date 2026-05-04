<template>
  <div class="glshop">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="未关联店铺" name="0" />
      <el-tab-pane label="已关联店铺" name="1" />
    </el-tabs>
    <div v-show="activeName == 0" class="contenbox" style="height: 600px">
      <el-table v-loading="shopgrouload" :data="shopgrouobj" height="560px" style="width: 100%">
        <el-table-column size="medium " prop="check" width="80px" label="">
          <template v-slot="scope">
            <div class="imgbox" style="width: 80px">
              <el-checkbox v-model="scope.row.check" />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="img" width="120px" label="门店图片">
          <template v-slot="scope">
            <div class="imgbox">
              <el-image :src="scope.row.img">
                <template v-slot:placeholder>
                  <div class="image-slot">
                    <i class="el-icon-loading" />
                  </div>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" width="200px" label="店铺名称" />
        <el-table-column prop="shop_id" label="店铺ID" />
        <el-table-column prop="city" label="城市" />
      </el-table>
      <el-pagination
        :current-page="shoppageNo"
        :page-size="shoppageSize"
        layout="total, prev, pager, next"
        background
        :total="shoptotal"
        @current-change="shopCurrentChange"
      />
    </div>
    <div v-show="activeName == 1" class="contenbox" style="height: 600px">
      <el-table v-loading="shopgrouload" :data="shopgrouobj1" height="560px" style="width: 100%">
        <el-table-column size="medium " prop="check" width="80px" label="">
          <template v-slot="scope">
            <div class="imgbox" style="width: 80px">
              <el-checkbox v-model="scope.row.check" />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="img" width="120px" label="门店图片">
          <template v-slot="scope">
            <div class="imgbox">
              <el-image :src="scope.row.img">
                <template v-slot:placeholder>
                  <div class="image-slot">
                    <i class="el-icon-loading" />
                  </div>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" width="200px" label="店铺名称" />
        <el-table-column prop="shop_id" label="店铺ID" />
        <el-table-column prop="city" label="城市" />
      </el-table>
      <el-pagination
        :current-page="shoppageNo1"
        :page-size="shoppageSize1"
        layout="total, prev, pager, next"
        background
        :total="shoptotal1"
        @current-change="shopCurrentChange1"
      />
    </div>
    <div class="butbox">
      <el-button :loading="loading" class="addmdbut" @click="submi"
        >确定{{ activeName == 0 ? '关联' : '解除关联' }}</el-button
      >
    </div>
  </div>
</template>

<script>
import { getshoplist, getshoptaglist, unbindshoptag, bindshoptag } from '@/api/table.js'
export default {
  props: {
    guanlianobj: {
      typeof: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      activeName: '0',
      shopgrouload: false,
      shopgrouobj: [],
      shoppageSize: 20,
      shoppageNo: 1,
      shoptotal: 0,
      grouobj: {},
      shopgrouobj1: [],
      shoppageSize1: 20,
      shoppageNo1: 1,
      shoptotal1: 0,
      loading: false
    }
  },
  watch: {
    guanlianobj: {
      handler(val) {
        if (val && val != {}) {
          this.grouobj = val
          this.getlist()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async getlist() {
      if (this.activeName == '0') {
        let data = {
          hasbindtag: false,
          pageindex: this.shoppageNo,
          pagesize: this.shoppageSize
        }
        this.shopgrouload = true
        this.shopgrouload = false
        let res = await getshoplist(data)
        if (res.code == 200) {
          this.shopgrouobj = res.data.rows.map(item => {
            if (item.img && item.img.indexOf('http') <= -1) {
              item.img = 'http:' + item.img
            }
            item.check = false
            return item
          })
          this.shoptotal = res.data.total
        } else {
          this.$message.warning(res.message)
        }
      } else {
        let data = {
          tagid: this.grouobj.id,
          pageindex: this.shoppageNo1,
          pagesize: this.shoppageSize1
        }
        console.log(data, this.grouobj)

        // return
        this.shopgrouload = true
        let res = await getshoptaglist(data)
        this.shopgrouload = false
        if (res.code == 200) {
          this.shopgrouobj1 = res.data.rows.map(item => {
            if (item.img && item.img.indexOf('http') <= -1) {
              item.img = 'http:' + item.img
            }
            item.check = false
            return item
          })
          this.shoptotal1 = res.data.total
        } else {
          this.$message.warning(res.message)
        }
      }
    },
    handleClick() {
      this.getlist()
    },
    shopCurrentChange(val) {
      this.shoppageNo = val
      this.getlist()
    },
    shopCurrentChange1(val) {
      this.shoppageNo1 = val
      this.getlist()
    },
    async submi() {
      console.log(this.activeName, 'this.activeName')

      if (this.activeName == '0') {
        // console.log(this.shopgrouobj);
        let arr = this.shopgrouobj.filter(item => item.check)
        if (!arr.length) {
          return this.$message.warning('请选中后进行操作')
        }
        this.loading = true
        // let text=arr.map(item=>{
        //     return `shop=${item.id}`
        // })
        // text=`tagid=${this.grouobj.id}&${text}`
        // console.log(text);
        let poall = arr.map(async item => {
          let res = await bindshoptag(`tagid=${this.grouobj.id}&shop=${item.id}`)
          if (res.code == 200) {
            return { success: true, name: item.name }
          } else {
            return { success: false, name: item.name }
          }
        })
        console.log(poall, 'poall')

        Promise.all(poall).then(res => {
          console.log(res, 'res')

          this.loading = false
          let brr = res.filter(item => !item.success)
          if (brr.length) {
            let text = brr.map(item => item.name).join(',')
            this.$message.warning(text + '关联失败')
          } else {
            this.$message.success('关联成功')
          }
          this.$emit('setguanlianshow')
        })
        this.loading = false
      } else {
        // console.log(this.shopgrouobj1);
        let arr = this.shopgrouobj1.filter(item => item.check)
        if (!arr.length) {
          return this.$message.warning('请选中后进行操作')
        }
        this.loading = true
        let poall = arr.map(async item => {
          let res = await unbindshoptag(`tagid=${this.grouobj.id}&shop=${item.id}`)
          if (res.code == 200) {
            return { success: true, name: item.name }
          } else {
            return { success: false, name: item.name }
          }
        })
        console.log(poall, 'poall')
        Promise.all(poall).then(res => {
          this.loading = false
          console.log(res, 'res')
          let brr = res.filter(item => !item.success)
          if (brr.length) {
            let text = brr.map(item => item.name).join(',')
            this.$message.warning(text + '解除关联失败')
          } else {
            this.$message.success('解除关联成功')
          }
          this.$emit('setguanlianshow')
        })
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.glshop {
  width: 100%;

  .contenbox {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 10px;
    box-sizing: border-box;

    .el-pagination {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 10px;
    }

    .btn-prev,
    .btn-next,
    .number {
      background: #ffffff;
      border: 1px solid #d0d5e3;
    }

    .el-table__row {
      color: #666666 !important;
    }

    .active {
      background-color: #fe0000 !important;
      border: none;
    }
  }

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
