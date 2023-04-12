import { prefixPluginTranslations } from '@strapi/helper-plugin'

import DeepCopyButton from './components/DeepCopyButton'
import Initializer from './components/Initializer'
import PluginIcon from './components/PluginIcon'
import plugin from './plugin'

export default {
  register(app: any) {
    app.registerPlugin({
      ...plugin,
      initializer: Initializer,
      isReady: false,
      icon: PluginIcon,
    })
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
              data: prefixPluginTranslations(data, plugin.id),
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
