import type { Core, Data, Schema, UID } from "@strapi/strapi"

import type { ContentTypeConfig } from "strapi-plugin-deepcopy/config"
import isContentTypeSchema from "../utils/isContentTypeSchema"
import type prepareForCopy from "../utils/prepareForCopy"

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async copy({
    contentType,
    documentId,
    publish,
    ...uniqueFields
  }: {
    contentType: UID.ContentType
    documentId: string
    publish: boolean
    uniqueFields: Record<string, string>
  }) {
    const {
      contentTypes,
      mutations,
    }: {
      contentTypes: Record<UID.ContentType, ContentTypeConfig>
      mutations: UnwrapPromise<ReturnType<typeof prepareForCopy>>
    } = await strapi
      .plugin("deep-copy")
      .service("config")
      .getCopyTree({ contentType, documentId, ...uniqueFields })

    const idMap: Record<string, string> = {} // Keeps track of newly created id's
    const results: Data.Entity[] = []

    try {
      for (let index = 0; index < mutations.length; index += 1) {
        const { contentType: rowContentType, data, model, placeholder } = mutations[index]

        // Replace forward declared id with resolved id
        Object.entries(model.attributes ?? {})
          .filter(([, attr]) => attr.type === "relation")
          .filter(([, attr]: [string, Schema.Attribute.RelationWithTarget]) =>
            Object.keys(contentTypes).includes(attr.target),
          )
          .map(([key]) => {
            if (data[key]?.connect) data[key].connect = data[key].connect.map((c: string) => idMap[c])
            return true
          })

        if (!isContentTypeSchema(model)) {
          strapi.log.debug(`Skipping component ${rowContentType} ${placeholder}`)
        }

        strapi.log.debug(`Creating ${rowContentType} ${placeholder}`)
        // eslint-disable-next-line no-await-in-loop
        const entity = await strapi.documents(rowContentType as UID.ContentType).create({
          data,
          // FIXME: Create as draft, then update in batch to published status if requested
          status: publish ? "published" : "draft",
        })
        idMap[placeholder] = entity.documentId
        if (entity) {
          strapi.log.info(`Created ${rowContentType} ${placeholder}`)
          entity.contentType = rowContentType
          results.push(entity)
        } else {
          strapi.log.error(`Failed to create ${rowContentType} ${placeholder}`)
        }
      }
    } catch (e) {
      strapi.log.error("Failed to create new entities")

      for (let i = 0; i < e.details.errors.length; i += 1) {
        const error = e.details.errors[i]
        strapi.log.error(`${error.name} [${error.path}] => ${error.message}`)
      }

      // Something went wrong when trying to create new entities
      // Rollback created entities
      for (let index = results.length - 1; index >= 0; index -= 1) {
        const entity = results[index]
        strapi.log.info(`Rolling back ${entity.contentType} ${entity.documentId}`)
        // eslint-disable-next-line no-await-in-loop
        await strapi.documents(entity.contentType).delete({
          documentId: entity.documentId,
        })
      }
      return { errors: e.details.errors }
    }

    return results[results.length - 1] // last one will be the source
  },
})
