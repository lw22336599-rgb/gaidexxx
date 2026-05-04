// composables/useShopActions.ts
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { gp } from '/@vab/plugins/vab.ts'
import type { ShopData } from '../types'
import { createBindCode, setShopIsTop, unBindShop } from '@/api/shop'

export const useShopActions = (emit: any) => {
  const selectedShop = ref<ShopData | null>(null)
  const showPayDialog = ref(false)
  const showEditDialog = ref(false)
  const showBindDialog = ref(false)
  const bindShopData = ref<Partial<ShopData>>({})

  const handleBindCode = async (row: ShopData) => {
    try {
      if (!row.codeStr) {
        const res = await createBindCode(row.id)
        if (res.code === 200) {
          row.codeStr = `${res.data}(5分钟内有效)`
          return true
        }
      }
      return navigator.clipboard.writeText(row.codeStr || '')
    } catch (error) {
      gp.$baseMessage('绑定码操作失败', 'error')
      return false
    }
  }

  const copyShopInfo = async (row: ShopData) => {
    const success = await handleBindCode(row)
    if (success) {
      const info = [
        `平台：${ShopTypeMap[row.shop_type]}`,
        `店铺名称：${row.name}`,
        `门店ID：${row.office_id}`
        // 其他信息...
      ].join('\n')
      navigator.clipboard.writeText(info)
      gp.$baseMessage('信息复制成功', 'success')
    }
  }

  const toggleShopTop = async (row: ShopData, state: boolean) => {
    try {
      await ElMessageBox.confirm(state ? '确认置顶此店铺吗？' : '确认取消置顶吗？', '提示')
      const res = await setShopIsTop({ shop: row.id, top: state })
      if (res.code === 200) {
        gp.$baseMessage(state ? '置顶成功' : '取消置顶成功', 'success')
        emit('refresh')
      }
    } catch (error) {
      // 取消操作不处理
    }
  }

  const handleColumnAction = (action: string, row: ShopData) => {
    selectedShop.value = row
    switch (action) {
      case 'edit':
        showEditDialog.value = true
        break
      case 'remove':
        unBindShop({ shopIds: [row.id] }).then(() => {
          gp.$baseMessage('已移至回收站', 'success')
          emit('refresh')
        })
        break
      case 'bind':
        showBindDialog.value = true
        bindShopData.value = row
        break
      // 其他操作...
    }
  }

  return {
    selectedShop,
    showPayDialog,
    showEditDialog,
    showBindDialog,
    bindShopData,
    handleBindCode,
    copyShopInfo,
    toggleShopTop,
    handleColumnAction
  }
}
