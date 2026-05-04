<template>
  <template v-if="parsedProperties && Object.keys(parsedProperties).length > 0">
    <div class="default-conf-area">
      <div class="sub-header">默认参数（所有店铺）</div>
      <el-form label-position="top" size="small" class="schema-form">
        <el-form-item
          v-for="(field, key) in parsedProperties"
          :key="key"
          :class="{
            'form-item-full':
              rootSchema &&
              (isArrayOfObject(field, rootSchema) ||
                (isObjectProperty(field, rootSchema) && !isSimpleObjectProperty(field, rootSchema))),
            'form-item-inline': rootSchema && (isSimpleObjectProperty(field, rootSchema) || isCompactRootField(field))
          }"
        >
          <template #label>
            <span class="field-label">
              {{ field.title || String(key) }}
              <el-tooltip v-if="field.description" :content="field.description" placement="top" :show-after="200">
                <el-icon class="field-tip-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <SchemaFieldRenderer
            v-model="defaultConf[key]"
            :field="field"
            :field-key="key"
            :root-schema="rootSchema"
            :compact="isCompactRootField(field)"
            :placeholder="'请选择'"
            :group-options="groupOptions"
            :group-options-loading="groupOptionsLoading"
            :on-ensure-group-options="onEnsureDefaultGroupOptions"
            :tag-input-map="tagInputMap"
            :tag-input-key="`default-${key}`"
          />
        </el-form-item>
      </el-form>
    </div>

    <div v-if="shopList && shopList.length > 0 && getShopConf" class="shop-conf-area">
      <div class="sub-header">各店铺单独参数（留空则使用默认参数）</div>
      <el-table :data="shopList" border size="small" max-height="260px">
        <el-table-column label="店铺名称" prop="name" min-width="120" show-overflow-tooltip fixed>
          <template #default="{ row }">
            <span :class="{ 'blur-text': demoMode }">{{ row.name ?? row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column v-for="(field, key) in parsedProperties" :key="key" :min-width="getColumnMinWidth(field)">
          <template #header>
            <span class="field-label">
              {{ field.title || String(key) }}
              <el-tooltip v-if="field.description" :content="field.description" placement="top" :show-after="200">
                <el-icon class="field-tip-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <template #default="{ row }">
            <SchemaFieldRenderer
              v-model="getShopConf(row.id)[key]"
              :field="field"
              :field-key="key"
              :root-schema="rootSchema"
              compact
              placeholder="默认"
              :clearable="true"
              :group-options="getShopGroupOptions?.(row.id) ?? []"
              :group-options-loading="getShopGroupOptionsLoading?.(row.id)"
              :on-ensure-group-options="() => onEnsureGroupOptions?.(row.id)"
              :tag-input-map="tagInputMap"
              :tag-input-key="`shop-${row.id}-${key}`"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import SchemaFieldRenderer from './SchemaFieldRenderer.vue'
import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import type { FuncConfSchemaResult } from '@/TsModel/Alien/Controllers/Function/FuncConfSchemaResult'
import {
  getRootSchema,
  getParsedProperties,
  isArrayOfObject,
  isObjectProperty,
  isSimpleObjectProperty
} from './useFuncConfSchema'
import type { SchemaProperty } from './useFuncConfSchema'

const props = withDefaults(
  defineProps<{
    schema: FuncConfSchemaResult
    defaultConf: Record<string, any>
    shopList?: Array<{ id: string; name?: string }>
    getShopConf?: (shopId: string) => Record<string, any>
    groupOptions?: FoodGroupItem[]
    groupOptionsLoading?: boolean
    getShopGroupOptions?: (shopId: string) => FoodGroupItem[]
    getShopGroupOptionsLoading?: (shopId: string) => boolean
    onEnsureDefaultGroupOptions?: () => void
    onEnsureGroupOptions?: (shopId: string) => void
    demoMode?: boolean
  }>(),
  { demoMode: false }
)

const tagInputMap = ref<Record<string, string>>({})

const rootSchema = computed(() => getRootSchema(props.schema))

const parsedProperties = computed(() => getParsedProperties(props.schema))

function getColumnMinWidth(field: SchemaProperty): number {
  if (!props.schema || !rootSchema.value) return 130
  const root = rootSchema.value
  const isComplex = isArrayOfObject(field, root) || isObjectProperty(field, root)
  return isComplex ? 320 : 110
}

function isCompactRootField(field: SchemaProperty): boolean {
  if (!rootSchema.value) return false
  const root = rootSchema.value
  if (isArrayOfObject(field, root)) return false
  if (isObjectProperty(field, root)) return false
  return true
}
</script>

<style scoped lang="scss">
.default-conf-area {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-light);

  .schema-form {
    display: flex;
    flex-wrap: wrap;
    column-gap: 12px;
    row-gap: 8px;

    > .el-form-item {
      flex: 0 0 auto;
      min-width: 160px;
      max-width: 100%;
    }

    > .el-form-item.form-item-full {
      flex: 1 1 100%;
      min-width: 100%;
    }

    > .el-form-item.form-item-inline {
      flex: 0 0 auto;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      gap: 12px;
      min-width: 180px;

      :deep(.el-form-item__label) {
        flex-shrink: 0;
        padding-bottom: 0;
        width: auto;
      }

      :deep(.el-form-item__content) {
        flex: 0 1 auto;
        min-width: 0;
      }
    }
  }
}

.shop-conf-area {
  padding: 12px;
  overflow-x: auto;
}

.sub-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 32px;
  padding: 2px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color);

  &.tag-input-wrap-sm {
    min-height: 28px;
    padding: 1px 6px;
  }

  .el-input {
    width: auto;
  }
}

.object-field-wrap {
  padding: 8px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;

  .object-field-label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .object-field-inner {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .object-sub-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .object-sub-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    min-width: 72px;
  }
}

.array-of-object-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .array-item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .array-item-fields {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .array-item-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .array-item-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .array-item-input {
    width: 120px;
    min-width: 100px;
  }
}

.same-default-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .field-tip-icon {
    font-size: 14px;
    color: var(--el-color-info);
    cursor: help;
    flex-shrink: 0;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
}
</style>
