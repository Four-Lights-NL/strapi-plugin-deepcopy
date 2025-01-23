import type { Core, Schema, UID } from "@strapi/strapi"
import slugify from "slugify"

import { klona } from "klona/json"
import type {
  ContentTypeConfig,
  EditableFields,
  ResolveValueFn,
  UniqueFieldConfig,
  UniqueFields,
} from "strapi-plugin-deepcopy/config"
import prepareForCopy from "../utils/prepareForCopy"
import uniqueCopyName from "../utils/uniqueCopyName"

const getUniqueFields = <T extends string | number | boolean>(
  model: Schema.ContentType,
  resolveValueFn: ResolveValueFn<T>,
) => {
  const uniqueFields: Record<string, UniqueFields> = {}

  for (let i = 0; i < Object.entries(model.attributes ?? {}).length; i += 1) {
    const [fieldName, attr] = Object.entries(model.attributes ?? {})[i]

    // If type is uid, wrap resolved values using slugify
    const valueWrapperFn =
      attr.type === "uid"
        ? (strapi: Core.Strapi, src: never, name: string) =>
            // Strapi uses validation on uid using regexp /^[A-Za-z0-9_-.~]*$/
            slugify(`${resolveValueFn(strapi, src, name)}`, { strict: true })
        : resolveValueFn

    // NOTE: An `uid` field is also implicitly `unique` but not necessarily marked as such
    if ((attr as { unique: boolean | undefined }).unique || attr.type === "uid") {
      uniqueFields[fieldName] = {
        value: valueWrapperFn,
      } as UniqueFieldConfig<string>
    }
  }

  return uniqueFields
}

const getEditableFields = (model: Schema.ContentType, editableFields: Record<string, EditableFields>) => {
  const newEditableFields = { ...editableFields }
  for (let i = 0; i < Object.entries(editableFields).length; i += 1) {
    const [fieldName, fieldConfig] = Object.entries(editableFields)[i]
    const field = model.attributes[fieldName]

    if (fieldConfig.required === undefined) {
      newEditableFields[fieldName].required = field.required ?? false
    }

    if (field.required && fieldConfig.required === false) {
      strapi.log.warn(
        `(strapi-plugin-deepcopy) Field '${fieldName}' is explicitly set as not required but is required in strapi`,
      )
    }
  }
  return newEditableFields
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getContentTypes() {
    const defaultUniqueFieldsValue: ResolveValueFn<string | boolean | number> = await strapi
      .plugin("deep-copy")
      .config("defaultUniqueFieldsValue")

    let contentTypes: Record<UID.ContentType, ContentTypeConfig> = await strapi
      .plugin("deep-copy")
      .config("contentTypes")

    // Filter content types that are not enabled
    contentTypes = Object.fromEntries(
      Object.entries(contentTypes).filter(([, contentTypeConfig]) => contentTypeConfig.enabled),
    )

    // Set unique fields
    contentTypes = Object.fromEntries(
      await Promise.all(
        Object.entries(contentTypes).map(
          async ([contentType, contentTypeConfig]: [UID.ContentType, ContentTypeConfig]) => {
            const model = { ...strapi.getModel(contentType) } // Explicit copy, make sure we get the correct model on every iteration
            const uniqueFields = getUniqueFields(model, defaultUniqueFieldsValue)
            const editableFields = getEditableFields(model, contentTypeConfig.editableFields ?? {})

            return [
              contentType,
              {
                ...(contentTypeConfig as ContentTypeConfig),
                editableFields,
                uniqueFields: {
                  ...uniqueFields,
                  ...(contentTypeConfig as ContentTypeConfig).uniqueFields,
                },
              },
            ]
          },
        ),
      ),
    )

    return contentTypes
  },

  async getInitialValues({ contentType, documentId }: { contentType: UID.ContentType; documentId: string }) {
    const contentTypes = await strapi.plugin("deep-copy").service("config").getContentTypes()
    const entity = await strapi
      .plugin("deep-populate")
      .service("populate")
      .documents(contentType)
      .findOne({ documentId })

    const currentData = klona(entity)

    const { editableFields } = contentTypes[contentType]
    return Object.fromEntries(
      Object.entries(editableFields as EditableFields).map(([field, { initialValue }]) => [
        field,
        initialValue(strapi, currentData, field),
      ]),
    )
  },

  async getFillValue({
    contentType,
    documentId,
    field,
    data,
  }: {
    contentType: UID.ContentType
    documentId: string
    field: string
    data: Record<string, string>
  }) {
    const contentTypes = await strapi.plugin("deep-copy").service("config").getContentTypes()
    const entity = await strapi
      .plugin("deep-populate")
      .service("populate")
      .documents(contentType)
      .findOne({ documentId })

    const currentData = { ...entity, ...data }

    const { editableFields } = contentTypes[contentType]
    return Object.fromEntries([[field, editableFields[field].fillButton.value(currentData)]])
  },

  async getCopyTree({
    contentType,
    documentId,
    ...uniqueFields
  }: { contentType: UID.ContentType; documentId: string; uniqueFields: Record<string, string> }) {
    const sourceEntity = await strapi
      .plugin("deep-populate")
      .service("populate")
      .documents(contentType)
      .findOne({ documentId })
    const targetEntity = { ...sourceEntity, ...uniqueFields }
    const contentTypes = await strapi.plugin("deep-copy").service("config").getContentTypes()
    const mutations = await prepareForCopy(
      contentType,
      targetEntity,
      uniqueCopyName(`${contentType}.${documentId}`),
      contentTypes,
    )

    return {
      contentTypes,
      mutations,
    }
  },
})
