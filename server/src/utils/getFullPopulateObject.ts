import { D } from "@mobily/ts-belt"
import type { UID } from "@strapi/strapi"
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

export function getFullPopulateObject(
  modelUid: UID.Schema,
  maxDepth: number,
  skipCreatorFields: boolean,
  ignoreFields = new Set(),
  ignorePaths = new Set(),
  debug = false,
  parentPath = "",
) {
  if (maxDepth <= 1) {
    // debug && console.log('maxDepth reached, skipping')
    return true
  }
  if (modelUid === "admin::user" && skipCreatorFields) {
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

    // console.log('attrName:', attrName, ' :', model.collectionName + '.' + attrName)

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
      const skipLog = ["admin::user", "admin::role", "admin::permission", "plugin::upload.file"]
      if (!attrObject || !skipLog.includes((attrObject as AttributeWithTarget).target)) {
        console.log("attrObject", attrName, attrObject)
      }
    }

    // Skip if the attribute is empty
    if (D.isEmpty(attrObject)) continue

    if (attrObject.type === "component") {
      populate[attrName] = getFullPopulateObject(
        attrObject.component,
        maxDepth - 1,
        skipCreatorFields,
        ignoreFields,
        ignorePaths,
        debug,
        fullFieldName,
      )
    } else if (attrObject.type === "dynamiczone") {
      const dynamicPopulate = attrObject.components.reduce((prev, cur) => {
        const curPopulate = getFullPopulateObject(
          cur,
          maxDepth - 1,
          skipCreatorFields,
          ignoreFields,
          ignorePaths,
          debug,
          fullFieldName,
        )
        return curPopulate === true ? prev : deepAssign(prev, curPopulate)
      }, {})

      populate[attrName] = D.isEmpty(dynamicPopulate) ? true : dynamicPopulate
    } else if (attrObject.type === "relation") {
      if ((attrObject as AttributeWithTarget).target === "admin::user" && skipCreatorFields) {
        continue
      }
      const relationPopulate = getFullPopulateObject(
        (attrObject as AttributeWithTarget).target,
        maxDepth - 1,
        skipCreatorFields,
        ignoreFields,
        ignorePaths,
        debug,
        fullFieldName,
      )
      if (relationPopulate === true || !D.isEmpty(relationPopulate)) {
        populate[attrName] = relationPopulate
      }
    } else if (attrObject.type === "media") {
      populate[attrName] = true
    }
  }

  return D.isEmpty(populate) ? true : { populate }
}
