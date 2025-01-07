import type { DescriptionReducer, DocumentActionComponent, PanelComponent } from "@strapi/content-manager/strapi-admin"
import type { Plugin } from "@strapi/strapi/admin"

declare module "@strapi/content-manager/strapi-admin" {
  export interface ContentManagerPlugin extends Plugin {
    apis: {
      addDocumentAction(actions: DescriptionReducer<DocumentActionComponent>): void
      addDocumentAction(actions: DocumentActionComponent[]): void
      addDocumentAction(actions: DescriptionReducer<DocumentActionComponent> | DocumentActionComponent[]): void

      addEditViewSidePanel(panels: DescriptionReducer<PanelComponent>): void
      addEditViewSidePanel(panels: PanelComponent[]): void
      addEditViewSidePanel(panels: DescriptionReducer<PanelComponent> | PanelComponent[]): void
    }
  }
}
