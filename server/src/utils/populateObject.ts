import type { Data, UID } from "@strapi/strapi"
import { getFullPopulateObject } from "./getFullPopulateObject"

export default async function populateObject<TContentType extends UID.ContentType>(
  contentType: TContentType,
  documentId: string,
) {
  const document = (await strapi
    .documents(contentType)
    .findOne({ documentId, populate: "*" })) as unknown as Data.Entity<TContentType>
  const fullPopulateObject = await getFullPopulateObject(contentType, document, true)

  if (fullPopulateObject === true) return {}
  return fullPopulateObject.populate
}
