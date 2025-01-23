import type { Data, UID } from "@strapi/strapi"
import type { Schema } from "@strapi/types"
import { klona } from "klona/json"
import type { ContentTypeConfig, UniqueFields } from "strapi-plugin-deepcopy/config"

const prepareForCopy = async (
  contentType: UID.Schema,
  data: object | object[],
  placeholder: string,
  contentTypes: Record<UID.Schema, ContentTypeConfig>,
) => {
  if (!data) return []

  const config = contentTypes[contentType]

  // Create a copy of data that we can modify
  const newData: object | object[] = Array.isArray(data) ? [...data] : klona(data)

  const emptyFields = {
    id: undefined,
    documentId: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    status: undefined,
  }
  let prepared: Array<{
    contentType: UID.Schema
    data: object | object[]
    model: ReturnType<typeof strapi.getModel>
    placeholder: string
  }> = []

  // Get model for this contentType
  const model = klona(strapi.getModel(contentType)) // NOTE: Explicit copy, so get the correct model on every iteration

  // Set all unique properties to their values
  if (config) {
    const uniqueFields = Object.entries(config.uniqueFields ?? {})
      .filter(
        ([name]: [string, UniqueFields]) =>
          // Field marked as unique which are not set as editable field
          config.editableFields[name] === undefined,
      )
      .map(([name]) => name)

    for (let i = 0; i < uniqueFields.length; i += 1) {
      const name = uniqueFields[i]
      newData[name] = config.uniqueFields[name].value(strapi, newData as never, name)
    }
  }

  // Set all relations which are marked as non-copy to point to the original relation target
  {
    const nonCopyFields = Object.entries(model.attributes ?? {})
      .filter(([, attr]) => attr.type === "relation")
      .filter(
        ([name, attr]: [string, Schema.Attribute.RelationWithTarget]) =>
          !Object.keys(contentTypes).includes(attr.target) && // is not defined as copyable
          newData[name], // is actually set in the data
      )

    for (let i = 0; i < nonCopyFields.length; i += 1) {
      const [name, attr] = nonCopyFields[i]

      // NOTE: Strapi seems to have trouble with the documentId in some instances
      // so we use the `id` field instead. I expect this break at some point in the future.
      newData[name] =
        attr.type === "relation" && attr.relation === "oneToMany"
          ? [newData[name].map((s: Data.Entity) => s.id)]
          : newData[name].id
    }
  }

  // Handle media links
  {
    const mediaFields = Object.entries(model.attributes ?? {})
      .filter(([name, attr]) => attr.type === "media" && newData[name])
      .map(([name]) => name)
    for (let i = 0; i < mediaFields.length; i += 1) {
      const name = mediaFields[i]
      newData[name] = newData[name].id
    }
  }

  // Handle dynamic zones
  {
    const dynamicZoneFields = Object.entries(model.attributes ?? {})
      .filter(([name, attr]) => attr.type === "dynamiczone" && newData[name])
      .map(([name]) => name)
    for (let i = 0; i < dynamicZoneFields.length; i += 1) {
      const name = dynamicZoneFields[i]
      newData[name] = newData[name].map((block) => ({
        ...block,
        ...emptyFields,
      }))
    }
  }

  // Handle components recursively
  {
    const components = (
      await Promise.all(
        Object.entries(model.attributes ?? {})
          .filter(([, attr]) => attr.type === "component") // only component types
          .filter(([name]) => newData[name] !== null) // with data set
          .map(async ([name, attr]: [string, Schema.Attribute.Component<UID.Component, boolean>]) => {
            if (attr.repeatable === true && newData[name]?.length === 0) return undefined

            const ret = await prepareForCopy(
              attr.component as UID.Component,
              newData[name],
              `${placeholder}.${name}`,
              contentTypes,
            )

            newData[name] = ret[ret.length - 1]?.data ?? {} // actual component is always the last in the array
            return ret.slice(0, -1) // all other items are forward declared placeholders that need to be created later on
          }),
      )
    ).flat(1)
    prepared = prepared.concat(...components)
  }

  // Filter model attributes to only include copy contentTypes
  model.attributes = Object.fromEntries(
    Object.entries(model.attributes ?? {})
      .filter(([, attr]) => attr.type === "relation")
      .filter(([, attr]: [string, Schema.Attribute.RelationWithTarget]) =>
        Object.keys(contentTypes).includes(attr.target),
      ),
  )

  // Handle copyable oneToOne relations recursively
  {
    const oneToOne = (
      await Promise.all(
        Object.entries(model.attributes ?? {})
          .filter(([, attr]) => attr.type === "relation" && attr.relation === "oneToOne")
          .map(async ([name, attr]: [string, Schema.Attribute.RelationWithTarget]) => {
            if (newData[name] === null || newData[name] === undefined) return undefined

            const nestedPlaceholder = `${placeholder}.${name}`
            const ret = await prepareForCopy(attr.target, newData[name], nestedPlaceholder, contentTypes)

            if (newData[name].connect === undefined) newData[name] = { connect: [] }
            newData[name].connect.push(nestedPlaceholder)

            return ret // Return all
          }),
      )
    ).flat(1)

    prepared = prepared.concat(...oneToOne)
  }

  // Handle copyable oneToMany relations recursively
  {
    const oneToMany = (
      await Promise.all(
        Object.entries(model.attributes ?? {})
          .filter(([, attr]) => attr.type === "relation" && attr.relation === "oneToMany")
          .map(async ([name, attr]: [string, Schema.Attribute.RelationWithTarget]) => {
            if (newData[name] === null || newData[name] === undefined) return undefined

            const nestedPlaceholderPrefix = `${placeholder}.${name}`
            const nestedPlaceholderPaths = newData[name].map((_, index) => `${nestedPlaceholderPrefix}.${index + 1}`)

            const ret = await Promise.all(
              newData[name].flatMap(async (row, index) =>
                prepareForCopy(attr.target, row, `${nestedPlaceholderPrefix}.${index + 1}`, contentTypes),
              ),
            )

            if (newData[name].connect === undefined) newData[name] = { connect: [] }
            newData[name].connect.push(...nestedPlaceholderPaths)

            return ret // Return all
          }),
      )
    ).flat(1)

    prepared = prepared.concat(...oneToMany)
  }

  // Build queue
  prepared.push({
    contentType,
    model,
    data: Array.isArray(newData) ? newData.map((d) => ({ ...d, ...emptyFields })) : { ...newData, ...emptyFields },
    placeholder,
  })

  return prepared.filter((p) => p)
}
export default prepareForCopy
