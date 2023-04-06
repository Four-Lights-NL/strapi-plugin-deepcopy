import { getFullPopulateObject } from 'strapi-plugin-populate-deep/server/helpers'

export default function populateObject(contentType: string) {
    // NOTE: We use `strapi-plugin-populate-deep` to retrieve all nested entities
    // However, it would be annoying if was a requirement to setup this plugin in your strapi instance,
    // just so that our plugin works as it should.
    const { populate } = getFullPopulateObject(contentType, 10)
    return populate
}
