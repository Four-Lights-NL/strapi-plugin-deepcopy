import { Strapi } from '@strapi/strapi'
import type { Context } from 'koa'

export default ({ strapi }: { strapi: Strapi }) => ({
  async copy(ctx: Context) {
    const { body } = ctx.request
    ctx.body = await strapi
      .plugin('deep-copy')
      .service('deepCopy')
      .copy({ publish: true, ...body })
  },
})
