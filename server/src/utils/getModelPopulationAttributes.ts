import type { Schema, UID } from "@strapi/strapi"

type ContentTypeSchema<TSchemaUID> = TSchemaUID extends UID.ContentType
  ? Schema.ContentType<TSchemaUID>
  : TSchemaUID extends UID.Component
    ? Schema.Component<TSchemaUID>
    : never
export function getModelPopulationAttributes<TSchemaUid>(modelUid: TSchemaUid, model: ContentTypeSchema<TSchemaUid>) {
  if (modelUid === "plugin::upload.file") {
    const { related, ...attributes } = model.attributes
    return attributes
  }

  return model.attributes
}
