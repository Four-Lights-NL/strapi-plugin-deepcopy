import {
  Accordion,
  Badge,
  Box,
  Card,
  CardBadge,
  CardBody,
  CardContent,
  CardSubtitle,
  CardTitle,
  Flex,
  Typography,
} from "@strapi/design-system"
import type { Data, Schema, UID } from "@strapi/strapi"

import { ChevronRight, Duplicate, Link } from "@strapi/icons"
import type { ContentTypeConfig } from "#config"

export type DeepCopyStepType = {
  contentType: UID.ContentType
  model: Schema.ContentType & { __schema__: Schema.ContentType }
  data: Record<string, Data.Entity>
  placeholder: string
}

type DeepCopyStepProps = {
  contentTypes: Record<string, ContentTypeConfig>
  mutations: DeepCopyStepType[]
  step: DeepCopyStepType
  action?: "copy" | "link"
}
const DeepCopyStep = ({ contentTypes, mutations, step, action = "copy" }: DeepCopyStepProps) => {
  const relations = Object.entries(step.model.__schema__.attributes)
    .filter(([, attr]) => attr.type === "relation")
    .map(([name, attr]) => [name, attr as Schema.Attribute.RelationWithTarget] as const)
  const nonRelations = Object.entries(step.model.__schema__.attributes).filter(([, attr]) => attr.type !== "relation")

  return (
    <Card>
      <CardBody>
        <Box padding={2} background="primary100">
          {action === "copy" ? <Duplicate /> : <Link />}
        </Box>
        <CardContent paddingLeft={2}>
          <CardTitle>
            <Flex gap={3} alignItems="center" paddingTop={2}>
              <Typography
                variant="sigma"
                textColor="neutral700"
                ellipsis={true}
              >{`${step.data[nonRelations[0][0]]}`}</Typography>
              <Badge>{step.model.info.displayName}</Badge>
            </Flex>

            {relations.map(([name, attr]) => {
              const { target } = attr

              const copy = "connect" in step.data[name]
              const data = copy ? step.data[name].connect : []

              return data.length > 0 ? (
                <Flex key={`${step.placeholder}-${name}`} paddingTop={6} gap={2} alignItems="start">
                  <Flex gap={2} paddingTop={2} alignItems="start">
                    <Typography textColor="neutral600" variant="sigma">
                      {name}&nbsp;({data.length})
                    </Typography>
                    {data.length > 0 ? (
                      <Typography textColor="neutral200">
                        <ChevronRight />
                      </Typography>
                    ) : null}
                  </Flex>
                  {data.map((documentId: string) => {
                    const nextStep = mutations.findLastIndex(
                      (s) => s.placeholder === documentId && s.contentType === target,
                    )
                    return nextStep !== -1 ? (
                      <DeepCopyStep
                        key={`${step.placeholder}-${name}-${documentId}`}
                        contentTypes={contentTypes}
                        mutations={mutations.slice(0, nextStep)}
                        step={mutations[nextStep]}
                        action={copy ? "copy" : "link"}
                      />
                    ) : (
                      "Cannot find next step"
                    )
                  })}
                </Flex>
              ) : null
            })}
          </CardTitle>
        </CardContent>
      </CardBody>
    </Card>
  )
}

export { DeepCopyStep }
