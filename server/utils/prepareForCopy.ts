const prepareForCopy = async (
  contentType: string,
  data: any,
  namePrefix: string,
  excludeFromCopy: string[],
) => {
  if (!data) return []

  // Create a copy of data that we can modify
  const newData = { ...data }

  const emptyFields = {
    id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    publishedAt: undefined,
  }
  let prepared: Array<{ contentType: string; data: any; model: any; name: string }> = []

  // Get model for this contentType
  const model = { ...(await strapi.getModel(contentType)) } // Explicit copy, make sure we get the correct model on every iteration

  // Handle explicitly excluded relations
  Object.entries(model.attributes ?? {})
    .filter(([name, attr]: [string, any]) => excludeFromCopy.includes(attr.target) && newData[name])
    // eslint-disable-next-line no-return-assign
    .map(([name]) => (newData[name] = newData[name].id))
  model.attributes = Object.fromEntries(
    Object.entries(model.attributes ?? {}).filter(
      ([, attr]: [string, any]) => !excludeFromCopy.includes(attr.target),
    ),
  )

  // Handle media links
  Object.entries(model.attributes ?? {})
    .filter(([name, attr]: [string, any]) => attr.type === 'media' && newData[name])
    // eslint-disable-next-line no-return-assign
    .map(([name]) => (newData[name] = newData[name].id))

  // Handle dynamic zones
  Object.entries(model.attributes ?? {})
    .filter(([name, attr]: [string, any]) => attr.type === 'dynamiczone' && newData[name])
    .map(
      // eslint-disable-next-line no-return-assign
      ([name]) =>
        (newData[name] = newData[name].map((block: any) => ({ ...block, ...emptyFields }))),
    )

  // Handle components
  const components = (
    await Promise.all(
      Object.entries(model.attributes ?? {})
        .filter(([, attr]: [string, any]) => attr.type === 'component') // filter on component
        .map(async ([name, attr]: [string, any]) => {
          if (attr.repeatable === true && newData[name].length === 0) return undefined
          const ret = await prepareForCopy(
            attr.component,
            newData[name],
            `${namePrefix}.${name}`,
            excludeFromCopy,
          )
          newData[name] = (ret[ret.length - 1] as any).data // Set last as inline
          return ret.slice(0, ret.length - 1) // Return all but last
        }),
    )
  ).flat(1)
  prepared = prepared.concat(...components)

  // Handle oneToOne relations
  const oneToOne = (
    await Promise.all(
      Object.entries(model.attributes ?? {})
        .filter(
          ([, attr]: [string, any]) => attr.type === 'relation' && attr.relation === 'oneToOne',
        )
        .map(async ([name, attr]: [string, any]) => {
          if (newData[name] === null || newData[name] === undefined) return undefined

          const newName = `${namePrefix}.${name}`
          const ret = await prepareForCopy(attr.target, newData[name], newName, excludeFromCopy)

          if (newData[name].connect === undefined) newData[name] = { connect: [] }
          newData[name].connect.push(newName)

          return ret // Return all
        }),
    )
  ).flat(1)
  prepared = prepared.concat(...oneToOne)

  // Handle oneToMany relations
  const oneToMany = (
    await Promise.all(
      Object.entries(model.attributes ?? {})
        .filter(
          ([, attr]: [string, any]) => attr.type === 'relation' && attr.relation === 'oneToMany',
        )
        .map(async ([name, attr]: [string, any]) => {
          if (newData[name] === null || newData[name] === undefined) return undefined

          const newName = `${namePrefix}.${name}`
          const newNames = newData[name].map((row, index) => `${newName}.${index + 1}`)

          const ret = await Promise.all(
            newData[name].flatMap(async (row: any, index: number) =>
              prepareForCopy(attr.target, row, `${newName}.${index + 1}`, excludeFromCopy),
            ),
          )

          if (newData[name].connect === undefined) newData[name] = { connect: [] }
          newData[name].connect.push(...newNames)

          return ret // Return all
        }),
    )
  ).flat(1)
  prepared = prepared.concat(...oneToMany)

  // Add top-most level as last
  if ('name' in model.attributes) {
    newData.name = namePrefix
  }
  prepared.push({ contentType, model, data: { ...newData, ...emptyFields }, name: namePrefix })
  return prepared.filter((p) => p)
}
export default prepareForCopy
