/* eslint-disable import/prefer-default-export */
declare module 'strapi-plugin-populate-deep/server/helpers' {
  export function getFullPopulateObject(modelUid: string, maxDepth?: number): { populate: object }
}
