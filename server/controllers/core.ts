import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async deepCopy(ctx) {
    const body = ctx.request.body
    ctx.body = await strapi
      .plugin('deep-copy')
      .service('core')
      .copy({ publish: true, ...body });
  },
});
