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

Then in `config/plugins.js` add the contentTypes where you want to show the button to create a new copy.

```json5
{
  // ...
  'deep-copy': {
    enabled: true,
    config: {
      contentTypes: {
        'api::page.page': true,
      },
    },
  },
  // ...
}
```

## Advanced usage

The default behaviour is to create a copy for all related/nested entities.
However, for some entities, this doesn't make sense, e.g. the `admin::user` from Strapi.
The below is the default behaviour.

```json5
{
  // ...
  'deep-copy': {
    // ...
    config: {
      // ...
      excludeFromCopy: [
        'admin::user', // do not create a copy of these contentTypes (they will be set as relation still)
      ],
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
