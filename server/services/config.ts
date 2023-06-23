import { ContentTypeSchema, RequiredOption, Strapi, UniqueOption } from '@strapi/strapi'
import slugify from 'slugify'
import {
  ContentTypeConfig,
  EditableFields,
  ResolveValueFn,
  UniqueFields,
} from 'strapi-plugin-deepcopy/config'

import { populateObject } from '../utils'

const getUniqueFields = (model: ContentTypeSchema, resolveValueFn: ResolveValueFn<any>) => {
  const uniqueFields: Record<string, UniqueFields> = {}

  for (let i = 0; i < Object.entries(model.attributes ?? {}).length; i += 1) {
    const [fieldName, attr] = Object.entries(model.attributes ?? {})[i]

    // If type is uid, wrap resolved values using slugify
    const valueWrapperFn =
      attr.type === 'uid'
        ? (strapi: Strapi, src: never, name: string) =>
            // Strapi uses validation on uid using regexp /^[A-Za-z0-9_-.~]*$/
            slugify(resolveValueFn(strapi, src, name), { strict: true })
        : resolveValueFn

    // NOTE: An `uid` field is also implicitly `unique` but not necessarily marked as such
    if ((attr as UniqueOption).unique || attr.type === 'uid') {
      uniqueFields[fieldName] = {
        value: (strapi: Strapi, src: never, name: string) => valueWrapperFn(strapi, src, name),
      }
    }
  }

  return uniqueFields
}

const getEditableFields = (
  model: ContentTypeSchema,
  editableFields: Record<string, EditableFields>,
) => {
  const newEditableFields = { ...editableFields }
  for (let i = 0; i < Object.entries(editableFields).length; i += 1) {
    const [fieldName, fieldConfig] = Object.entries(editableFields)[i]
    const field = model.attributes[fieldName]

    if (fieldConfig.required === undefined) {
      newEditableFields[fieldName].required = (field as RequiredOption).required ?? false
    }

    if ((field as RequiredOption).required && fieldConfig.required === false) {
      strapi.log.warn(
        `(strapi-plugin-deepcopy) Field '${fieldName}' is explicitly set as not required but is required in strapi`,
      )
    }
  }
  return newEditableFields
}

export default ({ strapi }: { strapi: Strapi }) => ({
  async getContentTypes() {
    const defaultUniqueFieldsValue: ResolveValueFn<any> = await strapi
      .plugin('deep-copy')
      .config('defaultUniqueFieldsValue')

    let contentTypes: Record<string, ContentTypeConfig> = await strapi
      .plugin('deep-copy')
      .config('contentTypes')

    // Filter content types that are not enabled
    contentTypes = Object.fromEntries(
      Object.entries(contentTypes).filter(([, contentTypeConfig]) => contentTypeConfig.enabled),
    )

    // Set unique fields
    contentTypes = Object.fromEntries(
      await Promise.all(
        Object.entries(contentTypes).map(async ([contentType, contentTypeConfig]) => {
          const model = { ...(await strapi.getModel(contentType)) } // Explicit copy, make sure we get the correct model on every iteration
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
        }),
      ),
    )

    return contentTypes
  },

  async getInitialValues({ contentType, id }: { contentType: string; id: string }) {
    const contentTypes = await strapi.plugin('deep-copy').service('config').getContentTypes()
    const populate = populateObject(contentType)
    const entity = await strapi.entityService.findOne(contentType, id, { populate })

    const currentData = { ...entity }

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
    id,
    field,
    data,
  }: {
    contentType: string
    id: string
    field: string
    data: Record<string, string>
  }) {
    const contentTypes = await strapi.plugin('deep-copy').service('config').getContentTypes()
    const populate = populateObject(contentType)
    const entity = await strapi.entityService.findOne(contentType, id, { populate })

    const currentData = { ...entity, ...data }

    const { editableFields } = contentTypes[contentType]
    return Object.fromEntries([[field, editableFields[field].fillButton.value(currentData)]])
  },
})
