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

  async importTranslation(locale: string) {
    let data

    // NOTE: We use a static import to prevent warnings about dynamic imports in webpack et al.
    try {
      switch (locale) {
        case 'en':
          data = (await import('./translations/en.json')).default
          break
        // NOTE: Add more cases for other supported locales
        default:
          data = {}
      }
    } catch (error) {
      data = {}
    }

    return {
      data: prefixPluginTranslations(data, plugin.id),
      locale,
    }
  },

  async registerTrads(app: any) {
    const { locales } = app

    const importedTrads = await Promise.all(
      (locales as string[]).map((locale) => this.importTranslation(locale)),
    )

    return Promise.resolve(importedTrads)
  },
}
