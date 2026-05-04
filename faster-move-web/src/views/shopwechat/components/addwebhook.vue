<template>
  <div class="hwechat">
    <div class="top">
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        placeholder="输入名称或Host搜索"
        style="margin-right: 20px"
        @change="handleSearch"
      />
    </div>
    <div class="center">
      <el-table :data="filteredRobots" style="width: 100%" height="100%">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="host" label="推送地址" min-width="200" />
        <el-table-column prop="chat_type" label="类型" width="140">
          <template #default="{ row }">
            <span>{{ getChatTypeName(row.chat_type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <span v-if="isBound(row)" class="bound-text">已绑定</span>
            <span v-else class="unbound-text">未绑定</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <div class="butlist">
              <span v-if="!isBound(row)" class="link" @click="onBind(row)"> 绑定 </span>
              <span v-else class="link danger" @click="onUnbind(row)"> 解绑 </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="bottom">
      <el-button @click="onClose">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { t_chat_push_list } from '/@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { ChatType } from '/@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'

interface Props {
  robots: t_chat_push_list[]
  /** 已绑定的 WebHook 机器人 id 列表（对应 t_chat_push_list.id） */
  boundWebhookIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'binding-webhook', robot: t_chat_push_list): void
  (e: 'unbinding-webhook', robot: t_chat_push_list): void
}>()

const keyword = ref('')

const filteredRobots = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) {
    return props.robots
  }
  return props.robots.filter(item => {
    return item.name.toLowerCase().includes(text) || (item.host && item.host.toLowerCase().includes(text))
  })
})

const getChatTypeName = (type: ChatType): string => {
  const map: Record<number, string> = {
    [ChatType.None]: '未知',
    [ChatType.WechatPc]: '微信PC',
    [ChatType.WechatIpad]: '微信iPad',
    [ChatType.WechatWeb]: '微信Web',
    [ChatType.WechatWebHook]: '微信WebHook',
    [ChatType.DingdingWebHook]: '钉钉WebHook',
    [ChatType.FeishuWebHook]: '飞书WebHook'
  }
  return map[type] || '未知'
}

const isBound = (robot: t_chat_push_list): boolean => {
  return props.boundWebhookIds.includes(robot.id)
}

const onBind = (robot: t_chat_push_list) => {
  emit('binding-webhook', robot)
}

const onUnbind = (robot: t_chat_push_list) => {
  emit('unbinding-webhook', robot)
}

const onClose = () => {
  emit('close')
}

const handleSearch = () => {
  keyword.value = keyword.value.trim()
}
</script>

<style scoped lang="scss">
::v-deep.hwechat {
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .top {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .center {
    flex: 1;
    overflow: hidden;
    min-height: 260px;
    display: flex;
    flex-direction: column;

    .el-table {
      flex: 1;
      overflow: auto;
    }
  }

  .bottom {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);
  }

  .butlist {
    .link {
      color: var(--el-color-primary);
      cursor: pointer;

      &.danger {
        color: var(--el-color-danger);
      }
    }
  }

  .bound-text {
    color: var(--el-color-success);
  }

  .unbound-text {
    color: var(--el-color-info);
  }
}
</style>
