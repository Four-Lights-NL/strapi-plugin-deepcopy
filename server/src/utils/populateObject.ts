import type { UID } from "@strapi/strapi"
import { getFullPopulateObject } from "./getFullPopulateObject"

export default function populateObject<TContentType extends UID.Schema>(contentType: TContentType) {
  // FIXME: Recursion should be on-demand
  const fullPopulateObject = getFullPopulateObject(contentType, 5, true)
  if (fullPopulateObject === true) return {}
  return fullPopulateObject.populate
}
