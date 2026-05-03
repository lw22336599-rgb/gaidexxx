# 排序功能问题修复总结

## 问题描述

1. **基础版**: 点击表头没有调用接口
2. **运营版**: 点击表头调用了接口，但排序参数没有传递

## 问题原因分析

### 运营版问题
**根本原因**: `ShopTableOperate.vue` 的 `el-table-column` 模板中缺少 `:prop="item.prop"` 属性绑定

- 虽然在列定义对象中有 `prop` 字段，但没有在模板中绑定
- Element Plus 无法识别排序字段名称，导致排序参数为空

### 基础版问题
**初步分析**: 需要通过浏览器控制台查看具体原因

- `ShopTable.vue` 的模板中已正确绑定 `:prop="item.prop"`
- 可能是事件传递链的问题

## 已修复的代码

### 1. 修复运营版 - ShopTableOperate.vue

**文件**: `src/views/shop/componentsV2/ShopTableOperate.vue`

**修改**: 在 `el-table-column` 中添加 `:prop="item.prop"` 绑定

```vue
<!-- 修改前 -->
<el-table-column v-for="(item, index) in finallyColumns" 
  :key="index" 
  :align="item.align"
  class="shop-table-item-cell" 
  :fixed="item.fixed" 
  :label="item.label" 
  :min-width="item.minWidth || 100"
  show-overflow-tooltip 
  :sortable="item.sortable">

<!-- 修改后 -->
<el-table-column v-for="(item, index) in finallyColumns" 
  :key="index" 
  :align="item.align"
  class="shop-table-item-cell" 
  :fixed="item.fixed" 
  :label="item.label" 
  :min-width="item.minWidth || 100"
  :prop="item.prop"  <!-- 新增 -->
  show-overflow-tooltip 
  :sortable="item.sortable">
```

### 2. 修复初始化问题

**文件**: 
- `src/views/shop/MtFeatureV2.vue`
- `src/views/shop/MtFeatureV2Operation.vue`

**修改**: 将初始 `order_direction` 从 `OrderDirection.Desc` 改为 `undefined`

这样可以确保在没有排序时，不会发送排序参数

```typescript
// 修改前
{
  order_by: undefined,
  order_direction: OrderDirection.Desc  // 这会导致总是发送排序方向
}

// 修改后
{
  order_by: undefined,
  order_direction: undefined  // 只有在排序时才发送参数
}
```

### 3. 添加调试日志

在两个版本的 `getShopList` 函数中添加了 console.log，方便查看实际传递的请求参数

```typescript
// 基础版 - MtFeatureV2.vue
console.log('基础版请求参数:', JSON.stringify(data, null, 2))

// 运营版 - MtFeatureV2Operation.vue
console.log('运营版请求参数:', JSON.stringify(data, null, 2))
```

## 测试步骤

### 测试运营版

1. 打开浏览器控制台 (F12)
2. 进入门店管理V2 - 运营版
3. 点击"实时收入"列头
4. 观察控制台输出：
   - 应该看到 "运营版表格排序变化: { prop: 'income', order: 'descending' }"
   - 应该看到 "排序变化: { field: 'income', order: 'desc' }"
   - 应该看到 "运营版请求参数: ..."，其中包含 `"order_by": "income"` 和 `"order_direction": 1`
5. 观察表格数据是否按收入降序排列
6. 再次点击该列头，观察是否切换为升序
7. 第三次点击，观察是否取消排序

### 测试基础版

1. 打开浏览器控制台 (F12)
2. 进入门店管理V2 - 基础版
3. 点击"实时收入"列头
4. 观察控制台输出：
   - 应该看到 "表格排序变化: { prop: 'income', order: 'descending' }"
   - 应该看到 "排序变化: { field: 'income', order: 'desc' }"
   - 应该看到 "基础版请求参数: ..."，其中包含 `"order_by": "income"` 和 `"order_direction": 1`
5. 观察表格数据是否按收入降序排列

### 预期的网络请求

使用 Chrome DevTools 的 Network 面板：

**基础版请求 (POST /shopmg/getshoplist)**:
```json
{
  "page": 1,
  "pageSize": 20,
  "filter": {
    "shopType": 1
  },
  "order_by": "income",
  "order_direction": 1
}
```

**运营版请求 (POST /shopmg/getshoplistv2)**:
```json
{
  "page": 1,
  "pageSize": 20,
  "filter": {
    "shopType": 1,
    "func_code": "APPDATA",
    "func_state": 1
  },
  "order_by": "income",
  "order_direction": 1
}
```

## 注意事项

1. **事件名称**: Vue 3 会自动将 camelCase 的 emit 事件（如 `sortChange`）转换为 kebab-case 供模板使用（如 `@sort-change`）

2. **prop 属性的重要性**: Element Plus 的 `el-table-column` 必须有 `prop` 属性才能正确识别排序字段

3. **调试日志**: 如果功能正常工作后，可以移除添加的 console.log 语句

## 下一步行动

1. 启动开发服务器: `npm run dev`
2. 在浏览器中测试排序功能
3. 检查控制台输出和网络请求
4. 如果仍有问题，查看控制台的详细错误信息

## 相关文件

- `src/views/shop/MtFeatureV2.vue` - 基础版主组件
- `src/views/shop/MtFeatureV2Operation.vue` - 运营版主组件
- `src/views/shop/componentsV2/ShopTable.vue` - 基础版表格组件
- `src/views/shop/componentsV2/ShopTableOperate.vue` - 运营版表格组件（已修复）
- `src/TsModel/Alien/Controllers/Shop/Get_ShopList_parm.ts` - API 参数类型定义
- `src/TsModel/Alien/Controllers/Shop/OrderDirection.ts` - 排序方向枚举

## 修复日期

2026-01-27
