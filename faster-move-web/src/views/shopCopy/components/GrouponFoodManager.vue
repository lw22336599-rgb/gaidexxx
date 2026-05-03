<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { CombineGroupType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupType'
import type { TG_CustomGroupFood } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/TG_CustomGroupFood'
import type { TG_CustomGroupFoodItem } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/TG_CustomGroupFoodItem'
import { UintType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/UintType'
import type { FoodItem } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem'
import type { FoodGroupItem } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import { FoodType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodType'
import { FoodStatusType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodStatusType'
import { FoodGroupType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupType'
import { SpecificationType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/SpecificationType'
import { FoodSellStatusType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSellStatusType'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { gp } from '/@vab/plugins/vab.ts'
import sussIcon from '/@/assets/shop_images/suss.png'
import errorIcon from '/@/assets/shop_images/error.png'

// 用餐人数预设
const DINER_PRESETS = [
  { label: '单人餐', value: 1 },
  { label: '双人餐', value: 2 },
  { label: '2-3人餐', value: 2.5 },
  { label: '3人餐', value: 3 },
  { label: '3-4人餐', value: 3.5 },
  { label: '4人餐', value: 4 },
  { label: '6人餐', value: 6 },
  { label: '自定义', value: -1 },
]

interface SourceFoodImage {
  foodName: string
  imgUrl: string
}

// 图片选择弹窗状态
const imgPickerVisible = ref(false)
const imgPickerTargetFood = ref<GrouponFoodDraft | null>(null)
const imgPickerGroupId = ref('')
const imgPickerLoading = ref(false)
// 弹窗内商品列表（每项含多张图）
interface ImgPickerFoodItem {
  id: string
  Name: string
  images: { imgUrl: string; selected: boolean }[]
}
const imgPickerFoods = ref<ImgPickerFoodItem[]>([])
const imgPickerTreeRef = ref()

const openImgPicker = (food: GrouponFoodDraft) => {
  imgPickerTargetFood.value = food
  imgPickerGroupId.value = ''
  imgPickerFoods.value = []
  imgPickerVisible.value = true
  nextTick(() => {
    const firstNode = treeData.value[0]
    if (firstNode) {
      imgPickerGroupId.value = firstNode.id
      imgPickerTreeRef.value?.setCurrentKey(firstNode.id)
      loadImgPickerFoods(firstNode.id)
    }
  })
}

const loadImgPickerFoods = async (groupId: string) => {
  if (!props.taskId || !groupId) return
  imgPickerLoading.value = true
  imgPickerFoods.value = []
  try {
    let page = 1
    const pageSize = 100
    const allItems: ImgPickerFoodItem[] = []
    while (true) {
      const result = await apiManager.foodmoveApi.GetGroupFoods(props.taskId, groupId, page, pageSize)
      const rows = result.rows || []
      for (const row of rows) {
        const imgs = (row.ImageUrls || [])
          .filter((img: any) => img?.Img)
          .map((img: any) => ({ imgUrl: img.Img, selected: false }))
        if (imgs.length > 0) {
          allItems.push({ id: row.id, Name: row.Name, images: imgs })
        }
      }
      if (rows.length < pageSize) break
      page++
    }
    imgPickerFoods.value = allItems
  } finally {
    imgPickerLoading.value = false
  }
}

const handleImgPickerTreeClick = (node: any) => {
  if (node.id === imgPickerGroupId.value) return
  imgPickerGroupId.value = node.id
  loadImgPickerFoods(node.id)
}

const toggleImgSelect = (img: { imgUrl: string; selected: boolean }) => {
  img.selected = !img.selected
}

const confirmImgPicker = () => {
  if (!imgPickerTargetFood.value) return
  const food = imgPickerTargetFood.value
  for (const item of imgPickerFoods.value) {
    for (const img of item.images) {
      if (img.selected) {
        const already = food._sourceImages.some((s) => s.imgUrl === img.imgUrl)
        if (!already) {
          food._sourceImages.push({ foodName: item.Name, imgUrl: img.imgUrl })
        }
      }
    }
  }
  imgPickerVisible.value = false
}

// 团购商品草稿 = FoodItem（系统标准结构）+ 界面辅助字段
interface GrouponFoodDraft extends FoodItem {
  // 界面辅助字段
  _price: number                // 套餐售价（统一定价）
  _collapsed: boolean           // 是否折叠
  _dinerCount: number           // 用餐人数预设值，-1 表示自定义
  _dinerCountCustom: string     // 自定义用餐人数文字
  _sourceImages: SourceFoodImage[]  // 来源商品图片（横排展示）
  _foodId: string               // 已成功提交后服务端返回的 food_id，有值说明已存在，下次走更新接口
  CopyTask?: { try_count: number; succeed: boolean } // 复制任务状态（与普通商品保持一致）
  err_msg2?: string             // 数据状态警告信息（来自 foodGroupDataStates）
}

interface FoodOption {
  id: string
  Name: string
  Specifications?: any[]
  SkuList?: any[]
  ImageUrls?: any[]
}

const props = defineProps<{
  taskId: string
  foodGroups: any[]
  // 父组件过滤前记录的后端真实"团购商品"分组，有值说明后端已存在该分组
  realGrouponGroup?: any
  // 是否是真正的团购商品分组（虚拟分组/tuangou_def），非团购分组不显示新增/保存按钮
  isGrouponGroup?: boolean
  // 商品数据状态列表，用于显示 err_msg2 警告信息（与 MovePeerShop 保持一致）
  foodGroupDataStates?: any[]
}>()

const emit = defineEmits<{
  (e: 'save', foods: GrouponFoodDraft[]): void
  (e: 'groupon-single-copy', foodId: string): void
}>()

// 团购商品草稿列表
const grouponFoods = ref<GrouponFoodDraft[]>([])

// 快速添加面板
const addPanelVisible = ref(false)
// null = 新建团购商品，非null = 向该商品追加菜品分组
const addPanelTargetFood = ref<GrouponFoodDraft | null>(null)
// 当前在左树选中的分组 id
const selectedGroupId = ref('')
// 多选选中的商品 id 集合
const selectedFoodIds = ref<string[]>([])
const loadingFoods = ref(false)
const foodOptions = ref<FoodOption[]>([])
const foodPage = ref(1)
const foodTotal = ref(0)
const foodPageSize = 50

// 从 UintType 枚举自动生成完整选项列表，避免手写遗漏
const uintTypeOptions = Object.entries(UintType)
  .filter(([, v]) => typeof v === 'number')
  .map(([k, v]) => ({ label: k.replace(/^_/, ''), value: v as number }))

// 递归过滤掉虚拟分组，生成左树数据
const buildTreeData = (groups: any[]): any[] => {
  return groups
    .filter(
      (g) => g.Group?.id !== 'error_food_id' && g.Group?.id !== 'groupon_food_id'
    )
    .map((g) => ({
      id: g.id,
      label: `${g.Group?.Name || ''}（${g.Group?.FoodCount ?? g.spu_count ?? 0}）`,
      children: g.Children && g.Children.length > 0 ? buildTreeData(g.Children) : undefined,
    }))
}

const treeData = computed(() => buildTreeData(props.foodGroups))

// 生成唯一 ID
const genId = () => `groupon_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// 获取分组下的商品列表
const loadFoodsForGroup = async (groupId: string, page = 1) => {
  if (!props.taskId || !groupId) return
  loadingFoods.value = true
  try {
    const result = await apiManager.foodmoveApi.GetGroupFoods(
      props.taskId,
      groupId,
      page,
      foodPageSize
    )
    foodOptions.value = result.rows || []
    foodTotal.value = result.total || 0
    foodPage.value = page
  } catch (e: any) {
    gp.$baseMessage(e?.message || '获取商品列表失败', 'error', 'hey')
  } finally {
    loadingFoods.value = false
  }
}

// 左树节点点击
const handleTreeNodeClick = (node: any) => {
  if (node.id === selectedGroupId.value) return
  selectedGroupId.value = node.id
  selectedFoodIds.value = []
  foodOptions.value = []
  loadFoodsForGroup(node.id, 1)
}

// 分页
const handleFoodPageChange = (page: number) => {
  loadFoodsForGroup(selectedGroupId.value, page)
}

// 取商品最低单价数值（用于价格计算）
const getFoodMinPriceNum = (food: FoodOption): number => {
  if (food.SkuList && food.SkuList.length > 0) {
    const prices = food.SkuList.map((s: any) => s.Price || 0).filter((p: number) => p > 0)
    if (prices.length > 0) return Math.min(...prices)
  }
  if (food.Specifications && food.Specifications.length > 0) {
    const prices: number[] = []
    food.Specifications.forEach((spec: any) => {
      ; (spec.Options || []).forEach((opt: any) => {
        if (opt.Price > 0) prices.push(opt.Price)
      })
    })
    if (prices.length > 0) return Math.min(...prices)
  }
  return 0
}

// 计算商品最低价（从 SkuList 或 Specifications 取）
const getFoodMinPrice = (food: FoodOption): string => {
  if (food.SkuList && food.SkuList.length > 0) {
    const prices = food.SkuList.map((s: any) => s.Price || 0).filter((p: number) => p > 0)
    if (prices.length > 0) {
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return min === max ? `¥${min.toFixed(2)}` : `¥${min.toFixed(2)}~${max.toFixed(2)}`
    }
  }
  if (food.Specifications && food.Specifications.length > 0) {
    const prices: number[] = []
    food.Specifications.forEach((spec: any) => {
      ; (spec.Options || []).forEach((opt: any) => {
        if (opt.Price > 0) prices.push(opt.Price)
      })
    })
    if (prices.length > 0) {
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return min === max ? `¥${min.toFixed(2)}` : `¥${min.toFixed(2)}~${max.toFixed(2)}`
    }
  }
  return '-'
}

// 计算 SKU 数量
const getFoodSkuCount = (food: FoodOption): number => {
  if (food.SkuList && food.SkuList.length > 0) return food.SkuList.length
  if (food.Specifications && food.Specifications.length > 0) {
    let count = 0
    food.Specifications.forEach((spec: any) => {
      count += (spec.Options || []).length
    })
    return count
  }
  return 1
}

// 表格列
const tableColumns = [
  { prop: 'thumb', label: '图片', width: 60 },
  { prop: 'Name', label: '商品名称', minWidth: 180 },
  { prop: 'price', label: '价格', width: 140 },
  { prop: 'skuCount', label: 'SKU数', width: 80 },
]

// 从一个 FoodOption 提取它的 TG_CustomGroupFoods（每个规格组 → 一个菜品分组）
const buildGroupsFromFood = (food: FoodOption): TG_CustomGroupFood[] => {
  const groups: TG_CustomGroupFood[] = []

  if (food.Specifications && food.Specifications.length > 0) {
    for (const spec of food.Specifications) {
      const items: TG_CustomGroupFoodItem[] = (spec.Options || []).map((opt: any) => ({
        FoodName: opt.Name || food.Name || '',
        Price: opt.Price || 0,
        Count: 1,
        UintType: UintType.克,
        UintTypeStr: '',
        Spec: null,
      }))
      if (items.length > 0) {
        groups.push({
          GroupName: spec.Name || food.Name || '菜品',
          GroupType: CombineGroupType.固定商品,
          FoodItems: items,
          GroupRule: { CanBeReSelected: false, MaxOptionalQuantity: 1, MinOptionalQuantity: 1 },
        })
      }
    }
  }

  if (groups.length === 0) {
    groups.push({
      GroupName: food.Name || '菜品',
      GroupType: CombineGroupType.固定商品,
      FoodItems: [
        { FoodName: food.Name || '', Price: 0, Count: 1, UintType: UintType.克, UintTypeStr: '', Spec: null },
      ],
      GroupRule: { CanBeReSelected: false, MaxOptionalQuantity: 1, MinOptionalQuantity: 1 },
    })
  }
  return groups
}

const DEFAULT_SPEC_NAME = '规格名称'

// 构建一个空的团购商品（FoodItem 结构 + 辅助字段）
const makeEmptyDraft = (name = '新团购套餐', price = 0): GrouponFoodDraft => {
  const specId = genId()
  const optId = genId()
  const skuId = genId()

  return {
    // FoodItem 必填字段
    id: genId(),
    SpuId: '',
    Name: name,
    Description: '',
    Status: FoodStatusType.已上架,
    Index: 0,
    MasterSpec: DEFAULT_SPEC_NAME,
    SpecPrice: false,
    FoodType: FoodType.套餐商品,
    GroupMulti: [],
    UsePeopleNum: { Start: 1, End: 1 },
    // 默认规格：一个规格组"份量"，一个选项"默认"
    Specifications: [
      {
        id: specId,
        SpecType: SpecificationType.普通规格组,
        Name: DEFAULT_SPEC_NAME,
        Index: 1,
        Options: [
          {
            id: optId,
            SpecName: DEFAULT_SPEC_NAME,
            Name: '默认',
            Price: price,
            Status: FoodSellStatusType.可售,
            Weight: 0,
            SkuId: skuId,
            Index: 0,
          },
        ],
      },
    ],
    // 唯一 SKU，价格与 _price 联动（提交前同步）
    SkuList: [
      {
        id: skuId,
        Price: price,
        Sequence: 0,
        BoxPrice: 0,
        Stock: -1,
        MaxStock: -1,
        AutoRefresh: false,
        Status: FoodSellStatusType.可售,
        BoxNum: 1,
        SkuPath: '默认',
        SkuId: skuId,
        Weight: 0,
        WeightType: UintType.None,
        ForSpec: [
          {
            SpecId: specId,
            SpecName: DEFAULT_SPEC_NAME,
            OptId: optId,
            OptionName: '默认',
            SkuId: skuId,
            Weight: 0,
            WeightType: UintType.None,
            Level: 1,
          },
        ],
      },
    ],
    // 团购菜品分组
    TG_CustomGroupFoods: [
      {
        GroupName: '菜品',
        GroupType: CombineGroupType.固定商品,
        FoodItems: [
          { FoodName: '', Price: 0, Count: 1, UintType: UintType.克, UintTypeStr: '', Spec: null },
        ],
        GroupRule: { CanBeReSelected: false, MaxOptionalQuantity: 1, MinOptionalQuantity: 1 },
      },
    ],
    // 辅助字段
    _price: price,
    _collapsed: false,
    _dinerCount: 1,
    _dinerCountCustom: '',
    _sourceImages: [],
    _foodId: '',
  }
}

// 确认添加：
//   addPanelTargetFood 为 null → 新建团购商品
//   addPanelTargetFood 有值   → 向该商品追加菜品分组
const confirmAddFood = () => {
  if (selectedFoodIds.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }
  const selected = foodOptions.value.filter((f) => selectedFoodIds.value.includes(f.id))

  const allGroups: TG_CustomGroupFood[] = []
  selected.forEach((food) => allGroups.push(...buildGroupsFromFood(food)))

  const target = addPanelTargetFood.value
  if (target) {
    // 追加模式：把新菜品分组追加到已有商品，不修改价格和图片
    target.TG_CustomGroupFoods = [...(target.TG_CustomGroupFoods || []), ...allGroups]
    ElMessage.success(`已追加 ${allGroups.length} 个菜品分组`)
  } else {
    // 新建模式：创建一个全新的团购套餐
    const sourceImages: SourceFoodImage[] = selected
      .filter((f) => f.ImageUrls && f.ImageUrls[0]?.Img)
      .map((f) => ({ foodName: f.Name, imgUrl: f.ImageUrls![0].Img }))

    // 默认售价 = 所有选中商品最低价之和 × 9.9折，保留两位小数
    const totalPrice = selected.reduce((sum, f) => sum + getFoodMinPriceNum(f), 0)
    const defaultPrice = Math.round(totalPrice * 0.99 * 100) / 100

    const draft = makeEmptyDraft(selected.map((f) => f.Name).join('+'), defaultPrice)
    draft.TG_CustomGroupFoods = allGroups
    draft._sourceImages = sourceImages
    draft._dinerCount = 1

    grouponFoods.value.push(draft)
  }

  addPanelVisible.value = false
  addPanelTargetFood.value = null
  selectedGroupId.value = ''
  selectedFoodIds.value = []
  foodOptions.value = []
}

const treeRef = ref()

// 打开弹窗时重置状态，并默认选中第一个分组
// targetFood: null = 新建团购商品；传入已有商品 = 向其追加菜品分组
const openAddPanel = (targetFood: GrouponFoodDraft | null = null) => {
  addPanelTargetFood.value = targetFood
  selectedGroupId.value = ''
  selectedFoodIds.value = []
  foodOptions.value = []
  foodPage.value = 1
  foodTotal.value = 0
  addPanelVisible.value = true

  nextTick(() => {
    const firstNode = treeData.value[0]
    if (firstNode) {
      selectedGroupId.value = firstNode.id
      treeRef.value?.setCurrentKey(firstNode.id)
      loadFoodsForGroup(firstNode.id, 1)
    }
  })
}

// 切换折叠
const toggleCollapse = (food: GrouponFoodDraft) => {
  food._collapsed = !food._collapsed
}

// 删除团购商品
const removeGrouponFood = async (index: number) => {
  await ElMessageBox.confirm('确认删除该团购商品？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
  const food = grouponFoods.value[index]
  // 已提交过的商品需要调接口从任务中删除
  if (food._foodId) {
    try {
      await apiManager.foodmoveApi.RemoveFoodFromTask(props.taskId, food._foodId)
    } catch (e: any) {
      ElMessage.error(`删除失败：${e?.message ?? '未知错误'}`)
      return
    }
  }
  grouponFoods.value.splice(index, 1)
}

// 添加菜品分组
const addGroup = (food: GrouponFoodDraft) => {
  if (!food.TG_CustomGroupFoods) food.TG_CustomGroupFoods = []
  food.TG_CustomGroupFoods.push({
    GroupName: '新菜品分组',
    GroupType: CombineGroupType.固定商品,
    FoodItems: [
      { FoodName: '', Price: 0, Count: 1, UintType: UintType.克, UintTypeStr: '', Spec: null },
    ],
    GroupRule: { CanBeReSelected: false, MaxOptionalQuantity: 1, MinOptionalQuantity: 1 },
  })
}

// 删除菜品分组
const removeGroup = (food: GrouponFoodDraft, gIdx: number) => {
  if (!food.TG_CustomGroupFoods || food.TG_CustomGroupFoods.length <= 1) {
    ElMessage.warning('至少保留一个菜品分组')
    return
  }
  food.TG_CustomGroupFoods.splice(gIdx, 1)
}

// 添加菜品行
const addFoodItem = (group: TG_CustomGroupFood) => {
  group.FoodItems.push({
    FoodName: '',
    Price: 0,
    Count: 1,
    UintType: UintType.克,
    UintTypeStr: '',
    Spec: null,
  })
}

// 删除菜品行
const removeFoodItem = (group: TG_CustomGroupFood, iIdx: number) => {
  if (group.FoodItems.length <= 1) {
    ElMessage.warning('至少保留一个菜品')
    return
  }
  group.FoodItems.splice(iIdx, 1)
}

// 上移菜品行
const moveItemUp = (group: TG_CustomGroupFood, iIdx: number) => {
  if (iIdx === 0) return
  const arr = group.FoodItems
    ;[arr[iIdx - 1], arr[iIdx]] = [arr[iIdx], arr[iIdx - 1]]
}

// 下移菜品行
const moveItemDown = (group: TG_CustomGroupFood, iIdx: number) => {
  const arr = group.FoodItems
  if (iIdx === arr.length - 1) return
    ;[arr[iIdx], arr[iIdx + 1]] = [arr[iIdx + 1], arr[iIdx]]
}

// 上移分组
const moveGroupUp = (food: GrouponFoodDraft, gIdx: number) => {
  if (!food.TG_CustomGroupFoods || gIdx === 0) return
  const arr = food.TG_CustomGroupFoods
    ;[arr[gIdx - 1], arr[gIdx]] = [arr[gIdx], arr[gIdx - 1]]
}

// 下移分组
const moveGroupDown = (food: GrouponFoodDraft, gIdx: number) => {
  if (!food.TG_CustomGroupFoods) return
  const arr = food.TG_CustomGroupFoods
  if (gIdx === arr.length - 1) return
    ;[arr[gIdx], arr[gIdx + 1]] = [arr[gIdx + 1], arr[gIdx]]
}

// 手动新建一个空的团购商品
const addEmptyGrouponFood = () => {
  grouponFoods.value.push(makeEmptyDraft())
}

const saving = ref(false)
const loadingSaved = ref(false)

// 从 props.realGrouponGroup（父组件过滤前记录的真实分组）或 foodGroups 中查找团购商品分组
const findGrouponGroup = (): FoodGroupItem | null => {
  // 优先使用父组件过滤前记录的真实分组
  if (props.realGrouponGroup?.Group) {
    const g: FoodGroupItem = props.realGrouponGroup.Group
    if (g.id && g.id !== 'groupon_food_id' && g.id !== 'error_food_id') {
      return g
    }
  }
  // 兜底：在 foodGroups 中查找（兼容未传 realGrouponGroup 的场景）
  for (const item of props.foodGroups) {
    const g: FoodGroupItem | undefined = item.Group
    if (g && g.id !== 'groupon_food_id' && g.id !== 'error_food_id'
      && (g.OfficeId === 'tuangou_def' || g.Name === '团购商品')) {
      return g
    }
  }
  return null
}

const getErrMsg = (arr: any[]): string => {
  let str = ''
  arr.forEach((s: any) => {
    switch (s) {
      case 0: str += '点击详情可获得属性，'; break
      case 1: str += '需点击选择规格补全多规格商品，'; break
      case 2: str += '套餐商品需点击选择套餐补全套餐信息，'; break
    }
  })
  return str.slice(0, -1)
}

// 加载已提交的团购商品（分组存在时拉取）
const mapRowToDraft = (item: any): GrouponFoodDraft => {
  const sourceImages: SourceFoodImage[] = (item.ImageUrls || [])
    .filter((img: any) => img?.Img)
    .map((img: any) => ({ imgUrl: img.Img, foodName: item.Name }))

  const savedPrice = (item.SkuList && item.SkuList.length > 0)
    ? (item.SkuList[0].Price ?? 0)
    : 0

  const peopleStart = item.UsePeopleNum?.Start ?? 1
  const peopleEnd = item.UsePeopleNum?.End ?? peopleStart
  const matchKey = peopleStart === peopleEnd ? peopleStart : (peopleStart + peopleEnd) / 2
  const matchedPreset = DINER_PRESETS.find(p => p.value === matchKey && p.value !== -1)
  const restoredDinerCount = matchedPreset ? matchedPreset.value : (peopleStart > 0 ? -1 : 1)
  const restoredDinerCountCustom = restoredDinerCount === -1 ? String(peopleStart) : ''

  const groups = ((item.TG_CustomGroupFoods) || []).map((g: any) => ({
    ...g,
    GroupRule: g.GroupRule ?? { CanBeReSelected: false, MaxOptionalQuantity: 1, MinOptionalQuantity: 1 },
  }))

  // 从 foodGroupDataStates 中匹配该商品的错误信息
  let err_msg2 = ''
  if (props.foodGroupDataStates) {
    for (const s of props.foodGroupDataStates) {
      if (item.SpuId && s.spu_id === item.SpuId) {
        err_msg2 = getErrMsg(s.states || [])
        break
      }
    }
  }

  return {
    ...item,
    Status: item.Status ?? FoodStatusType.已上架,
    TG_CustomGroupFoods: groups,
    _price: savedPrice,
    _collapsed: false,
    _dinerCount: restoredDinerCount,
    _dinerCountCustom: restoredDinerCountCustom,
    _sourceImages: sourceImages,
    _foodId: item.id,
    err_msg2: err_msg2 || undefined,
  }
}

const loadSavedGrouponFoods = async (preloadedRows?: any[]) => {
  if (!props.taskId) return
  const group = findGrouponGroup()
  if (!group) return

  loadingSaved.value = true
  try {
    const pageSize = 10
    const allFoods: GrouponFoodDraft[] = []

    // 若父组件已预先取到第一批数据，直接处理，不重复请求
    if (preloadedRows) {
      for (const item of preloadedRows) allFoods.push(mapRowToDraft(item))
      // 预加载数据已满一页，说明可能有更多，继续分页
      if (preloadedRows.length >= pageSize) {
        let page = 2
        while (true) {
          const result = await apiManager.foodmoveApi.GetGroupFoods(props.taskId, group.id, page, pageSize)
          const rows = result.rows || []
          for (const item of rows) allFoods.push(mapRowToDraft(item))
          if (rows.length < pageSize) break
          page++
        }
      }
    } else {
      // 正常分页加载
      let page = 1
      while (true) {
        const result = await apiManager.foodmoveApi.GetGroupFoods(props.taskId, group.id, page, pageSize)
        const rows = result.rows || []
        for (const item of rows) allFoods.push(mapRowToDraft(item))
        if (rows.length < pageSize) break
        page++
      }
    }

    grouponFoods.value = allFoods
  } catch {
    // 加载失败时保持空列表，不影响手动添加
  } finally {
    loadingSaved.value = false
  }
}

// 供父组件调用，每次切换到团购分组时强制重新加载
// 若传入 preloadedRows，则以该数据作为第一页直接处理，后续继续分页（避免重复请求）
const reload = (preloadedRows?: any[]) => {
  grouponFoods.value = []
  loadSavedGrouponFoods(preloadedRows)
}
defineExpose({ reload })

interface GrouponGroupInfo {
  id: string       // 系统内部 id
  OfficeId: string // 平台分组 id
}

// 确保"团购商品"分组存在，不存在则通过 API 创建，返回系统 id 和平台 OfficeId
const ensureGrouponGroup = async (): Promise<GrouponGroupInfo> => {
  const existing = findGrouponGroup()
  if (existing) return { id: existing.id, OfficeId: existing.OfficeId }

  const newGroup = await apiManager.foodmoveApi.AddGroupToTaskV2({
    task: props.taskId,
    id: '',
    OfficeId: 'tuangou_def',
    Index: 9999,
    Name: '团购商品',
    Description: '',
    FoodCount: 0,
    GroupType: FoodGroupType.普通分类,
    Level: 1,
  })
  return { id: newGroup.id, OfficeId: newGroup.OfficeId }
}

// 保存单个团购商品，返回是否成功
const saveSingleFood = async (food: GrouponFoodDraft, group: GrouponGroupInfo): Promise<boolean> => {
  const {
    _price, _collapsed, _dinerCount, _dinerCountCustom, _sourceImages, _foodId,
    ...foodBaseRaw
  } = food
  const foodBase = JSON.parse(JSON.stringify(foodBaseRaw))

  // 将 _dinerCount 同步到 UsePeopleNum（后端要求整数）
  if (_dinerCount === -1) {
    // 自定义：解析文字为整数
    const customNum = parseInt(_dinerCountCustom, 10)
    if (!isNaN(customNum) && customNum > 0) {
      foodBase.UsePeopleNum = { Start: customNum, End: customNum }
    }
  } else {
    // 预设值如 2.5（2-3人餐）取 floor/ceil 作为 Start/End 范围
    const start = Math.floor(_dinerCount)
    const end = Math.ceil(_dinerCount)
    foodBase.UsePeopleNum = { Start: start, End: end }
  }

  // 将 _price 同步到唯一 SKU 和规格选项价格
  if (foodBase.SkuList && foodBase.SkuList.length > 0) {
    foodBase.SkuList[0].Price = _price
  } else {
    // SkuList 为空时补一条默认 SKU
    const skuId = genId()
    foodBase.SkuList = [{
      id: skuId,
      Price: _price,
      Sequence: 0,
      BoxPrice: 0,
      Stock: -1,
      MaxStock: -1,
      AutoRefresh: false,
      Status: FoodSellStatusType.可售,
      BoxNum: 1,
      SkuPath: '默认',
      SkuId: skuId,
      Weight: 0,
      WeightType: UintType.None,
      ForSpec: [],
    }]
  }
  if (foodBase.Specifications?.[0]?.Options?.[0]) {
    foodBase.Specifications[0].Options[0].Price = _price
  }

  const imageUrls = _sourceImages.map((img: SourceFoodImage, idx: number) => ({
    Img: img.imgUrl,
    IsMaster: idx === 0,
    Index: idx,
  }))

  const cleanFood = { ...foodBase, ImageUrls: imageUrls }

  if (_foodId) {
    await apiManager.foodmoveApi.UpdaetFood({
      ...cleanFood,
      task: props.taskId,
      food_id: _foodId,
    })
  } else {
    const foodId = await apiManager.foodmoveApi.AddFoodToTask({
      ...cleanFood,
      task: props.taskId,
      GroupOffId: group.OfficeId,
      GroupMultipOffId: [group.OfficeId],
    })
    food._foodId = foodId
  }
  return true
}

// 保存单个（供模板调用）
const savingIds = ref<Set<string>>(new Set())
const handleSaveOne = async (food: GrouponFoodDraft) => {
  if (savingIds.value.has(food.id)) return
  savingIds.value.add(food.id)
  try {
    const group = await ensureGrouponGroup()
    await saveSingleFood(food, group)
    gp.$baseMessage(`"${food.Name}" 已保存`, 'success', 'hey')
  } catch (e: any) {
    ElMessage.error(`保存失败：${e?.message ?? '未知错误'}`)
  } finally {
    savingIds.value.delete(food.id)
  }
}

// 保存全部
const handleSave = async () => {
  if (grouponFoods.value.length === 0) {
    ElMessage.warning('请先添加至少一个团购商品')
    return
  }
  saving.value = true
  try {
    const group = await ensureGrouponGroup()
    let successCount = 0
    let failCount = 0

    for (const food of grouponFoods.value) {
      try {
        await saveSingleFood(food, group)
        successCount++
      } catch {
        failCount++
      }
    }

    if (failCount === 0) {
      gp.$baseMessage(`团购商品已全部提交，共 ${successCount} 个`, 'success', 'hey')
    } else {
      ElMessage.warning(`提交完成：成功 ${successCount} 个，失败 ${failCount} 个`)
    }
    emit('save', grouponFoods.value)
  } catch (e: any) {
    ElMessage.error(`提交失败：${e?.message ?? '未知错误'}`)
  } finally {
    saving.value = false
  }
}

// 单个复制：先自动保存，再通知父组件用数据库 foodId 直接触发 syncFoods
const handleSingleCopy = async (food: GrouponFoodDraft) => {
  try {
    const group = await ensureGrouponGroup()
    await saveSingleFood(food, group)
  } catch (e: any) {
    ElMessage.error(`保存失败，无法复制：${e?.message ?? '未知错误'}`)
    return
  }
  // 传数据库真实 foodId，父组件直接用它调 syncFoods，跳过 updateFood
  emit('groupon-single-copy', food._foodId)
}

// 是否可操作上下架（需已保存到数据库，有 _foodId）
const canChangeShelf = (food: GrouponFoodDraft) => !!food._foodId

const shelfChangingIds = ref<Set<string>>(new Set())
const handleShelfChange = async (food: GrouponFoodDraft, onSale: boolean) => {
  if (!canChangeShelf(food) || shelfChangingIds.value.has(food.id)) return
  const newStatus = onSale ? FoodStatusType.已上架 : FoodStatusType.已下架
  shelfChangingIds.value.add(food.id)
  try {
    const { _price, _collapsed, _dinerCount, _dinerCountCustom, _sourceImages, _foodId, ...rest } = food
    const foodBase = JSON.parse(JSON.stringify(rest)) as any
    if (_dinerCount === -1) {
      const customNum = parseInt(_dinerCountCustom, 10)
      if (!isNaN(customNum) && customNum > 0) foodBase.UsePeopleNum = { Start: customNum, End: customNum }
    } else {
      const start = Math.floor(_dinerCount)
      const end = Math.ceil(_dinerCount)
      foodBase.UsePeopleNum = { Start: start, End: end }
    }
    if (foodBase.SkuList?.[0]) foodBase.SkuList[0].Price = _price
    if (foodBase.Specifications?.[0]?.Options?.[0]) foodBase.Specifications[0].Options[0].Price = _price
    const imageUrls = _sourceImages.map((img: SourceFoodImage, idx: number) => ({
      Img: img.imgUrl,
      IsMaster: idx === 0,
      Index: idx,
    }))
    await apiManager.foodmoveApi.UpdaetFood({
      ...foodBase,
      ImageUrls: imageUrls,
      Status: newStatus,
      task: props.taskId,
      food_id: _foodId,
    })
    food.Status = newStatus
    ElMessage.success(onSale ? '已设为上架' : '已设为下架')
  } catch (e: any) {
    ElMessage.error(`更新失败：${e?.message ?? '未知错误'}`)
  } finally {
    shelfChangingIds.value.delete(food.id)
  }
}
</script>

<template>
  <div class="groupon-manager">
    <!-- 顶部操作栏 -->
    <div class="groupon-toolbar">
      <div class="groupon-toolbar-left">
        <span class="groupon-title">团购商品管理</span>
        <template v-if="grouponFoods.length > 0">
          <el-divider direction="vertical" />
          <el-link type="primary" :underline="false"
            @click="grouponFoods.forEach(f => f._collapsed = false)">全部展开</el-link>
          <el-link style="margin-left:10px" :underline="false"
            @click="grouponFoods.forEach(f => f._collapsed = true)">全部折叠</el-link>
        </template>
      </div>
      <div class="groupon-toolbar-btns">
        <el-button v-if="isGrouponGroup" type="primary" :icon="Plus" @click="() => openAddPanel(null)">
          快速选择商品添加
        </el-button>
        <el-button v-if="isGrouponGroup" @click="addEmptyGrouponFood">手动新建</el-button>
        <el-button type="success" :loading="saving" @click="handleSave">保存提交</el-button>
      </div>
    </div>

    <!-- 快速添加面板：左树右表 -->
    <el-dialog v-model="addPanelVisible"
      :title="addPanelTargetFood ? `向「${addPanelTargetFood.Name}」导入菜品分组` : '快速选择商品添加团购套餐'" width="900px" draggable
      :close-on-click-modal="false">
      <div class="add-panel-split">
        <!-- 左侧：递归分组树 -->
        <div class="add-panel-left">
          <div class="add-panel-left-title">商品分组</div>
          <el-scrollbar class="add-panel-tree-wrap">
            <el-tree ref="treeRef" :data="treeData" node-key="id" :props="{ label: 'label', children: 'children' }"
              :highlight-current="true" default-expand-all @node-click="handleTreeNodeClick" />
          </el-scrollbar>
        </div>

        <!-- 右侧：商品表格（多选） -->
        <div class="add-panel-right">
          <div class="add-panel-right-header">
            <span class="add-panel-left-title">
              选择商品
              <span v-if="selectedFoodIds.length > 0" class="selected-count">
                （已选 {{ selectedFoodIds.length }} 个）
              </span>
            </span>
            <el-pagination v-if="foodTotal > foodPageSize" small :current-page="foodPage" :page-size="foodPageSize"
              :total="foodTotal" layout="total, prev, pager, next" @current-change="handleFoodPageChange" />
          </div>
          <div v-loading="loadingFoods" class="add-panel-table-wrap">
            <el-empty v-if="!selectedGroupId && !loadingFoods" description="请先在左侧选择分组" />
            <el-empty v-else-if="selectedGroupId && !loadingFoods && foodOptions.length === 0" description="该分组暂无商品" />
            <el-table v-else :data="foodOptions" size="small" height="100%"
              @selection-change="(rows: FoodOption[]) => selectedFoodIds = rows.map(r => r.id)">
              <el-table-column type="selection" width="42" />
              <el-table-column label="图片" width="56" align="center">
                <template #default="{ row }">
                  <img v-if="row.ImageUrls && row.ImageUrls[0]?.Img" :src="row.ImageUrls[0].Img"
                    class="food-table-thumb" />
                  <div v-else class="food-table-thumb food-table-thumb--empty" />
                </template>
              </el-table-column>
              <el-table-column label="商品名称" prop="Name" min-width="180" show-overflow-tooltip />
              <el-table-column label="价格" width="150" align="center">
                <template #default="{ row }">
                  <span class="food-price-text">{{ getFoodMinPrice(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="SKU数" width="72" align="center">
                <template #default="{ row }">
                  <el-tag size="small" type="info">{{ getFoodSkuCount(row) }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="add-panel-tip">
            多选商品后，所有选中商品将合并为<strong>一个团购套餐</strong>，每个商品对应一个菜品分组，该商品的规格选项作为菜品名称。
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="addPanelVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="selectedFoodIds.length === 0" @click="confirmAddFood">
          确认添加为一个套餐（{{ selectedFoodIds.length }} 个分组）
        </el-button>
      </template>
    </el-dialog>

    <!-- 团购商品列表 -->
    <div v-if="loadingSaved" class="groupon-empty">
      <el-empty description="正在加载已有团购商品..." :image-size="80" />
    </div>
    <div v-else-if="grouponFoods.length === 0" class="groupon-empty">
      <el-empty description="暂无团购商品，点击上方按钮添加">
        <el-button type="primary" @click="() => openAddPanel(null)">快速选择商品添加</el-button>
      </el-empty>
    </div>

    <div v-for="(food, foodIdx) in grouponFoods" :key="food.id" class="groupon-food-card">
      <!-- 套餐头部 -->
      <div class="food-card-header" @click="toggleCollapse(food)">
        <div class="food-card-header-left">
          <el-icon class="collapse-icon">
            <ArrowDown v-if="food._collapsed" />
            <ArrowUp v-else />
          </el-icon>
          <el-input v-model="food.Name" class="food-name-input" placeholder="套餐名称" @click.stop />
          <div v-if="food.CopyTask && food.CopyTask.try_count" class="copy-state" @click.stop>
            <img alt="" :src="food.CopyTask.succeed ? sussIcon : errorIcon" />
            <span>{{ food.CopyTask.succeed ? '复制成功' : '复制失败' }}</span>
          </div>
          <el-tag v-if="food.err_msg2" type="warning" size="small" style="margin-left:8px" @click.stop>
            {{ food.err_msg2 }}
          </el-tag>
        </div>
        <div class="food-card-header-right">
          <span v-if="canChangeShelf(food)" class="shelf-switch-wrap" @click.stop>
            <el-tooltip :content="food.Status === FoodStatusType.已上架 ? '点击下架' : '点击上架'" placement="top">
              <el-switch :model-value="food.Status === FoodStatusType.已上架" :loading="shelfChangingIds.has(food.id)"
                inactive-text="下架" active-text="上架" inline-prompt
                @update:model-value="(v: string | number | boolean) => handleShelfChange(food, !!v)" />
            </el-tooltip>
          </span>
          <span class="price-label">售价 ¥</span>
          <el-input-number v-model="food._price" :min="0" :precision="2" :step="1" controls-position="right"
            style="width: 130px" @click.stop />
          <el-button v-if="isGrouponGroup" size="small"
            style="margin-left: 12px; background-color: #f59e0b; border-color: #f59e0b; color: #fff;"
            @click.stop="openAddPanel(food)">导入菜品分组</el-button>
          <el-button type="success" size="small" style="margin-left: 6px" :loading="savingIds.has(food.id)"
            @click.stop="handleSaveOne(food)">保存</el-button>
          <el-button type="primary" size="small" style="margin-left: 6px" :loading="savingIds.has(food.id)"
            @click.stop="handleSingleCopy(food)">单个复制</el-button>
          <el-button type="danger" size="small" :icon="Delete" style="margin-left: 6px"
            @click.stop="removeGrouponFood(foodIdx)" />
        </div>
      </div>

      <!-- 套餐内容（可折叠） -->
      <el-collapse-transition>
        <div v-show="!food._collapsed" class="food-card-body">
          <!-- 来源商品图片横排 -->
          <div class="source-images-row">
            <div v-for="(img, imgIdx) in food._sourceImages" :key="imgIdx" class="source-img-item">
              <div class="source-img-wrap">
                <img :src="img.imgUrl" :alt="img.foodName" class="source-img" />
                <span class="source-img-del" @click="food._sourceImages.splice(imgIdx, 1)">×</span>
              </div>
              <span class="source-img-name">{{ img.foodName }}</span>
            </div>
            <!-- 添加图片按钮 -->
            <div class="source-img-add" @click="openImgPicker(food)">
              <span class="source-img-add-icon">+</span>
              <span class="source-img-add-label">添加图片</span>
            </div>
          </div>

          <!-- 用餐人数 -->
          <div class="diner-row">
            <span class="diner-label">用餐人数</span>
            <div class="diner-tabs">
              <span v-for="preset in DINER_PRESETS" :key="preset.value" class="diner-tab"
                :class="{ 'is-active': food._dinerCount === preset.value }" @click="food._dinerCount = preset.value">{{
                  preset.label }}</span>
            </div>
            <el-input v-if="food._dinerCount === -1" v-model="food._dinerCountCustom" placeholder="自定义人数"
              style="width: 100px; margin-left: 8px" size="small" />
          </div>

          <!-- 菜品分组列表（TG_CustomGroupFoods） -->
          <div v-for="(group, gIdx) in food.TG_CustomGroupFoods" :key="gIdx" class="food-group-block">
            <!-- 分组头 -->
            <div class="group-header">
              <el-input v-model="group.GroupName" placeholder="菜品分组名称" class="group-name-input"
                style="width: 160px; flex-shrink: 0" />

              <!-- 固定/可选 切换按钮组 -->
              <div class="group-type-toggle">
                <span class="toggle-btn" :class="{ 'is-active': group.GroupType === CombineGroupType.固定商品 }"
                  @click="group.GroupType = CombineGroupType.固定商品">固定</span>
                <span class="toggle-btn" :class="{ 'is-active': group.GroupType === CombineGroupType.可选商品 }"
                  @click="group.GroupType = CombineGroupType.可选商品">可选</span>
              </div>

              <template v-if="group.GroupType === CombineGroupType.可选商品 && group.GroupRule">
                <span class="group-rule-label">选</span>
                <el-input-number v-model="group.GroupRule.MinOptionalQuantity" :min="1" :max="group.FoodItems.length"
                  controls-position="right" style="width: 64px" />
                <span class="group-rule-label">~</span>
                <el-input-number v-model="group.GroupRule.MaxOptionalQuantity"
                  :min="group.GroupRule.MinOptionalQuantity" :max="group.FoodItems.length" controls-position="right"
                  style="width: 64px" />
                <el-checkbox v-model="group.GroupRule.CanBeReSelected" style="margin-left: 4px; white-space: nowrap">
                  可重复选
                </el-checkbox>
              </template>

              <div class="group-header-ops">
                <el-button size="small" :icon="ArrowUp" @click="moveGroupUp(food, gIdx)" :disabled="gIdx === 0" />
                <el-button size="small" :icon="ArrowDown" @click="moveGroupDown(food, gIdx)"
                  :disabled="gIdx === (food.TG_CustomGroupFoods?.length ?? 1) - 1" />
                <el-button size="small" type="danger" :icon="Delete" @click="removeGroup(food, gIdx)" />
              </div>
            </div>

            <!-- 菜品行表头 -->
            <div class="food-item-header">
              <span class="fi-name">菜品名称</span>
              <span class="fi-price">单价（加价）</span>
              <span class="fi-count">数量</span>
              <span class="fi-unit">单位</span>
              <span class="fi-spec">规格</span>
              <span class="fi-ops">操作</span>
            </div>

            <!-- 菜品行 -->
            <div v-for="(item, iIdx) in group.FoodItems" :key="iIdx" class="food-item-row">
              <el-input v-model="item.FoodName" placeholder="菜品名称" class="fi-name" />
              <el-input-number v-model="item.Price" :min="0" :precision="2" controls-position="right"
                class="fi-price" />
              <el-input-number v-model="item.Count" :min="1" controls-position="right" class="fi-count" />
              <el-select v-model="item.UintType" class="fi-unit">
                <el-option v-for="u in uintTypeOptions" :key="u.value" :label="u.label" :value="u.value" />
              </el-select>
              <el-input v-model="item.Spec" placeholder="规格" class="fi-spec" />
              <div class="fi-ops food-item-ops">
                <el-button size="small" :icon="ArrowUp" @click="moveItemUp(group, iIdx)" :disabled="iIdx === 0" />
                <el-button size="small" :icon="ArrowDown" @click="moveItemDown(group, iIdx)"
                  :disabled="iIdx === group.FoodItems.length - 1" />
                <el-button size="small" type="danger" :icon="Delete" @click="removeFoodItem(group, iIdx)" />
                <el-button size="small" type="primary" :icon="Plus" @click="addFoodItem(group)" />
              </div>
            </div>
          </div>

          <!-- 添加分组按钮 -->
          <el-button class="add-group-btn" @click="addGroup(food)">
            + 添加菜品分组
          </el-button>
        </div>
      </el-collapse-transition>
    </div>
  </div>

  <!-- 图片选择弹窗 -->
  <el-dialog v-model="imgPickerVisible" title="选择商品图片" width="900px" draggable :close-on-click-modal="false">
    <div class="img-picker-split">
      <!-- 左树 -->
      <div class="img-picker-left">
        <div class="add-panel-left-title">商品分组</div>
        <el-scrollbar class="add-panel-tree-wrap">
          <el-tree ref="imgPickerTreeRef" :data="treeData" node-key="id"
            :props="{ label: 'label', children: 'children' }" :highlight-current="true" default-expand-all
            @node-click="handleImgPickerTreeClick" />
        </el-scrollbar>
      </div>

      <!-- 右侧图片网格 -->
      <div class="img-picker-right">
        <div v-if="imgPickerLoading" class="img-picker-loading">
          <el-empty description="加载中..." :image-size="60" />
        </div>
        <div v-else-if="imgPickerFoods.length === 0" class="img-picker-loading">
          <el-empty description="该分组下没有可选图片" :image-size="60" />
        </div>
        <el-scrollbar v-else class="img-picker-scroll">
          <div v-for="item in imgPickerFoods" :key="item.id" class="img-picker-food-block">
            <div class="img-picker-food-name">{{ item.Name }}</div>
            <div class="img-picker-imgs">
              <div v-for="(img, ii) in item.images" :key="ii" class="img-picker-img-item"
                :class="{ 'is-selected': img.selected }" @click="toggleImgSelect(img)">
                <img :src="img.imgUrl" class="img-picker-img" />
                <div v-if="img.selected" class="img-picker-check">✓</div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <template #footer>
      <el-button @click="imgPickerVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmImgPicker">
        确认添加（已选 {{imgPickerFoods.flatMap(f => f.images).filter(i => i.selected).length}} 张）
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.groupon-manager {
  padding: 12px;
  height: 100%;
  overflow-y: auto;
}

.groupon-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.groupon-toolbar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.groupon-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.groupon-toolbar-btns {
  display: flex;
  gap: 8px;
}

.groupon-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.groupon-food-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
}

.food-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}

.food-card-header:hover {
  background: #ecf0f7;
}

.food-card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.collapse-icon {
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.food-name-input {
  width: 280px;
}

.food-card-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.shelf-switch-wrap {
  margin-right: 8px;
}

.price-label {
  font-size: 13px;
  color: #666;
  margin-left: 16px;
}

.copy-state {
  display: flex;
  align-items: center;
  margin-right: 8px;

  img {
    width: 16px;
    height: 16px;
  }

  span {
    margin-left: 4px;
    font-size: 12px;
    opacity: 0.6;
  }
}

.food-card-body {
  padding: 12px;
}

.food-group-block {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px;
  background: #fafafa;
}

/* 来源商品图片横排 */
.source-images-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 4px 10px;
  border-bottom: 1px dashed #e8e8e8;
  margin-bottom: 10px;
}

.source-img-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 72px;
}

.source-img-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.source-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.source-img-del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  background: #f56c6c;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  cursor: pointer;
  display: none;
}

.source-img-wrap:hover .source-img-del {
  display: block;
}

.source-img-name {
  font-size: 11px;
  color: #888;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
  max-width: 72px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 添加图片按钮 */
.source-img-add {
  width: 64px;
  height: 64px;
  border: 2px dashed #c0c4cc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: border-color 0.2s, color 0.2s;
  flex-shrink: 0;
  gap: 2px;
}

.source-img-add:hover {
  border-color: #409eff;
  color: #409eff;
}

.source-img-add-icon {
  font-size: 22px;
  line-height: 1;
  font-weight: 300;
}

.source-img-add-label {
  font-size: 10px;
}

/* 图片选择弹窗 */
.img-picker-split {
  display: flex;
  height: 500px;
  gap: 0;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.img-picker-left {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.img-picker-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.img-picker-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-picker-scroll {
  flex: 1;
  padding: 12px;
}

.img-picker-food-block {
  margin-bottom: 16px;
}

.img-picker-food-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.img-picker-imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.img-picker-img-item {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 4px;
  border: 2px solid #e8e8e8;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}

.img-picker-img-item:hover {
  border-color: #409eff;
}

.img-picker-img-item.is-selected {
  border-color: #409eff;
}

.img-picker-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-picker-check {
  position: absolute;
  inset: 0;
  background: rgba(64, 158, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  font-weight: bold;
}

/* 用餐人数 */
.diner-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 6px 8px;
  background: #f0f5ff;
  border-radius: 4px;
}

.diner-label {
  font-size: 13px;
  color: #555;
  font-weight: 600;
  flex-shrink: 0;
}

.diner-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.diner-tab {
  padding: 2px 10px;
  border: 1px solid #d0d7e3;
  border-radius: 3px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  background: #fff;
  user-select: none;
  transition: all 0.15s;
}

.diner-tab:hover {
  border-color: #409eff;
  color: #409eff;
}

.diner-tab.is-active {
  background: #e6a23c;
  border-color: #e6a23c;
  color: #fff;
  font-weight: 600;
}

/* 分组类型切换按钮 */
.group-type-toggle {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.toggle-btn {
  padding: 0 10px;
  height: 28px;
  line-height: 28px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  background: #fff;
  color: #606266;
  transition: all 0.15s;
}

.toggle-btn:first-child {
  border-right: 1px solid #dcdfe6;
}

.toggle-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}

.toggle-btn.is-active {
  background: #409eff;
  color: #fff;
}

.group-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e0e0e0;
}

.group-rule-label {
  font-size: 13px;
  color: #555;
  margin: 0 1px;
}

.group-header-ops {
  margin-left: auto;
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

/* 菜品行 —— 用 fi- 前缀避免与外部冲突 */
.food-item-header {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  padding: 0 2px 4px;
  gap: 4px;
}

.food-item-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 5px;
}

.fi-name {
  flex: 0 0 30%;
  min-width: 0;
  width: 30%;
}

.fi-price {
  width: 100px;
  flex-shrink: 0;
}

.fi-count {
  width: 72px;
  flex-shrink: 0;
}

.fi-unit {
  width: 80px;
  flex-shrink: 0;
}

.fi-spec {
  width: 90px;
  flex-shrink: 0;
}

.fi-ops {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  gap: 2px;
  align-items: center;
}

.food-item-ops {
  display: flex;
  gap: 2px;
  align-items: center;
}

.add-group-btn {
  width: 100%;
  margin-top: 4px;
  border-style: dashed;
}

/* 添加面板：左树右表布局 */
.add-panel-split {
  display: flex;
  height: 500px;
  gap: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.add-panel-left {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.add-panel-left-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  padding: 10px 12px 8px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.add-panel-tree-wrap {
  flex: 1;
  overflow: hidden;
}

.add-panel-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.add-panel-right-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px 6px 12px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.selected-count {
  color: #409eff;
  font-weight: normal;
}

.add-panel-table-wrap {
  flex: 1;
  overflow: hidden;
  padding: 0 4px;
}

.add-panel-tip {
  font-size: 12px;
  color: #999;
  background: #f9f9f9;
  padding: 6px 12px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.food-table-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 3px;
  display: block;
  margin: auto;
}

.food-table-thumb--empty {
  background: #f0f0f0;
}

.food-price-text {
  color: #e6a23c;
  font-weight: 500;
  font-size: 13px;
}
</style>