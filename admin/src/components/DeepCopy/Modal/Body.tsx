import {
  Accordion,
  Box,
  Button,
  Divider,
  Field,
  Flex,
  FocusTrap,
  Modal,
  Toggle,
  Typography,
} from "@strapi/design-system"
import { Lightbulb, WarningCircle } from "@strapi/icons"
import { useFetchClient } from "@strapi/strapi/admin"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"

import { useDeepCopy } from "../../../hooks/useDeepCopy"
import { DeepCopyPlan, type DeepCopyPlanType } from "../Plan"
import type { DeepCopyModalProps } from "./"

const DeepCopyModalBody = ({ documentId, model, variant = "action" }: DeepCopyModalProps) => {
  if (!model || !documentId) return null

  const { getContext } = useDeepCopy()
  const {
    modelConfig,
    isBusy,
    setIsBusy,
    isReady,
    setIsReady,
    initialValues,
    setInitialValues,
    editableFieldsData,
    setEditableFieldsData,
    errors,
    fillIsBusy,
    setFillIsBusy,
    targetStatus,
    setTargetStatus,
  } = getContext()

  const [plan, setPlan] = useState<DeepCopyPlanType>()

  const { get, post } = useFetchClient()

  useEffect(() => {
    if (Object.keys(initialValues).length === 0 && !isBusy && !isReady) {
      setIsBusy(true)
      get(`/deep-copy/${model}/${documentId}/initial-values`)
        .then(({ data }: { data: Record<string, string> }) => {
          setInitialValues(data)
          setEditableFieldsData(data)
          setIsReady(true)
        })
        .finally(() => setIsBusy(false))
    }
  }, [
    initialValues,
    isBusy,
    isReady,
    setIsBusy,
    get,
    model,
    documentId,
    setInitialValues,
    setEditableFieldsData,
    setIsReady,
  ])

  useEffect(() => {
    if (plan === undefined && initialValues !== undefined && !isBusy) {
      setIsBusy(true)
      get(`/deep-copy/${model}/${documentId}`)
        .then(({ data }: { data: DeepCopyPlanType }) => {
          setPlan(data)
        })
        .finally(() => setIsBusy(false))
    }
  }, [plan, get, initialValues, model, documentId, isBusy, setIsBusy])

  const errorIds = useMemo(() => errors?.map(() => crypto.randomUUID()) ?? [], [errors])

  const { editableFields } = modelConfig ?? {}

  const Body = () => (
    <Flex direction="column" alignItems="stretch" gap={2}>
      <Typography id="confirm-description" variant="beta">
        Create a copy for this <b>{model}</b> and <u>its related and nested documents</u>.
      </Typography>

      <Accordion.Root>
        <Accordion.Item value="plan">
          <Accordion.Header>
            <Accordion.Trigger description="Deep-copy plan" caretPosition="left">
              <Typography textColor="neutral600">
                Copies will be created (and automatically linked) for the following documents
              </Typography>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <Flex direction="column" borderColor="neutral200" padding={6} justifyContent="center">
              {plan !== undefined ? <DeepCopyPlan.Overview {...plan} /> : null}
            </Flex>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      <Flex marginTop={4} gap={2} direction="column" alignItems="stretch">
        {errors ? (
          <Flex
            gap={3}
            padding={5}
            justifyContent="center"
            background="danger100"
            borderColor="danger200"
            shadow="filterShadow"
            hasRadius
          >
            <WarningCircle color="danger700" />
            <Flex gap={2} direction="column">
              {errors.map((error: Error & { path?: string }, idx) => (
                <Box key={`error-${errorIds[idx]}`}>
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
            </Flex>
          </Flex>
        ) : null}

        <Divider margin={0} />

        <FocusTrap>
          <Flex direction="column" alignItems="stretch" justifyContent="stretch" gap={3}>
            {editableFields &&
              Object.entries(editableFields).map(([fieldName, field]) => (
                <Field.Root name={fieldName} key={fieldName} required>
                  <Flex direction="column" alignItems="flex-start" gap={1}>
                    <Field.Label>New {fieldName}</Field.Label>
                    <Flex gap={2}>
                      <Field.Input
                        type="text"
                        value={editableFieldsData[fieldName] ?? initialValues[fieldName]}
                        placeholder={isReady ? "" : "loading..."}
                        required={field.required}
                        disabled={!isReady}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const data = { ...editableFieldsData }
                          data[fieldName] = e.target.value
                          setEditableFieldsData(data)
                        }}
                      />
                      {field.fillButton && (
                        <Button
                          variant="tertiary"
                          startIcon={<Lightbulb />}
                          loading={fillIsBusy[fieldName] ?? false}
                          onClick={async () => {
                            setFillIsBusy({ ...fillIsBusy, [fieldName]: true })

                            const { data: fillValue } = await post(
                              `/deep-copy/${model}/${documentId}/${fieldName}/fill`,
                              editableFieldsData,
                            )

                            const data = { ...editableFieldsData }
                            data[fieldName] = fillValue[fieldName]
                            setEditableFieldsData(data)
                            setFillIsBusy({ ...fillIsBusy, [fieldName]: false })
                          }}
                        >
                          {field.fillButton.label}
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Field.Root>
              ))}

            <Field.Root id="publish" name="publish" hint="Setting the status as published is recommended">
              <Flex direction="column" alignItems="stretch" gap={1}>
                <Field.Label>Set copied items to status</Field.Label>
                <Toggle
                  id="targetStatus"
                  checked={targetStatus === "published"}
                  onLabel="published"
                  offLabel="draft"
                  onChange={(e) => setTargetStatus(e.target.checked ? "published" : "draft")}
                />
                <Field.Hint />
              </Flex>
            </Field.Root>

            {/* TODO: Use source status toggle (if draft and publish enabled) */}
            {/* TODO: Add media keep/copy toggle */}
            {/* TODO: Add relation keep/copy toggle */}
          </Flex>
        </FocusTrap>
      </Flex>
    </Flex>
  )

  return (
    <Modal.Body>
      <Body />
    </Modal.Body>
  )
}

export { DeepCopyModalBody }
