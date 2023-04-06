import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async deepCopy(ctx) {
    const body = ctx.request.body
    ctx.body = await strapi
      .plugin('deep-copy')
      .service('core')
      .copy({ publish: true, ...body });
  },
  async getContentTypes(ctx) {
    try {
      const plugin = await strapi.plugin('deep-copy');
      ctx.body = { contentTypes: plugin.config('contentTypes') }
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});
