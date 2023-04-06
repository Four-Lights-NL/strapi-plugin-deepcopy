# Strapi plugin deep-copy

The default behaviour in Strapi is to create a shallow copy when duplicating an entity.
This means that any relations are lost and have to be duplicated seperately and connected manually to the newly created entities.

This plugin provides a custom `clone` action when viewing an entity in the Strapi admin which clones the entity and all it's related models, and connects the newly created entities in the same way as the original.

The plugin is currently in an alpha state: it's working, but the configuration is lacking.

For example, the clone action is currently only visible on a contentType called `page`.

I hope to improve this in future PR's.

## Development

You can use the `playground` directory for a strapi instance which is configured to use the plugin.

Automatic compilation of server part
```bash
pnpm run develop:server
```

Automatic compilation of admin part
```bash
pnpm run develop:server
```

Start strapi server
```bash
cd playground
pnpm run develop:admin
```

Login to the admin with

```
playground@example.com
Test1234
```
