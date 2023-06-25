import { Strapi } from '@strapi/strapi'

import { populateObject, prepareForCopy, uniqueCopyName } from '../utils'

export default ({ strapi }: { strapi: Strapi }) => ({
  async copy({
    contentType,
    id,
    publish,
    ...uniqueFields
  }: {
    contentType: string
    id: string
    publish: boolean
    uniqueFields: Record<string, string>
  }) {
    const populate = populateObject(contentType)
    const sourceEntity = await strapi.entityService.findOne(contentType, id, { populate })
    const targetEntity = { ...sourceEntity, ...uniqueFields }

    const contentTypes = await strapi.plugin('deep-copy').service('config').getContentTypes()
    const mutations = await prepareForCopy(
      contentType,
      targetEntity,
      uniqueCopyName(`${contentType}.${id}`),
      contentTypes,
    )

    const idMap: Record<string, string> = {} // Keeps track of newly created id's
    const results = []

    try {
      for (let index = 0; index < mutations.length; index += 1) {
        const { contentType: rowContentType, data, model, placeholder } = mutations[index]

        // Replace forward declared id with resolved id
        Object.entries(model.attributes ?? {})
          .filter(
            ([, attr]: [string, any]) =>
              attr.type === 'relation' && Object.keys(contentTypes).includes(attr.target),
          )
          .map(([key]) => {
            if (data[key] && data[key].connect)
              data[key].connect = data[key].connect.map((c: string) => idMap[c])
            return true
          })

        if (publish) data.publishedAt = Date.now()
        strapi.log.debug(`Creating ${rowContentType} ${placeholder}`)
        // eslint-disable-next-line no-await-in-loop
        const entity = await strapi.entityService.create(rowContentType, { data })
        idMap[placeholder] = entity.id
        if (entity) {
          strapi.log.info(`Created ${rowContentType} ${placeholder}`)
          entity.contentType = rowContentType
          results.push(entity)
        } else {
          strapi.log.error(`Failed to create ${rowContentType} ${placeholder}`)
        }
      }
    } catch (e) {
      strapi.log.error('Failed to create new entities')

      for (let i = 0; i < e.details.errors.length; i += 1) {
        const error = e.details.errors[i]
        strapi.log.error(`${error.name} [${error.path}] => ${error.message}`)
      }

      // Something went wrong when trying to create new entities
      // Rollback created entities
      for (let index = results.length - 1; index >= 0; index -= 1) {
        const entity = results[index]
        strapi.log.info(`Rolling back ${entity.contentType} ${entity.id}`)
        // eslint-disable-next-line no-await-in-loop
        await strapi.entityService.delete(entity.contentType, entity.id)
      }
      return { errors: e.details.errors }
    }

    return results[results.length - 1] // last one will be the source
  },
})
