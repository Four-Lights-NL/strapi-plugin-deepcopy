import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Field,
  FieldHint,
  FieldInput,
  FieldLabel,
  Flex,
  ToggleInput,
  Typography,
} from '@strapi/design-system'
import { request, useCMEditViewDataManager } from '@strapi/helper-plugin'
import { Lightbulb } from '@strapi/icons'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import slugify from 'slugify'

import PluginIcon from '../PluginIcon'

const DeepCopyButton = () => {
  const { layout, initialData, isSingleType } = useCMEditViewDataManager()

  const [contentTypes, setContentTypes] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState(`${initialData.title} - Copy`)
  const [publish, setPublish] = useState(true)
  const [internalId, setInternalId] = useState(slugify(`${initialData.title} - Copy`.toLowerCase()))

  const { formatMessage } = useIntl()
  const {
    push,
    location: { pathname },
  } = useHistory()

  const handleDuplicate = async () => {
    setBusy(true)
    const newPage = await request(`/deep-copy/${layout.uid}/${initialData.id}`, {
      method: 'POST',
      body: { contentType: layout.uid, id: initialData.id, title, internalId, publish },
    })
    setBusy(false)

    if (!newPage.error) {
      push({
        pathname: pathname.replace(initialData.id, `${newPage.id}`),
        state: { from: pathname },
      })
    } else {
      setError(JSON.stringify(newPage.error))
    }
  }

  useEffect(() => {
    request('/deep-copy/contentTypes').then((res: any) => setContentTypes(res.contentTypes))
  }, [setContentTypes])

  // Only show button on allowed contentTypes
  if (!contentTypes) return null
  if (!contentTypes[layout.uid]) return null

  if (isSingleType) return null // We cannot copy a single type entity
  if (!initialData.id) return null // We cannot copy a non-existing entity

  return (
    <>
      <Button
        startIcon={<PluginIcon />}
        loading={busy}
        variant="secondary"
        onClick={() => setIsVisible(true)}
      >
        {formatMessage({
          id: 'deep-copy.components.duplicate.button',
          defaultMessage: 'Create a copy',
        })}
      </Button>
      <Dialog onClose={() => setIsVisible(false)} title="Create a copy" isOpen={isVisible}>
        <DialogBody icon={<PluginIcon />}>
          <Flex direction="column" alignItems="center" justifyContent="center" gap={5}>
            <Flex justifyContent="center">
              <Typography id="confirm-description">
                Create a full copy, including all related and nested objects.
              </Typography>
            </Flex>
            {error && (
              <Flex justifyContent="center">
                <Typography variant="danger">
                  An error occurred! You could try to use a different internal id.
                </Typography>
              </Flex>
            )}
          </Flex>
          <Divider unsetMargin={false} />
          <Flex direction="column" alignItems="flex-start" justifyContent="items-stretch" gap={3}>
            <Field name="title" required>
              <Flex direction="column" alignItems="flex-start" gap={1}>
                <FieldLabel>New title</FieldLabel>
                <FieldInput
                  type="text"
                  value={title}
                  onChange={(e: any) => setTitle(e.target.value)}
                />
              </Flex>
            </Field>
            <Field name="internalId" required>
              <Flex direction="column" alignItems="flex-start" gap={1}>
                <FieldLabel>Internal id</FieldLabel>
                <Flex gap={2}>
                  <FieldInput
                    type="text"
                    value={internalId}
                    onChange={(e: any) => setInternalId(e.target.value)}
                  />
                  <Button
                    startIcon={<Lightbulb />}
                    onClick={() => setInternalId(() => slugify(title).toLowerCase())}
                  >
                    Use title
                  </Button>
                </Flex>
                <FieldHint>Used as basis for (internal) names for nested components</FieldHint>
              </Flex>
            </Field>
            <Field name="publish">
              <Flex direction="column" alignItems="flex-start" gap={1}>
                <FieldLabel>Clone published status</FieldLabel>
                <ToggleInput
                  checked={publish}
                  hint="Cloning the publish status is recommended"
                  onLabel="yes"
                  offLabel="no"
                  onChange={(e: any) => setPublish(e.target.checked)}
                />
              </Flex>
            </Field>
          </Flex>
        </DialogBody>
        <DialogFooter
          startAction={
            <Button onClick={() => setIsVisible(false)} variant="tertiary">
              Cancel
            </Button>
          }
          endAction={
            <Button
              startIcon={<PluginIcon />}
              disabled={title.length === 0 || internalId.length === 0 || busy}
              loading={busy}
              onClick={handleDuplicate}
            >
              {formatMessage({
                id: 'deep-copy.components.form.button',
                defaultMessage: 'Create clone',
              })}
            </Button>
          }
        />
      </Dialog>
    </>
  )
}

export default DeepCopyButton
