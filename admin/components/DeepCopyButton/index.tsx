import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Field,
  FieldInput,
  FieldLabel,
  Flex,
  ToggleInput,
  Typography,
} from '@strapi/design-system'
import { request, useCMEditViewDataManager } from '@strapi/helper-plugin'
import { Lightbulb } from '@strapi/icons'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { ContentTypeConfig } from '../../../common/config'
import PluginIcon from '../PluginIcon'

const DeepCopyButton = () => {
  const { layout, initialData, isSingleType } = useCMEditViewDataManager()

  const [isReady, setIsReady] = useState(false)
  const [contentTypes, setContentTypes] = useState<Record<string, ContentTypeConfig>>({})
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Error[] | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [publish, setPublish] = useState(true)
  const [initialValues, setInitialValues] = useState<Record<string, string>>({})
  const [fillBusy, setFillBusy] = useState<Record<string, boolean>>({})
  const [editableFieldsData, setEditableFieldsData] = useState<Record<string, string>>({})

  const {
    push,
    location: { pathname },
  } = useHistory()

  const handleDeepCopy = async () => {
    setBusy(true)
    const newEntity = await request(`/deep-copy/${layout.uid}/${initialData.id}`, {
      method: 'POST',
      body: {
        ...editableFieldsData,
        contentType: layout.uid,
        id: initialData.id,
        publish,
      },
    })
    setBusy(false)

    if (!newEntity.errors) {
      push({
        pathname: pathname.replace(initialData.id, `${newEntity.id}`),
        state: { from: pathname },
      })
    } else {
      setErrors(newEntity.errors)
    }
  }

  useEffect(() => {
    request('/deep-copy/content-types').then((res: Record<string, ContentTypeConfig>) =>
      setContentTypes(res),
    )
  }, [setContentTypes])

  useEffect(() => {
    if (isEnabled && Object.keys(initialValues).length === 0 && !busy && !isReady) {
      setBusy(true)
      request(`/deep-copy/${layout.uid}/${initialData.id}/initial-values`).then(
        (res: Record<string, string>) => {
          setBusy(false)
          setInitialValues(res)
          setEditableFieldsData(res)
          setIsReady(true)
        },
      )
    }
  }, [isEnabled, busy, initialData, layout, initialValues, isReady])

  useEffect(() => {
    const contentTypeConfig = contentTypes[layout.uid]
    if (
      contentTypeConfig !== undefined &&
      contentTypeConfig.enabled &&
      contentTypeConfig.showButtonInAdmin
    ) {
      setIsEnabled(true)
    }
    // app,
  }, [contentTypes, layout.uid, setIsEnabled])

  if (!contentTypes) return null
  const contentTypeConfig = contentTypes[layout.uid]

  // Only show button on allowed contentTypes
  if (
    contentTypeConfig === undefined ||
    !contentTypeConfig.enabled ||
    !contentTypeConfig.showButtonInAdmin
  )
    return null

  if (isSingleType) return null // We cannot copy a single type initialData
  if (!initialData.id) return null // We cannot copy a non-existing initialData

  const { editableFields } = contentTypeConfig

  return (
    <>
      <Button
        startIcon={<PluginIcon />}
        loading={busy}
        variant="secondary"
        onClick={() => setIsVisible(true)}
      >
        Create deep copy
      </Button>
      <Dialog onClose={() => setIsVisible(false)} title="Create a copy" isOpen={isVisible}>
        <DialogBody icon={<PluginIcon />}>
          <Flex direction="column" alignItems="center" justifyContent="center" gap={5}>
            <Flex justifyContent="center">
              {!errors && (
                <Typography id="confirm-description">
                  Create a full copy, including all related and nested objects.
                </Typography>
              )}
              {errors && (
                <Alert variant="danger" title="Some error(s) occurred!">
                  {errors.map((error: any, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Box key={`error-${idx}`}>
                      <Box>
                        <Typography variant="omega" fontWeight="semiBold">
                          {error.name}
                          {error.path ? `- '${error.path}'` : null}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="pi">{error.message}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Alert>
              )}
            </Flex>
          </Flex>
          <Divider unsetMargin={false} />
          <Flex direction="column" alignItems="flex-start" justifyContent="items-stretch" gap={3}>
            {editableFields &&
              Object.entries(editableFields).map(([fieldName, field]) => (
                <Field name={fieldName} key={fieldName} required>
                  <Flex direction="column" alignItems="flex-start" gap={1}>
                    <FieldLabel>New {fieldName}</FieldLabel>
                    <Flex gap={2}>
                      <FieldInput
                        type="text"
                        value={editableFieldsData[fieldName] ?? initialValues[fieldName]}
                        placeholder={isReady ? '' : 'loading...'}
                        required={field.required}
                        disabled={!isReady}
                        onChange={(e: any) => {
                          const data = { ...editableFieldsData }
                          data[fieldName] = e.target.value
                          setEditableFieldsData(data)
                        }}
                      />
                      {field.fillButton && (
                        <Button
                          startIcon={<Lightbulb />}
                          loading={fillBusy[fieldName] ?? false}
                          onClick={async () => {
                            setFillBusy({ ...fillBusy, [fieldName]: true })

                            const fillValue = await request(
                              `/deep-copy/${layout.uid}/${initialData.id}/${fieldName}/fill`,
                              { method: 'POST', body: editableFieldsData },
                            )

                            const data = { ...editableFieldsData }
                            data[fieldName] = fillValue[fieldName]
                            setEditableFieldsData(data)
                            setFillBusy({ ...fillBusy, [fieldName]: false })
                          }}
                        >
                          {field.fillButton.label}
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Field>
              ))}
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
              disabled={
                (Object.keys(editableFields).length > 0 &&
                  Object.keys(editableFieldsData).length !== Object.keys(editableFields).length) ||
                busy ||
                !isReady ||
                Object.keys(editableFields)
                  .filter((fieldName) => editableFields[fieldName].required)
                  .some((fieldName) => editableFieldsData[fieldName] === '')
              }
              loading={busy}
              onClick={handleDeepCopy}
            >
              Create deep copy
            </Button>
          }
        />
      </Dialog>
    </>
  )
}

export default DeepCopyButton
