<template>
  <view class="card">
    <view class="hd">
      <view class="hd-left">
        <text class="hd-ico">📅</text>
        <text class="hd-t">待办事项</text>
      </view>
      <view class="hd-actions">
        <text class="add" @click="openAdd">+ 添加待办事项</text>
      </view>
    </view>
    <view class="nums">
      <text class="link" @click="filterState(0)">本日待办：{{ dayTodo }}</text>
      <view class="row2">
        <text class="link" @click="filterState(2)">● 已完成：{{ done }}</text>
        <text class="link red" @click="filterState(1)">● 未完成：{{ undone }}</text>
      </view>
    </view>
    <scroll-view scroll-y class="todo-scroll">
      <view v-for="item in list" :key="(item as any).id" class="todo-row">
        <view
          class="dot"
          :style="{
            background:
              (item as any).top === 1
                ? '#e95648'
                : (item as any).top === 2
                  ? '#ff9d28'
                  : (item as any).top === 3
                    ? '#0488de'
                    : '#ebedef',
          }"
        />
        <text class="txt">{{ (item as any).name }}--{{ (item as any).content }}</text>
        <text class="more" @click.stop="openItemMenu(item)">···</text>
      </view>
    </scroll-view>

    <view v-if="dialog" class="mask" @click.self="closeDialog">
      <view class="dlg">
        <text class="dlg-t">{{ form.id ? "编辑待办" : "新增待办" }}</text>
        <view class="field">
          <text class="lab">标题</text>
          <input v-model="form.name" class="inp" placeholder="请输入标题" />
        </view>
        <view class="field">
          <text class="lab">内容</text>
          <textarea v-model="form.content" class="area" placeholder="请输入内容" />
        </view>
        <view class="field">
          <text class="lab">优先级</text>
          <picker :range="prioLabels" :value="prioIndex" @change="onPrio">
            <view class="picker">{{ prioLabels[prioIndex] }}</view>
          </picker>
        </view>
        <view class="dlg-btns">
          <button class="b1" @click="closeDialog">取消</button>
          <button class="b2" :loading="saving" @click="submit">{{ form.id ? "修改" : "提交" }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { addCalendar, delCalendar, editCalendar, getListOrderByCtime } from "@/api/business";

const props = defineProps<{
  todoData: { done: number; undone: number };
}>();

const emit = defineEmits<{ (e: "changed"): void }>();

const dayTodo = ref(0);
const done = ref(0);
const undone = ref(0);
const list = ref<any[]>([]);
const queryParams = reactive({
  pageindex: 1,
  pagesize: 10,
  type: 3,
  state: 0,
});

const dialog = ref(false);
const saving = ref(false);
const form = reactive<any>({ name: "", top: 3, content: "", id: undefined, type: 3, state: 1, avtag: true });
const prioLabels = ["紧急", "高", "中", "低"];
const prioValues = [1, 2, 3, 4];
const prioIndex = ref(2);

watch(
  () => props.todoData,
  () => {
    done.value = Number(props.todoData?.done || 0);
    undone.value = Number(props.todoData?.undone || 0);
  },
  { immediate: true, deep: true }
);

function onPrio(e: { detail: { value: string } }) {
  const i = Number(e.detail.value);
  prioIndex.value = i;
  form.top = prioValues[i];
}

function filterState(state: number) {
  queryParams.pageindex = 1;
  queryParams.state = state;
  void getTodoList();
}

function getTodoList() {
  return getListOrderByCtime(queryParams as unknown as Record<string, unknown>).then((res: any) => {
    if (res.code === 200 && res.data) {
      list.value = res.data.rows || [];
      const total = res.data.total ?? 0;
      switch (queryParams.state) {
        case 0:
          dayTodo.value = total;
          break;
        case 1:
          undone.value = total;
          break;
        case 2:
          done.value = total;
          break;
        default:
          break;
      }
    }
  });
}

function openAdd() {
  form.id = undefined;
  form.name = "";
  form.content = "";
  form.top = 3;
  form.type = 3;
  form.state = 1;
  form.avtag = true;
  prioIndex.value = 2;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
}

function openItemMenu(item: any) {
  const actions = ["编辑事项", "删除事项"];
  if (item.state !== 2) actions.push("标记已完成");
  uni.showActionSheet({
    itemList: actions,
    success: async (r) => {
      const t = actions[r.tapIndex];
      if (t === "编辑事项") {
        Object.assign(form, item);
        prioIndex.value = Math.max(0, prioValues.indexOf(Number(form.top) || 3));
        dialog.value = true;
      } else if (t === "删除事项") {
        uni.showModal({
          title: "确认删除？",
          success: async (m) => {
            if (!m.confirm) return;
            try {
              const res: any = await delCalendar(item.id);
              if (res.code === 200) {
                uni.showToast({ title: "已删除", icon: "none" });
                await getTodoList();
                emit("changed");
              }
            } catch {
              /* toast in request */
            }
          },
        });
      } else if (t === "标记已完成") {
        uni.showModal({
          title: "确认已完成？",
          success: async (m) => {
            if (!m.confirm) return;
            saving.value = true;
            try {
              const { name, top, content, id, type, avtag } = item;
              const res: any = await editCalendar({ name, top, content, id, type, state: 2, avtag });
              if (res.code === 200) {
                uni.showToast({ title: "已更新", icon: "none" });
                queryParams.state = 2;
                await getTodoList();
                emit("changed");
              }
            } finally {
              saving.value = false;
            }
          },
        });
      }
    },
  });
}

async function submit() {
  if (!form.name?.trim()) {
    uni.showToast({ title: "请输入标题", icon: "none" });
    return;
  }
  if (!form.content?.trim()) {
    uni.showToast({ title: "请输入内容", icon: "none" });
    return;
  }
  saving.value = true;
  try {
    if (form.id) {
      const { name, top, content, id, type, state, avtag } = form;
      const res: any = await editCalendar({ name, top, content, id, type, state, avtag });
      if (res.code === 200) {
        uni.showToast({ title: "修改成功", icon: "none" });
        closeDialog();
        await getTodoList();
        emit("changed");
      }
    } else {
      const { name, top, content } = form;
      const res: any = await addCalendar({ name, top, content, type: 3, state: 1, avtag: true });
      if (res.code === 200) {
        uni.showToast({ title: "提交成功", icon: "none" });
        closeDialog();
        await getTodoList();
        emit("changed");
      }
    }
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void getTodoList();
});
</script>

<style scoped>
.hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.hd-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}
.hd-ico {
  font-size: 32rpx;
  color: #409eff;
  flex-shrink: 0;
}
.hd-t {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
}
.add {
  font-size: 26rpx;
  color: #2cca87;
}
.nums {
  background: #f8f8fc;
  padding: 16rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}
.link {
  font-size: 26rpx;
  color: #666;
}
.link.red {
  color: #fe0000;
}
.row2 {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 10rpx;
}
.todo-scroll {
  max-height: 360rpx;
}
.todo-row {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  flex-shrink: 0;
}
.txt {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  min-width: 0;
}
.more {
  padding: 8rpx 16rpx;
  font-size: 32rpx;
  color: #999;
}
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}
.dlg {
  width: 100%;
  max-width: 640rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-sizing: border-box;
}
.dlg-t {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}
.field {
  margin-bottom: 20rpx;
}
.lab {
  font-size: 24rpx;
  color: #888;
  display: block;
  margin-bottom: 8rpx;
}
.inp,
.area,
.picker {
  width: 100%;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.area {
  min-height: 160rpx;
}
.dlg-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 12rpx;
}
.b1,
.b2 {
  flex: 1;
  border-radius: 12rpx;
}
.b2 {
  background: #2d6cdf;
  color: #fff;
}
</style>
