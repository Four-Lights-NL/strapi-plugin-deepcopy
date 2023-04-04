import { prefixPluginTranslations } from '@strapi/helper-plugin'

import pluginPkg from '../../package.json'
import DeepCopyButton from './components/DeepCopyButton'
import Initializer from './components/Initializer'
import PluginIcon from './components/PluginIcon'
import pluginId from './pluginId'

const { name } = pluginPkg.strapi

export default {
  register(app: any) {
    const plugin = {
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      icon: PluginIcon,
      name,
    }

    app.registerPlugin(plugin)
  },

  bootstrap(app: any) {
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'deep-copy',
      Component: DeepCopyButton,
    })
  },

  async registerTrads(app: any) {
    const { locales } = app

    const importedTrads = await Promise.all(
      (locales as any[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            }
          })
          .catch(() => {
            return {
              data: {},
              locale,
            }
          })
      }),
    )

    return Promise.resolve(importedTrads)
  },
}
