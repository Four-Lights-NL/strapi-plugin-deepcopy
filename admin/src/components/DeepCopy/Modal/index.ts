import type { DocumentActionProps, PanelComponentProps } from "@strapi/content-manager/strapi-admin"

import { DeepCopyModalBody as Body } from "./Body"
import { DeepCopyModalFooter as Footer } from "./Footer"
import { DeepCopyModalHeader as Header } from "./Header"

export type DeepCopyModalProps = (DocumentActionProps | PanelComponentProps) & { variant?: "panel" | "action" }
const DeepCopyModal = {
  Body,
  Header,
  Footer,
}

export { DeepCopyModal }
