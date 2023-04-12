import { Strapi } from '@strapi/strapi'

export default ({ strapi }: { strapi: Strapi }) => ({
  async deepCopy(ctx: any) {
    const { body } = ctx.request
    ctx.body = await strapi
      .plugin('deep-copy')
      .service('core')
      .copy({ publish: true, ...body })
  },
  async getContentTypes(ctx: any) {
    try {
      const plugin = await strapi.plugin('deep-copy')
      ctx.body = { contentTypes: plugin.config('contentTypes') }
    } catch (err) {
      ctx.throw(500, err)
    }
  },
})
