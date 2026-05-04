<template>
  <div class="schema-field-renderer">
    <el-select
      v-if="field.enum && !field['x-fetchShopGroups'] && field.type !== 'array'"
      :model-value="modelValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      :multiple="false"
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option
        v-for="(ev, idx) in filterEnumExcludeNone(field)"
        :key="idx"
        :label="getEnumLabel(field, ev)"
        :value="ev"
      />
    </el-select>

    <el-select
      v-else-if="rootSchema && isArrayOfEnum(field, rootSchema)"
      :model-value="modelValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      multiple
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option
        v-for="(ev, idx) in filterEnumExcludeNone(getArrayItemSchema(field, rootSchema)!)"
        :key="idx"
        :label="getEnumLabel(getArrayItemSchema(field, rootSchema)!, ev)"
        :value="ev"
      />
    </el-select>

    <el-select
      v-else-if="field['x-fetchShopGroups']"
      :model-value="modelValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      multiple
      :style="inputWidthStyle"
      :loading="groupOptionsLoading"
      filterable
      @update:model-value="$emit('update:modelValue', $event)"
      @visible-change="(v: boolean) => v && onEnsureGroupOptions?.()"
    >
      <el-option v-for="g in groupOptions ?? []" :key="g.OfficeId" :label="g.Name" :value="g.OfficeId" />
    </el-select>

    <div v-else-if="rootSchema && isObjectProperty(field, rootSchema)" class="object-field-wrap group-border">
      <div class="object-field-inner">
        <template v-for="(subField, subKey) in getObjectItemProperties(field, rootSchema)" :key="subKey">
          <SchemaFieldRenderer
            :model-value="getObjVal(modelValue, subKey, subField)"
            :field="subField"
            :field-key="subKey"
            :root-schema="rootSchema"
            :compact="true"
            :placeholder="'请选择'"
            :group-options="groupOptions"
            :group-options-loading="groupOptionsLoading"
            :on-ensure-group-options="onEnsureGroupOptions"
            @update:model-value="(v: any) => setObjVal(modelValue, subKey, v)"
          />
        </template>
      </div>
    </div>

    <div v-else-if="rootSchema && isArrayOfObject(field, rootSchema)" class="array-of-object-wrap group-border">
      <div v-for="(item, idx) in modelValue || []" :key="idx" class="array-item-row">
        <div class="array-item-fields">
          <template v-for="(subField, subKey) in getArrayItemProperties(field, rootSchema)" :key="subKey">
            <div class="array-item-field">
              <span class="array-item-label">{{ subField.title || subKey }}</span>
              <SchemaFieldRenderer
                :model-value="item[subKey]"
                :field="subField"
                :field-key="subKey"
                :root-schema="rootSchema"
                :compact="true"
                :placeholder="'请选择'"
                class="array-item-input"
                @update:model-value="item[subKey] = $event"
              />
            </div>
          </template>
        </div>
        <el-button type="danger" link size="small" class="array-item-delete" @click="removeArrayItem(Number(idx))"
          >删除</el-button
        >
      </div>
      <el-button type="primary" link size="small" @click="addArrayItem">{{ addButtonText }}</el-button>
    </div>

    <div v-else-if="isArrayOfString(field)" class="tag-input-wrap">
      <el-tag v-for="(item, i) in modelValue || []" :key="i" closable size="small" @close="removeTag(Number(i))">{{
        item
      }}</el-tag>
      <el-input
        :model-value="getTagInputValue()"
        size="small"
        placeholder="回车添加"
        style="flex: 1; min-width: 80px"
        @update:model-value="onTagInputUpdate"
        @keyup.enter="addTag"
      />
    </div>

    <el-select
      v-else-if="field.type === 'boolean' && clearable"
      :model-value="modelValue"
      :placeholder="placeholder"
      clearable
      :size="compact ? 'small' : 'default'"
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option label="是" :value="true" />
      <el-option label="否" :value="false" />
    </el-select>

    <el-switch
      v-else-if="field.type === 'boolean'"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <el-input-number
      v-else-if="field.type === 'number' || field.type === 'integer'"
      :model-value="modelValue"
      :precision="field.type === 'integer' ? 0 : undefined"
      :size="compact ? 'small' : 'default'"
      :controls="compact ? false : undefined"
      controls-position="right"
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <el-date-picker
      v-else-if="field.format === 'date-time'"
      :model-value="modelValue"
      type="datetime"
      value-format="YYYY-MM-DD HH:mm:ss"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <el-time-picker
      v-else-if="isTimeFormat(field)"
      :model-value="modelValue"
      value-format="HH:mm"
      format="HH:mm"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <el-input
      v-else-if="isTextareaFormat(field)"
      :model-value="modelValue"
      type="textarea"
      :rows="4"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      class="schema-textarea"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <el-input
      v-else
      :model-value="modelValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="compact ? 'small' : 'default'"
      :style="inputWidthStyle"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getArrayItemSchema,
  getArrayItemProperties,
  getDefaultArrayItem,
  getObjectItemProperties,
  isArrayOfEnum,
  isArrayOfObject,
  isArrayOfString,
  resolveProperty
} from './useFuncConfSchema'
import type { SchemaProperty, ParsedSchema } from './useFuncConfSchema'
import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'

const props = withDefaults(
  defineProps<{
    modelValue: any
    field: SchemaProperty
    fieldKey: string
    rootSchema: ParsedSchema | null
    compact?: boolean
    placeholder?: string
    clearable?: boolean
    groupOptions?: FoodGroupItem[]
    groupOptionsLoading?: boolean
    onEnsureGroupOptions?: () => void
    tagInputMap?: Record<string, string>
    tagInputKey?: string
  }>(),
  { compact: false, placeholder: '请选择', clearable: false }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const inputWidthStyle = computed(() => (props.compact ? 'width: auto; min-width: 130px;' : 'width: 100%;'))

function getObjectItemSchema(field: SchemaProperty, root: ParsedSchema): SchemaProperty | null {
  const ref = (field as any).$ref
  if (ref) {
    const resolved = resolveRef(ref, root)
    if (resolved && resolved.properties && !resolved.enum) return resolved
  }
  if (Array.isArray((field as any).oneOf)) {
    for (const item of (field as any).oneOf) {
      if (item?.$ref) {
        const resolved = resolveRef(item.$ref, root)
        if (resolved && resolved.properties && !resolved.enum) return resolved
      }
    }
  }
  if (field.type === 'object' && field.properties) return field
  return null
}

function resolveRef(refStr: string, root: ParsedSchema): SchemaProperty | null {
  if (!refStr.startsWith('#/')) return null
  const parts = refStr.slice(2).split('/')
  let node: any = root
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return null
    node = node[part]
  }
  return node ?? null
}

function isObjectProperty(field: SchemaProperty, root: ParsedSchema): boolean {
  return getObjectItemSchema(field, root) != null
}

function getObjVal(obj: any, key: string, subField: SchemaProperty): any {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) return undefined
  let val = obj[key]
  const isObjField = subField.type === 'object' || (subField as any).$ref
  if (isObjField && (val == null || typeof val !== 'object' || Array.isArray(val))) {
    val = obj[key] = {}
  }
  return val
}

function setObjVal(obj: any, key: string, v: any) {
  if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) obj[key] = v
}

function addArrayItem() {
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const itemProps = props.rootSchema ? getArrayItemProperties(props.field, props.rootSchema) : {}
  const def = props.rootSchema ? getDefaultArrayItem(itemProps, props.rootSchema) : {}
  arr.push(def)
  emit('update:modelValue', arr)
}

function removeArrayItem(idx: number) {
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  arr.splice(idx, 1)
  emit('update:modelValue', arr)
}

const filterEnumExcludeNone = (f: SchemaProperty): any[] =>
  (f.enum ?? []).filter((ev: any) => String(ev).toLowerCase() !== 'none')

function getEnumLabel(f: SchemaProperty, value: any): string {
  const names = f.enumNames ?? f['x-enumNames']
  if (names) {
    const idx = f.enum?.indexOf(value) ?? -1
    if (idx >= 0 && names[idx] !== undefined) return String(names[idx])
  }
  return String(value)
}

function isTimeFormat(f: SchemaProperty): boolean {
  return f.format === 'time' || f['x-format'] === 'time'
}

function isTextareaFormat(f: SchemaProperty): boolean {
  return f['x-format'] === 'textarea' || f.format === 'textarea'
}

function getTagInputValue(): string {
  const key = props.tagInputKey
  const map = props.tagInputMap
  return (key && map && map[key]) ?? ''
}

function onTagInputUpdate(v: string) {
  const key = props.tagInputKey
  const map = props.tagInputMap
  if (key && map != null) map[key] = v
}

function addTag() {
  const key = props.tagInputKey
  const map = props.tagInputMap
  if (!key || !map) return
  const val = (map[key] ?? '').trim()
  if (!val) return
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (!arr.includes(val)) {
    arr.push(val)
    emit('update:modelValue', arr)
  }
  map[key] = ''
}

function removeTag(i: number) {
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  arr.splice(i, 1)
  emit('update:modelValue', arr)
}

const addButtonText = computed(() => {
  const title = props.field.title || props.fieldKey || '项'
  const s = String(title)
  const short = s.replace(/列表$/, '').replace(/配置$/, '组')
  return `+ 新增${short}`
})
</script>

<style scoped lang="scss">
.schema-field-renderer {
  width: 100%;
}

.group-border {
  border: 1px solid var(--el-border-color);
}

.object-field-wrap {
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  width: 100%;
  min-width: 0;

  .object-field-inner {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    width: 100%;

    > .schema-field-renderer {
      flex: 0 1 auto;
      width: auto;
      min-width: 100px;
    }
  }
}

.array-of-object-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-extra-light);

  .array-item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    flex-wrap: wrap;
    width: 100%;
    min-width: 0;
    border: 1px solid var(--el-border-color-lighter);
  }

  .array-item-fields {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .array-item-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 1 1 auto;
    min-width: 0;

    .array-item-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      flex-shrink: 0;
    }

    :deep(.schema-field-renderer),
    :deep(.array-item-input) {
      flex: 1;
      min-width: 80px;
      max-width: 100%;
    }
  }

  .array-item-delete {
    flex-shrink: 0;
  }
}

.schema-textarea {
  width: 100%;
  min-width: 200px;

  :deep(.el-textarea__inner) {
    resize: both;
    min-width: 200px;
    min-height: 80px;
  }
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
}
</style>
