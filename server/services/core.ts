import { Strapi } from '@strapi/strapi';

import slugify from "slugify";
import prepareForCopy from "../utils/prepareForCopy";

export default ({ strapi }: { strapi: Strapi }) => ({
  async copy({ contentType, id, title, internalId, publish }) {
    const slug = slugify(title).toLowerCase()

    // NOTE: We use `deep` which depends on `strapi-plugin-populate-deep`
    const sourcePage = await strapi.entityService.findOne(contentType, id, { populate: "deep" })
    sourcePage.title = title
    sourcePage.slug = slug

    const mutations = await prepareForCopy(contentType, sourcePage, internalId)

    const idMap = {}  // Keeps track of newly created id's
    const results = []

    try {
      for (let index = 0; index < mutations.length; index++) {
        const { contentType, data, model, name } = mutations[index]

        // Replace forward declared id with resolved id
        Object.entries(model.attributes ?? {})
          .filter(([name, attr]: [string, any]) => attr.type === 'relation')
          .map(([name]) => {
            if (data[name] && data[name].connect)
              data[name].connect = data[name].connect.map((c) => idMap[c])
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
