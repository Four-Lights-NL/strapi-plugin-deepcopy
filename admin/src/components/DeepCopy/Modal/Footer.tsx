import { Button, Modal } from "@strapi/design-system"
import { useFetchClient } from "@strapi/strapi/admin"
import { join } from "pathe"
import { type MouseEvent, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useDeepCopy } from "../../../hooks/useDeepCopy"
import { PluginIcon } from "../../PluginIcon"

import type { DeepCopyModalProps } from "./"

type DeepCopyModalFooterProps = DeepCopyModalProps & {
  onClose?: () => void
}

const DeepCopyModalFooter = ({
  activeTab,
  model,
  documentId,
  onClose,
  variant = "action",
}: DeepCopyModalFooterProps) => {
  if (!documentId) return null

  const { getContext } = useDeepCopy()
  const { isReady, modelConfig, isBusy, setIsBusy, editableFieldsData, targetStatus, setErrors, setIsOpen } =
    getContext()

  const { editableFields } = modelConfig ?? {}

  const { post } = useFetchClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleDeepCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setIsBusy(true)
    const { data: newEntity } = await post(`/deep-copy/${model}/${documentId}`, {
      ...editableFieldsData,
      contentType: model,
      sourceStatus: activeTab ?? "published", // FIXME: This should come from the form
      targetStatus,
    })
    setIsBusy(false)

    if (!newEntity.errors) {
      // Workaround for content-manager not being aware of our new entities
      // FIXME: Create entities using `useDocumentActions` hook and then navigate using `react-router-dom`
      /*
        // navigate the user to the newly created (top-level) document
        const newEntityPath = join(pathname.replace(documentId, ""), `${newEntity.documentId}`)
        navigate(newEntityPath, { state: { from: pathname } })
       */
      window.location.href = join(window.location.pathname.replace(documentId, ""), `${newEntity.documentId}`)

      // NOTE: Probably superfluous as we're navigating away
      setIsOpen(false)
      if (onClose) onClose()
    } else {
      setErrors(newEntity.errors)
    }
  }

  const [isDisabled, setIsDisabled] = useState<boolean>(false)

  useEffect(() => {
    // we disable the deep copy when one of the following conditions applies:
    setIsDisabled(
      // we're currently busy
      isBusy ||
        // we're not yet ready only when we're ready
        !isReady ||
        // if there is a mismatch between the editable fields and the filled in data
        (editableFields !== undefined &&
          Object.keys(editableFields).length > 0 &&
          Object.keys(editableFieldsData).length !== Object.keys(editableFields).length) ||
        // if not all required editable fields have been filled in
        (editableFields !== undefined &&
          Object.keys(editableFields)
            .filter((fieldName) => editableFields[fieldName].required)
            .some((fieldName) => editableFieldsData[fieldName] === "")),
    )
  })

  const Cancel = () => {
    const CancelButton = () => (
      <Button variant="tertiary" onClick={onClose}>
        Cancel
      </Button>
    )
    // NOTE: in strapi admin the action component handles the opening and closing of the modal
    // so we _have_ to omit <Modal.Close>
    return variant === "action" ? (
      <CancelButton />
    ) : (
      <Modal.Close>
        <CancelButton />
      </Modal.Close>
    )
  }

  const Submit = () => (
    <Button startIcon={<PluginIcon />} disabled={isDisabled} loading={isBusy} onClick={handleDeepCopy}>
      Create deep copy
    </Button>
  )

  return (
    <Modal.Footer>
      <Cancel />
      <Submit />
    </Modal.Footer>
  )
}

export { DeepCopyModalFooter }
