import { Strapi } from '@strapi/strapi'
import slugify from 'slugify'

import { populateObject, prepareForCopy } from '../utils'

export default ({ strapi }: { strapi: Strapi }) => ({
  async copy({
    contentType,
    id,
    title,
    internalId,
    publish,
  }: {
    contentType: string
    id: string
    title: string
    internalId: string
    publish: boolean
  }) {
    const slug = slugify(title).toLowerCase()

    const populate = populateObject(contentType)
    const sourcePage = await strapi.entityService.findOne(contentType, id, { populate })
    sourcePage.title = title
    sourcePage.slug = slug

    const excludeFromCopy = await strapi.plugin('deep-copy').config('excludeFromCopy')
    const mutations = await prepareForCopy(contentType, sourcePage, internalId, excludeFromCopy)

    const idMap: Record<string, string> = {} // Keeps track of newly created id's
    const results = []

    try {
      for (let index = 0; index < mutations.length; index += 1) {
        const { contentType: rowContentType, data, model, name } = mutations[index]

        // Replace forward declared id with resolved id
        Object.entries(model.attributes ?? {})
          .filter(
            ([, attr]: [string, any]) =>
              attr.type === 'relation' && !excludeFromCopy.includes(attr.target),
          )
          .map(([key]) => {
            if (data[key] && data[key].connect)
              data[key].connect = data[key].connect.map((c: string) => idMap[c])
            return true
          })

        if (publish) data.publishedAt = Date.now()
        // eslint-disable-next-line no-await-in-loop
        const entity = await strapi.entityService.create(rowContentType, { data })
        idMap[name] = entity.id
        results.push(entity)
      }
    } catch (e) {
      // Something went wrong when trying to create new entities
      // Rollback created entities
      for (let index = 0; index < results.length; index += 1) {
        const entity = results[index]
        // eslint-disable-next-line no-await-in-loop
        await strapi.entityService.delete(entity.contentType, entity.id)
      }
      return { error: e }
    }

    return results[results.length - 1] // last one will be the source
  },
})
