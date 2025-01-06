import type { ContentManagerPlugin } from "@strapi/content-manager/strapi-admin"
import type { StrapiApp } from "@strapi/strapi/admin"

import { DeepCopy } from "./components/DeepCopy"
import { Initializer } from "./components/Initializer"
import plugin from "./plugin"

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      ...plugin,
      initializer: Initializer,
      isReady: false,
    })
  },

  bootstrap(app: StrapiApp) {
    const contentManager = app.getPlugin("content-manager") as ContentManagerPlugin
    const { addDocumentAction, addEditViewSidePanel } = contentManager.apis

    addEditViewSidePanel((panels) => {
      panels.push(DeepCopy.Panel)
      return panels
    })

    addDocumentAction((actions) => {
      const indexOfCloneAction = actions.findIndex((action) => action.type === "clone")
      actions.splice(indexOfCloneAction + 1, 0, DeepCopy.Action)
      return actions
    })
  },
}
