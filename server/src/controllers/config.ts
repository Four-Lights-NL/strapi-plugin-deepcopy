import type { Core } from "@strapi/strapi"
import type { Context } from "koa"

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getContentTypes(ctx: Context) {
    ctx.body = await strapi.plugin("deep-copy").service("config").getContentTypes()
  },
  async getInitialValues(ctx: Context) {
    const { params } = ctx
    ctx.body = await strapi.plugin("deep-copy").service("config").getInitialValues(params)
  },
  async getFillValue(ctx: Context) {
    const {
      params,
      request: { body },
    } = ctx
    ctx.body = await strapi
      .plugin("deep-copy")
      .service("config")
      .getFillValue({ ...params, data: body })
  },
  async getCopyTree(ctx: Context) {
    const { params } = ctx
    ctx.body = await strapi
      .plugin("deep-copy")
      .service("config")
      .getCopyTree({ documentId: params.documentId, contentType: params.contentType })
  },
})
