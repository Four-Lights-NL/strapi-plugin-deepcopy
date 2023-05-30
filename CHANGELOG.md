

### [0.4.7](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.6...v0.4.7) (2023-05-30)


### Bug Fixes

* add workaround for upstream package mismatches to playground ([fb448bc](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/fb448bc1a0fd6eca89dac8c3556ae9380641ccad))
* readme references incorrect command ([07f7cf7](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/07f7cf7b5d060507b57b2a3f0341980c8d62ac0d))

### [0.4.6](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.5...v0.4.6) (2023-05-06)


### Bug Fixes

* add logging when entity is not created ([b988036](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/b988036e72f04d5cee9a0f351dce4a1c789876cd))
* clean-up entities on failed clone in reverse order ([b8225b1](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/b8225b1112ae7552663b0b497cb0ea3c6e74e19a))
* rollback behaviour upon error ([56e1538](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/56e15385d4afbc5cec4e0123cf17cf9f5d6226fc))
* show returned error in UI ([31d2a45](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/31d2a45fc6fd95f73bac7bc8ea7ad927c29d5526))

### [0.4.5](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.3...v0.4.5) (2023-04-13)


### Bug Fixes

* use inline function to `importTranslation` ([ce7de28](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/ce7de2883cc1c760dd1cf26441c5ea2f1e7c91e5))
* use static imports to resolve critical dependency warnings ([8a16618](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/8a16618b8b63d52ed7132353f97f3034cad3a982))

### [0.4.4](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.3...v0.4.4) (2023-04-13)


### Bug Fixes

* use static imports to resolve critical dependency warnings ([8a16618](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/8a16618b8b63d52ed7132353f97f3034cad3a982))

### [0.4.3](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.2...v0.4.3) (2023-04-13)


### Bug Fixes

* remove unneeded assets from github release ([a1373f8](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/a1373f8bfed23c1ffef7c4207fa41b682968aeac))

### [0.4.2](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.1...v0.4.2) (2023-04-13)


### Bug Fixes

* use glob pattern for github assets ([a39c4a0](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/a39c4a00dcb4ea34eb22acb0e7f9dddda2f431b7))

### [0.4.1](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.4.0...v0.4.1) (2023-04-13)


### Bug Fixes

* add dist folder to github release ([e115420](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/e115420ed1e8beaf88d16198360f0f307e63857d))
* honor `bump_type` when releasing ([d2c37ef](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/d2c37ef6c23bb6586d6d3019e695e3bda7fa83ad))

## 0.4.0 (2023-04-13)


### Features

* add github action for publish ([8663229](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/86632292f3ba60bda0904f5d4b3165c18033fcef))
* add playground ([c74658a](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/c74658a1cd02bc7cc3afe1ca917908194e0035ec))
* add settings ([24dc79f](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/24dc79f3f05ed17f45535509af66454d2dc1c52a))
* build admin as commonjs module ([286e017](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/286e01744469516a894c4bfff7fa26fb3ffd9ffb))
* create `strapi-plugin-deep-copy` ([6968c94](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/6968c940d8a34d651087a2dc9ff5d50636ea554c))
* rewrite plugin meta ([fbac52a](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/fbac52a6c78054026abbeb378191a0773e97ab51))


### Bug Fixes

* add `no-git-checks` to pnpm publish in github action ([6b9058f](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/6b9058fe554ff4ca985a0074c3483f4b024f61ef))
* add `prepublish` command to `package.json` ([22bfddf](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/22bfddff17e18cb6806b7ea5a2d427b46af026d4))
* add custom.d.ts to package ([b3467e0](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/b3467e05667e3ec79cfe63e1531d84b91d37e23e))
* add missing `dist` to package ([3c1fedc](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/3c1fedc3005346603bd280c0996d795ec6d7cef8))
* add missing build step to `release-it` hook ([1cee5a7](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/1cee5a7ff3558ea9e63706d07f1c73700514ae11))
* add missing permission to release action ([243d867](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/243d8678e80e158c43ecccd8fb66296a9d51f244))
* add tsconfig.json to package ([b6c22d3](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/b6c22d3530dc0e9165557d397a6e960cee041203))
* do not show copy button when creating new entity ([8b9eff7](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/8b9eff78988d10685447025d16dbd577886c2a24))
* hardcode plugin id ([afcfdd4](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/afcfdd4a6bd7fbadc72518454e908296541522a3))
* incorrect path in admin entrypoint ([48cc0c8](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/48cc0c87bfbde06fb1182f94e0ddbdebdf740833))
* incorrect path to validate workflow ([3b113ae](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/3b113aeff418646c6bb8629b5a2578b9643a67cd))
* make sure `dist` folder is published ([217edc4](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/217edc466ea1d7da138e9c9719b7569618bb747e))
* properly exclude `admin::user` relations from copy ([5f13067](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/5f130672226fa0ff7e95976017b230f61c399064))
* translations missing in admin folder ([4bb8420](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/4bb84202a52c0767d744d621f0b0ef4aa060c760))
* update tsconfig ([2a391d1](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/2a391d1b0eae4c8516ed6f8c4c3ad12688bf2418))
* use correct github token permissions ([c46937f](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/c46937f6c649934ecc6bdd38e22b93b1d2769dfa))
* use correct preset when generating changelog ([44074e0](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/44074e012611fc1a2925f53f5a3a964a1e807156))

### [0.3.6](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.3.5...v0.3.6) (2023-04-13)


### Bug Fixes

* make sure `dist` folder is published ([217edc4](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/217edc466ea1d7da138e9c9719b7569618bb747e))
* use correct preset when generating changelog ([44074e0](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/44074e012611fc1a2925f53f5a3a964a1e807156))

## [0.3.5](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.3.4...v0.3.5) (2023-04-13)

## [0.3.4](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/compare/v0.3.0...v0.3.4) (2023-04-12)


### Bug Fixes

* add missing permission to release action ([243d867](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/243d8678e80e158c43ecccd8fb66296a9d51f244))
* incorrect path to validate workflow ([3b113ae](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/3b113aeff418646c6bb8629b5a2578b9643a67cd))
* use correct github token permissions ([c46937f](https://github.com/Four-Lights-NL/strapi-plugin-deepcopy/commit/c46937f6c649934ecc6bdd38e22b93b1d2769dfa))