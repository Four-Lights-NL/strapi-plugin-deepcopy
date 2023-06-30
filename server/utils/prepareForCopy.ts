import { ContentTypeConfig, UniqueFields } from 'strapi-plugin-deepcopy/config'

const prepareForCopy = async (
  contentType: string,
  data: object | object[],
  placeholder: string,
  contentTypes: Record<string, ContentTypeConfig>,
) => {
  if (!data) return []

  const config = contentTypes[contentType]

  // Create a copy of data that we can modify
  const newData: object | object[] = Array.isArray(data) ? [...data] : { ...data }

  const emptyFields = {
    id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    publishedAt: undefined,
  }
  let prepared: Array<{ contentType: string; data: any; model: any; placeholder: string }> = []

  // Get model for this contentType
  const model = { ...(await strapi.getModel(contentType)) } // NOTE: Explicit copy, so get the correct model on every iteration

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
    const nonCopyFields = Object.entries(model.attributes ?? {}).filter(
      ([name, attr]: [string, any]) =>
        attr.type === 'relation' && // is of type relation
        !Object.keys(contentTypes).includes(attr.target) && // is not defined as copyable
        newData[name], // is actually set in the data
    )

    for (let i = 0; i < nonCopyFields.length; i += 1) {
      const [name, attr] = nonCopyFields[i]
      newData[name] =
        (attr as any).relation === 'oneToMany' ? newData[name].map((s) => s.id) : newData[name].id
    }
  }

  // Handle media links
  {
    const mediaFields = Object.entries(model.attributes ?? {})
      .filter(([name, attr]: [string, any]) => attr.type === 'media' && newData[name])
      .map(([name]) => name)
    for (let i = 0; i < mediaFields.length; i += 1) {
      const name = mediaFields[i]
      newData[name] = newData[name].id
    }
  }

  // Handle dynamic zones
  {
    const dynamicZoneFields = Object.entries(model.attributes ?? {})
      .filter(([name, attr]: [string, any]) => attr.type === 'dynamiczone' && newData[name])
      .map(([name]) => name)
    for (let i = 0; i < dynamicZoneFields.length; i += 1) {
      const name = dynamicZoneFields[i]
      newData[name] = newData[name].map((block: any) => ({ ...block, ...emptyFields }))
    }
  }

  // Handle components recursively
  {
    const components = (
      await Promise.all(
        Object.entries(model.attributes ?? {})
          .filter(([, attr]: [string, any]) => attr.type === 'component') // only component types
          .filter(([name]) => newData[name] !== null) // with data set
          .map(async ([name, attr]: [string, any]) => {
            if (attr.repeatable === true && newData[name]?.length === 0) return undefined

            const ret = await prepareForCopy(
              attr.component,
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
    Object.entries(model.attributes ?? {}).filter(([, attr]: [string, any]) =>
      Object.keys(contentTypes).includes(attr.target),
    ),
  )

  // Handle copyable oneToOne relations recursively
  {
    const oneToOne = (
      await Promise.all(
        Object.entries(model.attributes ?? {})
          .filter(
            ([, attr]: [string, any]) => attr.type === 'relation' && attr.relation === 'oneToOne',
          )
          .map(async ([name, attr]: [string, any]) => {
            if (newData[name] === null || newData[name] === undefined) return undefined

            const nestedPlaceholder = `${placeholder}.${name}`
            const ret = await prepareForCopy(
              attr.target,
              newData[name],
              nestedPlaceholder,
              contentTypes,
            )

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
          .filter(
            ([, attr]: [string, any]) => attr.type === 'relation' && attr.relation === 'oneToMany',
          )
          .map(async ([name, attr]: [string, any]) => {
            if (newData[name] === null || newData[name] === undefined) return undefined

            const nestedPlaceholderPrefix = `${placeholder}.${name}`
            const nestedPlaceholderPaths = newData[name].map(
              (row, index) => `${nestedPlaceholderPrefix}.${index + 1}`,
            )

            const ret = await Promise.all(
              newData[name].flatMap(async (row: any, index: number) =>
                prepareForCopy(
                  attr.target,
                  row,
                  `${nestedPlaceholderPrefix}.${index + 1}`,
                  contentTypes,
                ),
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
    data: Array.isArray(newData)
      ? newData.map((d) => ({ ...d, ...emptyFields }))
      : { ...newData, ...emptyFields },
    placeholder,
  })

  return prepared.filter((p) => p)
}
export default prepareForCopy
