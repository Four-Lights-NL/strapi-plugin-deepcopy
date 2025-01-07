import { useContext, useMemo } from "react"
import { useIntl } from "react-intl"

import type { DocumentActionProps, PanelComponentProps } from "@strapi/content-manager/strapi-admin"

import { DeepCopyContext, type DeepCopyContextType } from "../context/DeepCopy"

type CanBeUsedFnProps = Pick<DocumentActionProps | PanelComponentProps, "model" | "document" | "collectionType">
type CanBeUsedFn = (props: CanBeUsedFnProps) => boolean

export type DeepCopyType = {
  label: string
  canBeUsed: CanBeUsedFn
  getContext: () => DeepCopyContextType
}

const getContext = () => {
  const context = useContext(DeepCopyContext)
  if (!context) {
    throw new Error("useDeepCopy.getContext() must be used within a `<DeepCopyProvider />`")
  }
  return context
}

const useDeepCopy = (): DeepCopyType => {
  const { formatMessage } = useIntl()
  const label = useMemo(() => {
    return formatMessage({
      id: "content-manager.duplicate.document-action",
      defaultMessage: "Duplicate (deep)",
    })
  }, [formatMessage])

  const canBeUsed: CanBeUsedFn = ({ model, document, collectionType }) => {
    return (
      // only allow user created models
      model.startsWith("api::") &&
      // we can only copy an existing document
      document !== undefined &&
      document.id !== undefined &&
      // we can only copy collection types
      collectionType === "collection-types"
    )
  }

  return { getContext, label, canBeUsed }
}

export { useDeepCopy }
