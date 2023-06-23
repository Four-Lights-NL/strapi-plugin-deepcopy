import slugify from "slugify";

export default ({ env }) => ({
  'deep-copy': {
    enabled: true,
    config: {
      contentTypes: {
        'api::page.page': {
          enabled: true,
          showButtonInAdmin: true,
          editableFields: {
            slug: {
              initialValue: (strapi, src) => `${src.slug}-copy`,
              fillButton: {
                label: 'Set from title',
                value: (data) => slugify(data.title)
              }
            }
          }
        },
        'api::section.section': {
          enabled: true,
          showButtonInAdmin: false,
        }
      },
    },
  },
})
