const prepareForCopy = async (
  contentType: string,
  data: any,
  namePrefix: string,
  excludeFromCopy: string[],
) => {
  if (!data) return []

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
    .filter(([name, attr]: [string, any]) => excludeFromCopy.includes(attr.target) && data[name])
    .map(([name]) => (data[name] = data[name].id))
  model.attributes = Object.fromEntries(
    Object.entries(model.attributes ?? {}).filter(
      ([, attr]: [string, any]) => !excludeFromCopy.includes(attr.target),
    ),
  )

  // Handle media links
  Object.entries(model.attributes ?? {})
    .filter(([name, attr]: [string, any]) => attr.type === 'media' && data[name])
    .map(([name]) => (data[name] = data[name].id))

  // Handle dynamic zones
  Object.entries(model.attributes ?? {})
    .filter(([name, attr]: [string, any]) => attr.type === 'dynamiczone' && data[name])
    .map(([name]) => (data[name] = data[name].map((block) => ({ ...block, ...emptyFields }))))

  // Handle components
  const components = (
    await Promise.all(
      Object.entries(model.attributes ?? {})
        .filter(([, attr]: [string, any]) => attr.type === 'component') // filter on component
        .map(async ([name, attr]: [string, any]) => {
          if (attr.repeatable === true && data[name].length === 0) return
          const ret = await prepareForCopy(
            attr.component,
            data[name],
            `${namePrefix}.${name}`,
            excludeFromCopy,
          )
          data[name] = (ret[ret.length - 1] as any).data // Set last as inline
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
          if (data[name] === null || data[name] === undefined) return

          const newName = `${namePrefix}.${name}`
          const ret = await prepareForCopy(attr.target, data[name], newName, excludeFromCopy)

          if (data[name].connect === undefined) data[name] = { connect: [] }
          data[name].connect.push(newName)

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
          if (data[name] === null || data[name] === undefined) return

          const newName = `${namePrefix}.${name}`
          const newNames = data[name].map((row, index) => `${newName}.${index + 1}`)

          const ret = await Promise.all(
            data[name].flatMap(async (row: any, index: number) =>
              prepareForCopy(attr.target, row, `${newName}.${index + 1}`, excludeFromCopy),
            ),
          )

          if (data[name].connect === undefined) data[name] = { connect: [] }
          data[name].connect.push(...newNames)

          return ret // Return all
        }),
    )
  ).flat(1)
  prepared = prepared.concat(...oneToMany)

  // Add top-most level as last
  if ('name' in model.attributes) {
    data.name = namePrefix
  }
  prepared.push({ contentType, model, data: { ...data, ...emptyFields }, name: namePrefix })
  return prepared.filter((p) => p)
}
export default prepareForCopy
