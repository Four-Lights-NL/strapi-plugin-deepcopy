import type { Config, ContentTypeConfig } from "strapi-plugin-deepcopy/config"
import uniqueCopyName from "../utils/uniqueCopyName"

export default {
  default: {
    contentTypes: {},
    defaultUniqueFieldsValue: (strapi, src, name) => uniqueCopyName(src[name]),
  } as Config,
  validator: (config) => {
    if (typeof config !== "object") {
      throw new Error("config has to be an object")
    }

    if (typeof config.defaultUniqueFieldsValue !== "function") {
      throw new Error("defaultUniqueFieldsValue has to be a function")
    }

    if (typeof config.contentTypes !== "object") {
      throw new Error("contentTypes has to be an object")
    }

    if (config.contentTypes.length === 0) {
      throw new Error("contentTypes has to contain at least one content-type")
    }

    for (let i = 0; i < Object.entries(config.contentTypes).length; i += 1) {
      const [contentType, contentTypeConfig] = Object.entries(config.contentTypes)[i]
      if (typeof contentTypeConfig === "boolean") {
        throw new Error(
          `contentTypes.${contentType} is a boolean value, please update your config to use the new format: \n{ "${contentType}": { enabled: true } }`,
        )
      }

      if (typeof contentTypeConfig !== "object") {
        throw new Error(`contentTypes.${contentType} has to be an object`)
      }

      const { editableFields, uniqueFields } = contentTypeConfig as unknown as ContentTypeConfig
      if (editableFields) {
        for (let j = 0; i < Object.entries(editableFields).length; i += 1) {
          const [fieldName, editableField] = Object.entries(editableFields)[j]

          if (typeof editableField !== "object") {
            throw new Error(`contentTypes.${contentType}.editableFields.${fieldName} has to be an object`)
          }

          if (typeof editableField.initialValue !== "function") {
            throw new Error(`contentTypes.${contentType}.editableFields.${fieldName}.initialValue has to be a function`)
          }
        }
      }

      if (uniqueFields) {
        for (let j = 0; i < Object.entries(uniqueFields).length; i += 1) {
          const [fieldName, editableField] = Object.entries(uniqueFields)[j]

          if (typeof editableField !== "object") {
            throw new Error(`contentTypes.${contentType}.uniqueFields.${fieldName} has to be an object`)
          }

          if (typeof editableField.value !== "function") {
            throw new Error(`contentTypes.${contentType}.uniqueFields.${fieldName}.value has to be a function`)
          }
        }
      }

      if (editableFields && uniqueFields) {
        const editableFieldNames = Object.keys(editableFields)
        const uniqueFieldNames = Object.keys(uniqueFields)
        const intersection = editableFieldNames.filter((fieldName) => uniqueFieldNames.includes(fieldName))
        if (intersection.length > 0) {
          throw new Error(
            `${intersection.join(
              ",",
            )} are defined in both editableFields and uniqueFields of contentTypes.${contentType}. Please make sure each field is only defined once.`,
          )
        }
      }
    }
  },
}
