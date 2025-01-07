import type { PanelComponent, PanelComponentProps } from "@strapi/content-manager/strapi-admin"
import { Button, Modal } from "@strapi/design-system"
import { useEffect, useState } from "react"

import { DeepCopyProvider } from "../../context/DeepCopy"
import { useDeepCopy } from "../../hooks/useDeepCopy"
import { PluginIcon } from "../PluginIcon"

import { DeepCopyModal } from "./Modal"

const DeepCopyPanel: PanelComponent = (props) => {
  const { canBeUsed, label, getContext } = useDeepCopy()
  const [isUsageAllowed, setIsUsageAllowed] = useState<boolean>()

  useEffect(() => {
    setIsUsageAllowed(canBeUsed(props))
  }, [canBeUsed, props])

  const ConditionalDeepCopyModal = (props: PanelComponentProps) => {
    const { isEnabled, isOpen, setIsOpen, isBusy } = getContext()
    return isEnabled ? (
      <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
        <Modal.Trigger>
          <Button fullWidth startIcon={<PluginIcon />} loading={isBusy} variant="secondary">
            {label}
          </Button>
        </Modal.Trigger>
        <Modal.Content>
          <DeepCopyModal.Header />
          <DeepCopyModal.Body variant={"panel"} {...props} />
          <DeepCopyModal.Footer variant={"panel"} {...props} />
        </Modal.Content>
      </Modal.Root>
    ) : null
  }

  return isUsageAllowed
    ? {
        title: "Deep copy",
        type: "modal",
        content: (
          <DeepCopyProvider model={props.model}>
            <ConditionalDeepCopyModal {...props} />
          </DeepCopyProvider>
        ),
      }
    : null
}

DeepCopyPanel.type = "actions"

export { DeepCopyPanel }
