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
            title: {
              initialValue: (strapi, src, name) => `${src[name]} (Copy)`,
            },
            slug: {
              initialValue: (strapi, src, name) => `${src[name]}-copy`,
              fillButton: {
                label: 'Set from title',
                value: (data) => slugify(data.title, { lower: true, strict: true })
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
