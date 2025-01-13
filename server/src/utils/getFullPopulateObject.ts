import { D } from "@mobily/ts-belt"
import type { Data, UID } from "@strapi/strapi"
import type { Attribute } from "@strapi/types/dist/schema"
import { getModelPopulationAttributes } from "./getModelPopulationAttributes"

type AttributeWithTarget = { target?: UID.Schema }

function deepAssign(target, source) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === "object" && source[key] !== null) {
        if (!target[key] || typeof target[key] !== "object" || target[key] === null) {
          target[key] = source[key]
        }
        deepAssign(target[key], source[key])
      } else if (!target[key] || typeof target[key] !== "object" || target[key] === null) {
        target[key] = source[key]
      }
    }
  }
  return target
}

const userApis = ["admin::user", "plugin::users-permissions.user"] as UID.Schema[]

export async function getFullPopulateObject<T extends UID.Schema>(
  modelUid: T,
  document: Data.Entity<T>,
  skipCreatorFields: boolean,
  ignoreFields = new Set(),
  ignorePaths = new Set(),
  debug = false,
  parentPath = "",
) {
  if (userApis.includes(modelUid) && skipCreatorFields) {
    return undefined
  }

  const populate = {}
  const model = strapi.getModel(modelUid)

  const attributes = Object.entries(getModelPopulationAttributes(modelUid, model)).filter(([, value]) =>
    ["relation", "component", "dynamiczone", "media"].includes(value.type),
  ) as [
    string,
    (
      | Attribute.RelationWithTarget
      | Attribute.Component<UID.Component, boolean>
      | Attribute.DynamicZone
      | Attribute.Media<Attribute.MediaKind | undefined, boolean>
    ),
  ][]

  for (const [attrName, attrObject] of attributes) {
    const fullFieldName = parentPath ? `${parentPath}.${attrName}` : attrName

    // Check if the field is ignored (using attrName)
    if (ignoreFields.has(attrName) || ignoreFields.has(`${model.collectionName}.${attrName}`)) {
      debug && console.log(`Ignoring field: ${model.collectionName}.${attrName}`)
      continue
    }

    // Check if the field is ignored (using fullFieldName)
    if (ignorePaths.has(fullFieldName)) {
      debug && console.log(`Ignoring field: ${fullFieldName}`)
      continue
    }

    if (debug) {
      const skipLog = [
        "admin::user",
        "admin::role",
        "admin::permission",
        "plugin::upload.file",
        "plugin::user-permissions.user",
      ]
      if (!attrObject || !skipLog.includes((attrObject as AttributeWithTarget).target)) {
        console.log("attrObject", attrName, attrObject)
      }
    }

    // Skip if the attribute is empty
    if (D.isEmpty(attrObject)) continue

    if (attrObject.type === "component") {
      populate[attrName] = getFullPopulateObject(
        attrObject.component,
        document[attrName] as Data.Component,
        skipCreatorFields,
        ignoreFields,
        ignorePaths,
        debug,
        fullFieldName,
      )
    } else if (attrObject.type === "dynamiczone") {
      const components = (document[attrName] as Data.Component[]).map((dataComponent) =>
        attrObject.components.find((schemaComponent) => schemaComponent === dataComponent.__component),
      )
      const dynamicPopulate = components.reduce(async (prev, cur, idx) => {
        const curPopulate = await getFullPopulateObject(
          cur,
          document[attrName][idx] as Data.Component,
          skipCreatorFields,
          ignoreFields,
          ignorePaths,
          debug,
          fullFieldName,
        )

        const curOn = {}
        curOn[cur] = curPopulate

        return curPopulate === true ? prev : deepAssign(prev, { on: curOn })
      }, {})

      populate[attrName] = D.isEmpty(dynamicPopulate) ? true : dynamicPopulate
    } else if (attrObject.type === "relation") {
      if (userApis.includes((attrObject as AttributeWithTarget).target) && skipCreatorFields) {
        continue
      }

      const isSingleRelation = !Array.isArray(document[attrName])
      const relations = (isSingleRelation ? [document[attrName]] : document[attrName]) as Data.Entity[]

      if (relations.length === 0) continue

      const relationContentType = (attrObject as AttributeWithTarget).target as UID.ContentType
      let combinedPopulate = undefined
      for (const relation of relations) {
        const relationDocument = await strapi
          .documents(relationContentType)
          .findOne({ documentId: relation.documentId, populate: "*" })
        const relationPopulate = await getFullPopulateObject(
          (attrObject as AttributeWithTarget).target,
          relationDocument,
          skipCreatorFields,
          ignoreFields,
          ignorePaths,
          debug,
          fullFieldName,
        )
        if (relationPopulate === true || (typeof relationPopulate === "object" && !D.isEmpty(relationPopulate))) {
          if (
            combinedPopulate === undefined ||
            (combinedPopulate === true && typeof relationPopulate === "object" && !D.isEmpty(relationPopulate))
          )
            combinedPopulate = relationPopulate
          else {
            deepAssign(combinedPopulate, relationPopulate)
          }
        }
      }

      populate[attrName] = combinedPopulate
    } else if (attrObject.type === "media") {
      populate[attrName] = true
    }
  }

  return D.isEmpty(populate) ? true : { populate }
}
