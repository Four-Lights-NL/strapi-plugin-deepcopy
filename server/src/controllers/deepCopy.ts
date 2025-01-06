import type { Core } from "@strapi/strapi"
import type { Context } from "koa"

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async copy(ctx: Context) {
    const {
      params,
      request: { body },
    } = ctx
    ctx.body = await strapi
      .plugin("deep-copy")
      .service("deepCopy")
      .copy({ documentId: params.documentId, publish: true, ...body }) // NOTE: Default to publish true unless overridden by request body
  },
})
