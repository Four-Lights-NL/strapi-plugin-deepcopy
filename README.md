# Strapi plugin deep-copy

The default behaviour in Strapi is to create a shallow copy when duplicating an entity.
This means that any relations are lost and have to be duplicated seperately and connected manually to the newly created entities.

This plugin provides a custom `copy` action when viewing an entity in the Strapi admin which clones the entity and all it's related models, and connects the newly created entities in the same way as the original.

The plugin is currently in a beta state: it's working, but the configuration is not yet where I want it to be for it to be released as stable.

## Screenshot

![image](https://user-images.githubusercontent.com/112890430/231699202-730b2366-12e9-443f-88bc-f83cae829ce3.png)

## Usage

Install using your favourite package manager

```bash
pnpm install @fourlights/strapi-plugin-deep-copy
```

Then in `config/plugins.js` add the contentTypes for which you want to enable creating a deep copy.
Any content-types not listed here will not be copied. Relations to these content types will be the same as on the original entity.


Take a look at the following config:

```json5
{
  // ...
  'deep-copy': {
    enabled: true,
    config: {
      contentTypes: {
        'api::page.page': {
          enabled: true,
          showButtonInAdmin: true,
        },
        'api::section.section': {
          enabled: true,
          showButtonInAdmin: false,
        }
      },
    },
  },
  // ...
}
```

This config will enable the deep copy admin button for the `api::page.page` content type.
If you choose the copy the `api::page.page` entity, any relations to `api::section.section` will be copied as well.
With this config, the copy action can only be started from the `api::page.page` content type.

Any other relations which are not defined in this config will be set to the same value as on the original entity.
For example, the strapi internal `createdBy` and `updatedBy` will not copy the use, but will be set to the same user as the original entity.

## Advanced usage

### Unique fields

By default, the plugin will append a random hex number `(copy#)` to any unique fields on the newly created entities.
You can override this behaviour by providing a default value function, which is used for all non-specified unique fields.

For more control you can explicitly specify unique fields and provide a special value function for each field.

Note that the strapi instance is passed to these value resolve functions, so you can also use all strapi's tooling to generate the value.

```json5
{
  // ...
  'deep-copy': {
    // ...
    config: {
      // ...
      contentTypes: {
        'api::page.page': {
          // default value function for all implicit unique fields
          defaultUniqueFieldValue: (strapi, src, name) => `${src[name]} (${new Date().toIsoFormat()})`,
          // specify explicit unique fields
          uniqueFields: {
            slug: (strapi, src, name) => slugify(`${src.title} (copy)`),
          }
        },
      },
    },
    // ...
  },
  // ...
}
```

### Editable fields

By default, all fields are copied from the original entity. However, you can also specify which fields should be editable from the admin before deep copying an entity.
This follows a similar approach to the uniquefields, but with some extra functionality.

```json5
{
  // ...
  'deep-copy': {
    // ...
    config: {
      // ...
      contentTypes: {
        'api::page.page': {
          // ...
          editableFields: {
            slug: {
              required: true,  // optional, mark field as required for deep-copy when it's not actually required
              // initial value for the editable slug field
              initialValue: (strapi, src, name) => slugify(`${src.title} (copy)`),
              // optional button for filling the field using the currently available data for the new entity (so, orignal + other editable fields)
              fillButton: {
                label: 'Copy from title',
                value: (data) => slugify(data.title),
              },
            },  
          }
        },
      },
    },
    // ...
  },
  // ...
}
```

## Development

You can use the `playground` directory for a strapi instance which is configured to use the plugin.

Automatic compilation of server part
```bash
pnpm run develop:server
```

Automatic compilation of admin part
```bash
pnpm run develop:admin
```

Start strapi server
```bash
pnpm run playground
```

Login to the admin with

```
playground@example.com
Test1234
```
