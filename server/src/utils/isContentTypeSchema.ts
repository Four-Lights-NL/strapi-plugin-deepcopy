import type { Schema } from "@strapi/strapi"

function isContentTypeSchema(schema: Schema.Schema): schema is Schema.ContentType {
  return schema.modelType === "contentType"
}

export default isContentTypeSchema
