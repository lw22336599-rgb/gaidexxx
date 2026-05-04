import type { Ref, ComputedRef } from 'vue'
import type { FuncConfSchemaResult } from '@/TsModel/Alien/Controllers/Function/FuncConfSchemaResult'

export interface SchemaProperty {
  type?: string
  description?: string
  title?: string
  enum?: any[]
  enumNames?: string[]
  [key: string]: any
}

export interface ParsedSchema {
  properties?: Record<string, SchemaProperty>
  definitions?: Record<string, unknown>
  [key: string]: any
}

const schemaCache = new Map<string, ParsedSchema>()

function parseRootSchema(schema: FuncConfSchemaResult | null): ParsedSchema | null {
  if (!schema?.ConfSchema) return null
  const key = schema.FuncCode
  if (!schemaCache.has(key)) {
    try {
      const parsed: ParsedSchema =
        typeof schema.ConfSchema === 'string' ? JSON.parse(schema.ConfSchema) : (schema.ConfSchema as ParsedSchema)
      schemaCache.set(key, parsed)
    } catch {
      schemaCache.set(key, {})
    }
  }
  const parsed = schemaCache.get(key)
  return parsed && Object.keys(parsed).length > 0 ? parsed : null
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

export function resolveProperty(prop: SchemaProperty, root: ParsedSchema): SchemaProperty {
  const mergeResolved = (resolved: SchemaProperty): SchemaProperty => {
    const merged: SchemaProperty = { ...prop, type: resolved.type ?? prop.type }
    if (resolved.enum) {
      merged.enum = resolved.enum
      merged.enumNames = resolved['x-enumNames'] ?? resolved.enumNames
    }
    if (resolved.format) merged.format = resolved.format
    if (resolved['x-format']) merged['x-format'] = resolved['x-format']
    return merged
  }
  if (!prop.enum && Array.isArray(prop.oneOf)) {
    for (const item of prop.oneOf) {
      if (item.$ref) {
        const resolved = resolveRef(item.$ref, root)
        if (resolved) return mergeResolved(resolved)
      }
    }
  }
  if ((prop as any).$ref) {
    const resolved = resolveRef((prop as any).$ref, root)
    if (resolved) return mergeResolved(resolved)
  }
  return prop
}

export function getRootSchema(schema: FuncConfSchemaResult | null): ParsedSchema | null {
  return parseRootSchema(schema)
}

export function getParsedProperties(schema: FuncConfSchemaResult | null): Record<string, SchemaProperty> {
  const root = getRootSchema(schema)
  if (!root?.properties) return {}
  const resolved: Record<string, SchemaProperty> = {}
  for (const [k, v] of Object.entries(root.properties)) {
    resolved[k] = resolveProperty(v as SchemaProperty, root)
  }
  return resolved
}

export function isObjectProperty(field: SchemaProperty, root: ParsedSchema): boolean {
  return getObjectItemSchema(field, root) != null
}

function isSimpleSchemaType(field: SchemaProperty): boolean {
  if (field.enum) return true
  const t = field.type
  const types = Array.isArray(t) ? (t as string[]).filter(Boolean) : t ? [String(t)] : []
  const prim = ['string', 'number', 'integer', 'boolean']
  if (types.some((x: string) => prim.includes(x))) return true
  if (field.format === 'date-time' || field.format === 'time' || field['x-format'] === 'time') return true
  return false
}

export function isSimpleObjectProperty(field: SchemaProperty, root: ParsedSchema): boolean {
  const itemSchema = getObjectItemSchema(field, root)
  if (!itemSchema?.properties) return false
  const props = getObjectItemProperties(field, root)
  return Object.values(props).every(p => isSimpleSchemaType(p))
}

function getObjectItemSchema(field: SchemaProperty, root: ParsedSchema): SchemaProperty | null {
  const ref = (field as any).$ref
  if (ref) {
    const resolved = resolveRef(ref, root)
    if (resolved && resolved.properties && !resolved.enum) return resolved
  }
  if (Array.isArray((field as any).oneOf)) {
    for (const item of (field as any).oneOf) {
      if (item && item.$ref) {
        const resolved = resolveRef(item.$ref, root)
        if (resolved && resolved.properties && !resolved.enum) return resolved
      }
    }
  }
  if (field.type === 'object' && field.properties) return field
  return null
}

export function getObjectItemProperties(field: SchemaProperty, root: ParsedSchema): Record<string, SchemaProperty> {
  const itemSchema = getObjectItemSchema(field, root)
  if (!itemSchema?.properties) return {}
  const resolved: Record<string, SchemaProperty> = {}
  for (const [k, v] of Object.entries(itemSchema.properties)) {
    resolved[k] = resolveProperty(v as SchemaProperty, root)
  }
  return resolved
}

export function getArrayItemSchema(field: SchemaProperty, root: ParsedSchema): SchemaProperty | null {
  if (field.type !== 'array' || !field.items) return null
  const items = field.items as SchemaProperty
  if (items.$ref) {
    const resolved = resolveRef(items.$ref, root)
    return resolved ?? null
  }
  if (items.properties || items.type === 'object') return items
  return null
}

export function isArrayOfObject(field: SchemaProperty, root: ParsedSchema): boolean {
  return getArrayItemSchema(field, root) != null
}

export function isArrayOfEnum(field: SchemaProperty, root: ParsedSchema): boolean {
  if (field.type !== 'array' || !field.items) return false
  return !!getArrayItemSchema(field, root)?.enum
}

export function isArrayOfString(field: SchemaProperty): boolean {
  return field.type === 'array' && (field.items as SchemaProperty)?.type === 'string'
}

export function getArrayItemProperties(field: SchemaProperty, root: ParsedSchema): Record<string, SchemaProperty> {
  const itemSchema = getArrayItemSchema(field, root)
  if (!itemSchema?.properties) return {}
  const resolved: Record<string, SchemaProperty> = {}
  for (const [k, v] of Object.entries(itemSchema.properties)) {
    resolved[k] = resolveProperty(v as SchemaProperty, root)
  }
  return resolved
}

function getDefaultValueForField(field: SchemaProperty, root: ParsedSchema): any {
  if (field.default !== undefined) return field.default
  if (field.type === 'array') {
    const itemSchema = getArrayItemSchema(field, root)
    if (itemSchema?.properties) {
      return [getDefaultObjectItem(getArrayItemProperties(field, root))]
    }
    return Array.isArray(field.default) ? field.default : []
  }
  if (field.enum?.length) return field.enum[0]
  if (field.type === 'number' || field.type === 'integer') return 0
  if (field.type === 'boolean') return false
  return undefined
}

export function getDefaultArrayItem(
  itemProps: Record<string, SchemaProperty>,
  root: ParsedSchema,
  arrayField?: SchemaProperty
): Record<string, any> {
  const obj: Record<string, any> = {}
  for (const [k, field] of Object.entries(itemProps)) {
    if (field.default !== undefined) obj[k] = field.default
    else if (field.type === 'array') obj[k] = getDefaultValueForField(field, root)
    else obj[k] = getDefaultValueForField(field, root)
  }
  return obj
}

function getDefaultObjectItem(itemProps: Record<string, SchemaProperty>, root?: ParsedSchema): Record<string, any> {
  const obj: Record<string, any> = {}
  for (const [k, field] of Object.entries(itemProps)) {
    if (field.default !== undefined) obj[k] = field.default
    else if (field.type === 'array' && root) obj[k] = getDefaultValueForField(field, root)
    else if (field.type === 'array') obj[k] = []
    else if (field.enum?.length) obj[k] = field.enum[0]
    else if (field.type === 'number' || field.type === 'integer') obj[k] = 0
    else if (field.type === 'boolean') obj[k] = false
    else obj[k] = undefined
  }
  return obj
}

export function clearSchemaCache() {
  schemaCache.clear()
}

export function initDefaultConfFromSchema(schema: FuncConfSchemaResult | null, conf: Record<string, any>) {
  const root = getRootSchema(schema)
  const props_ = getParsedProperties(schema)
  for (const [k, field] of Object.entries(props_)) {
    if (field.default !== undefined && conf[k] === undefined) conf[k] = field.default
    else if (field.type === 'array' && conf[k] === undefined)
      conf[k] =
        Array.isArray(field.default) && field.default.length > 0
          ? field.default
          : root
            ? getDefaultValueForField(field, root)
            : []
    else if (
      root &&
      isObjectProperty(field, root) &&
      (conf[k] === undefined || typeof conf[k] !== 'object' || Array.isArray(conf[k]))
    ) {
      conf[k] = getDefaultObjectItem(getObjectItemProperties(field, root), root)
    }
  }
}
