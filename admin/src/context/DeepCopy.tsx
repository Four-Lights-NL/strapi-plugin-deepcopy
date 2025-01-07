import type { DocumentActionProps, PanelComponentProps } from "@strapi/content-manager/strapi-admin"
import { useFetchClient } from "@strapi/strapi/admin"
import { type ReactNode, createContext, useEffect, useState } from "react"

import type { ContentTypeConfig } from "#config"

type CheckIfEnabledFnProps = Pick<DocumentActionProps | PanelComponentProps, "model"> &
  Pick<DeepCopyContextType, "contentTypes" | "setIsEnabled" | "setModelConfig">
type CheckIfEnabledFn = ({ model, contentTypes, setIsEnabled, setModelConfig }: CheckIfEnabledFnProps) => void

const checkIfEnabled: CheckIfEnabledFn = ({ model, contentTypes, setIsEnabled, setModelConfig }) => {
  if (contentTypes[model]?.enabled && contentTypes[model].showButtonInAdmin) {
    setIsEnabled(true)
    setModelConfig(contentTypes[model])
  }
}

export type DeepCopyContextType = {
  isOpen: boolean
  isReady: boolean
  isBusy: boolean
  errors: Error[] | null
  isEnabled: boolean
  targetStatus: "draft" | "published"
  initialValues: Record<string, string>
  editableFieldsData: Record<string, string>
  fillIsBusy: Record<string, boolean>
  contentTypes: Record<string, ContentTypeConfig>
  modelConfig?: ContentTypeConfig

  setIsOpen: (isOpen: boolean) => void
  setIsReady: (isReady: boolean) => void
  setIsBusy: (isBusy: boolean) => void
  setFillIsBusy: (fillIsBusy: Record<string, boolean>) => void
  setErrors: (errors: Error[] | null) => void
  setIsEnabled: (isEnabled: boolean) => void
  setTargetStatus: (targetStatus: "draft" | "published") => void
  setInitialValues: (initialValues: Record<string, string>) => void
  setEditableFieldsData: (editableFieldsData: Record<string, string>) => void
  setContentTypes: (contentTypes: Record<string, ContentTypeConfig>) => void
  setModelConfig: (modelConfig?: ContentTypeConfig) => void
}
export const DeepCopyContext = createContext<DeepCopyContextType | undefined>(undefined)

type DeepCopyProviderProps = Pick<DocumentActionProps | PanelComponentProps, "model"> & {
  children: ReactNode
}
export const DeepCopyProvider = ({ children, model }: DeepCopyProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [errors, setErrors] = useState<Error[] | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [targetStatus, setTargetStatus] = useState<"draft" | "published">("published")
  const [initialValues, setInitialValues] = useState<Record<string, string>>({})
  const [fillIsBusy, setFillIsBusy] = useState<Record<string, boolean>>({})
  const [editableFieldsData, setEditableFieldsData] = useState<Record<string, string>>({})

  const [contentTypes, setContentTypes] = useState<Record<string, ContentTypeConfig>>({})
  const [modelConfig, setModelConfig] = useState<ContentTypeConfig | undefined>()

  const { get } = useFetchClient()

  useEffect(() => {
    setIsBusy(true)

    get("/deep-copy/content-types")
      .then(({ data }: { data: Record<string, ContentTypeConfig> }) => {
        setContentTypes(data)
      })
      .finally(() => setIsBusy(false))
  }, [get])

  useEffect(() => checkIfEnabled({ model, contentTypes, setIsEnabled, setModelConfig }), [model, contentTypes])

  return (
    <DeepCopyContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isReady,
        setIsReady,
        isBusy,
        setIsBusy,
        errors,
        setErrors,
        isEnabled,
        setIsEnabled,
        targetStatus,
        setTargetStatus,
        initialValues,
        setInitialValues,
        fillIsBusy,
        setFillIsBusy,
        editableFieldsData,
        setEditableFieldsData,
        contentTypes,
        setContentTypes,
        modelConfig,
        setModelConfig,
      }}
    >
      {children}
    </DeepCopyContext.Provider>
  )
}
