import type { Strapi } from '@strapi/strapi'

type UniqueFields =
  | UniqueFieldConfig<string>
  | UniqueFieldConfig<number>
  | UniqueFieldConfig<boolean>

type EditableFields =
  | EditableFieldConfig<string>
  | EditableFieldConfig<number>
  | EditableFieldConfig<boolean>

type ResolveValueFn<T> = (strapi: Strapi, src: never, name: string) => T

interface ContentTypeConfig {
  enabled: boolean
  showButtonInAdmin: boolean
  editableFields: Record<string, EditableFields>
  uniqueFields: Record<string, UniqueFields>
}

interface EditableFieldConfig<T> {
  required?: boolean
  initialValue: ResolveValueFn<T>
  fillButton?: FillButtonConfig
}

interface UniqueFieldConfig<T> {
  value: ResolveValueFn<T>
}

interface FillButtonConfig {
  label: string
  value: (data: Record<string, string>) => string
}

interface Config {
  contentTypes: Record<string, ContentTypeConfig>
  defaultUniqueFieldsValue: ResolveValueFn<any>
}

export {
  Config,
  ContentTypeConfig,
  EditableFieldConfig,
  EditableFields,
  FillButtonConfig,
  ResolveValueFn,
  UniqueFieldConfig,
  UniqueFields,
}
