import type { ContentTypeConfig } from "#config"
import { DeepCopyStep, type DeepCopyStepType } from "./Step"

export type DeepCopyOverviewProps = {
  contentTypes: Record<string, ContentTypeConfig>
  mutations: DeepCopyStepType[]
}
const DeepCopyOverview = ({ contentTypes, mutations }: DeepCopyOverviewProps) => {
  const startStep = mutations[mutations.length - 1]
  return <DeepCopyStep contentTypes={contentTypes} mutations={mutations} step={startStep} />
}

export { DeepCopyOverview }
