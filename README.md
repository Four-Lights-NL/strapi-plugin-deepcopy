# @fourlights/strapi-plugin-deepcopy

A strapi plugin providing deep copy functionality for nested entities.

The default behaviour in Strapi is to create a shallow copy when duplicating an entity.
This means that any relations are lost and have to be duplicated separately and connected manually to the newly created entities.

This plugin provides a custom `copy` action when viewing an entity in the Strapi admin which clones the entity and all it's related models, and connects the newly created entities in the same way as the original.

---
## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [Compatability](#compatibility)
* [Screenshot](#screenshot)
* [Advanced Usage](#advanced-usage)
* [Development](#development)

---

## Installation

```bash
npm install @fourlights/strapi-plugin-deep-copy @fourlights/strapi-plugin-deep-populate
```
<sub>Note: This plugin needs `@fourlights/strapi-plugin-deep-populate` to function.</sub>

Then configure enabled the plugins in `config/plugins.ts`

```json5
{
  'deep-populate': { enabled: true },
  'deep-copy': { enabled: true, config: { /* see usage section */ } }
}
```

## Compatibility

- **Strapi v5** use [v2.0 or later](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/releases)
- **Strapi v4** use [v1.0.3](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/releases/tag/v1.0.3) - [Source](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/tree/v1.0.3) - [Read Me](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/blob/v1.0.3/README.md)



## Screenshot

![strapi-deepcopy](https://github.com/user-attachments/assets/33c4f50c-2768-4260-a733-86a83e0e612d)

## Comparison with normal clone

[strapi-deepcopy-vs-native-clone.webm](https://github.com/user-attachments/assets/4a15fbba-547e-4693-9ce5-a895fdb83d7f)


## Usage

After [installation](#installation), add the contentTypes for which you want to enable creating a deep copy.
Any content-types not listed here will not be copied. Relations to these content types will be the same as on the original entity.

Take a look at the following config:

```json5
{
  // ...
  'deep-populate': { enabled: true },
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
For example, the strapi internal `createdBy` and `updatedBy` will not create a new copied user, but will be set to the same user as the original entity.

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
            slug: {
              value: (strapi, src, name) => slugify(`${src.title} (copy)`),
            }
          },
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
This follows a similar approach to the `uniquefields`, but with some extra functionality.

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
              initialValue: (strapi, src, name) => slugify(`${src[name]} (copy)`, { strict: true }),
              // optional button for filling the field using the currently available data for the new entity (so, original + other editable fields)
              fillButton: {
                label: 'Copy from title',
                value: (data) => slugify(data.title, { strict: true }),
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

In one terminal
```bash
npm run watch:link
```

Make sure the playground has the proper yalc configuration
```bash
npm run playground:install
```

Run playground
```bash
npm run playground
```

Login to the admin with

```
playground@example.com
Test1234
```
