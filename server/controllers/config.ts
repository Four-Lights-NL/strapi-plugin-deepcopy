import { Strapi } from '@strapi/strapi'
import type { Context } from 'koa'

export default ({ strapi }: { strapi: Strapi }) => ({
  async getContentTypes(ctx: Context) {
    ctx.body = await strapi.plugin('deep-copy').service('config').getContentTypes()
  },
  async getInitialValues(ctx: Context) {
    const { params } = ctx.request
    ctx.body = await strapi.plugin('deep-copy').service('config').getInitialValues(params)
  },
  async getFillValue(ctx: Context) {
    const { params, body } = ctx.request
    ctx.body = await strapi
      .plugin('deep-copy')
      .service('config')
      .getFillValue({ ...params, data: body })
  },
})
