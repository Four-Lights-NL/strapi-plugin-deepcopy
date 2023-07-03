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
}
