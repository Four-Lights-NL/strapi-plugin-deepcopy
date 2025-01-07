import type { DocumentActionComponent, DocumentActionProps } from "@strapi/content-manager/strapi-admin"
import { useEffect, useState } from "react"

import { DeepCopyProvider } from "../../context/DeepCopy"
import { useDeepCopy } from "../../hooks/useDeepCopy"
import { PluginIcon } from "../PluginIcon"

import { DeepCopyModal } from "./Modal"

const DeepCopyAction: DocumentActionComponent = (props) => {
  const { canBeUsed, label, getContext } = useDeepCopy()
  const [isUsageAllowed, setIsUsageAllowed] = useState<boolean>()

  useEffect(() => {
    setIsUsageAllowed(canBeUsed(props))
  }, [canBeUsed, props])

  const ConditionalDeepCopyModalContent = ({ onClose, ...props }: DocumentActionProps & { onClose: () => void }) => {
    const { isEnabled } = getContext()
    return isEnabled ? (
      <>
        <DeepCopyModal.Body variant={"action"} {...props} />
        <DeepCopyModal.Footer variant={"action"} onClose={onClose} {...props} />
      </>
    ) : null
  }

  return isUsageAllowed
    ? {
        icon: <PluginIcon />,
        label,
        dialog: {
          title: label,
          icon: <PluginIcon />,
          type: "modal",
          content: ({ onClose }) => (
            <DeepCopyProvider model={props.model}>
              <ConditionalDeepCopyModalContent onClose={onClose} {...props} />
            </DeepCopyProvider>
          ),
        },
        position: "table-row",
      }
    : null
}

DeepCopyAction.type = "clone"
DeepCopyAction.position = "table-row"

export { DeepCopyAction }
