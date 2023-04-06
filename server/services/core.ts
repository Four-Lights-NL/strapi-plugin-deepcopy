import { Strapi } from '@strapi/strapi';

import slugify from "slugify";
import { prepareForCopy, populateObject } from "../utils"
import DeepCopyConfig from "../config/config.interface";

export default ({ strapi }: { strapi: Strapi }) => ({
  async copy({ contentType, id, title, internalId, publish }) {
    const slug = slugify(title).toLowerCase()

    const populate = populateObject(contentType)
    const sourcePage = await strapi.entityService.findOne(contentType, id, { populate })
    sourcePage.title = title
    sourcePage.slug = slug

    const excludeFromCopy = await strapi.plugin('deep-copy').config('excludeFromCopy')
    const mutations = await prepareForCopy(contentType, sourcePage, internalId, excludeFromCopy)

    const idMap: Record<string, string> = {}  // Keeps track of newly created id's
    const results = []

    try {
      for (let index = 0; index < mutations.length; index++) {
        const { contentType, data, model, name } = mutations[index]

        // Replace forward declared id with resolved id
        Object.entries(model.attributes ?? {})
          .filter(([, attr]: [string, any]) => attr.type === 'relation' && !excludeFromCopy.includes(attr.target))
          .map(([name]) => {
            if (data[name] && data[name].connect)
              data[name].connect = data[name].connect.map((c: string) => idMap[c])
          })

        if (publish) data.publishedAt = Date.now()
        const entity = await strapi.entityService.create(contentType, { data })
        idMap[name] = entity.id
        results.push(entity)
      }
    } catch (e) {
      // Something went wrong
      // Rollback created entities
      for (let index = 0; index < results.length; index++) {
        const entity = results[index]
        await strapi.entityService.delete(entity.contentType, entity.id)
      }
      return { error: e }
    }

    return results[results.length - 1]  // last one will be the source
  },
});
