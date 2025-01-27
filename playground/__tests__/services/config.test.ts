import { setupDocuments } from "../helpers/setupDocuments"
import { setupStrapi, strapi, teardownStrapi } from "../helpers/strapi"
import type { UnwrapPromise } from "../helpers/unwrapPromise"

// Strip out all the extra properties we don't care about
// biome-ignore lint/suspicious/noExplicitAny: don't care
const stripExtraProps = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .filter(([_, value]) => value != null)
    .reduce(
      (acc, [key, value]) => {
        if (key === "targets") {
          acc[key] = Array.isArray(value) ? value.map(stripExtraProps) : value
        } else if (!["id", "createdAt", "documentId", "status", "updatedAt"].includes(key)) {
          acc[key] = value
        }
        return acc
      },
      // biome-ignore lint/suspicious/noExplicitAny: we don't care
      {} as Record<string, any>,
    )
}

describe("config service", () => {
  beforeAll(async () => {
    await setupStrapi()
  })

  afterAll(async () => {
    await teardownStrapi()
  })

  describe("getCopyTree", () => {
    let context: UnwrapPromise<ReturnType<typeof setupDocuments>>
    beforeAll(async () => {
      context = await setupDocuments()
    })

    test("handles self-referencing relations", async () => {
      const { page, nestedSection, primarySection } = context

      const ret = await strapi
        .plugin("deep-copy")
        .service("config")
        .getCopyTree({ contentType: "api::page.page", documentId: page.output.documentId })

      expect(ret.mutations.length).toBe(3)

      // first to be created should be the nestedSection
      expect(ret.mutations[0].contentType).toEqual("api::section.section")
      expect(ret.mutations[0].data.name).toContain(nestedSection.input.name) // with a slightly modified name
      expect(ret.mutations[0].data.multipleCoolComponents).toEqual(
        expect.arrayContaining(
          nestedSection.input.multipleCoolComponents.map((coolItem) => expect.objectContaining(coolItem)),
        ),
      )
      expect(ret.mutations[0].data.singleCoolComponent.targets).toStrictEqual([])

      // next the primarySection
      expect(ret.mutations[1].contentType).toEqual("api::section.section")
      expect(ret.mutations[1].data.name).toContain(primarySection.input.name) // with a slightly modified name
      expect(ret.mutations[1].data.multipleCoolComponents.map(stripExtraProps)).toEqual(
        expect.arrayContaining(primarySection.input.multipleCoolComponents),
      )
      expect(ret.mutations[1].data.singleCoolComponent.targets.map(stripExtraProps)).toEqual(
        expect.arrayContaining(primarySection.input.singleCoolComponent.targets),
      )

      expect(ret.mutations[1].data.blocks.map(stripExtraProps)).toEqual(
        expect.arrayContaining(primarySection.input.blocks),
      )
      // which should reference the newly created nestedSection
      expect(ret.mutations[1].data.sections.connect.length).toBe(primarySection.input.sections.connect.length)
      expect(ret.mutations[1].data.sections.connect[0]).toBe(ret.mutations[0].placeholder)

      // finally, the page
      expect(ret.mutations[2].contentType).toEqual("api::page.page")
      expect(ret.mutations[2].data.title).toContain(page.input.title) // with a slightly modified title
      // which should reference the newly created primarySection
      expect(ret.mutations[2].data.sections.connect.length).toBe(page.input.sections.connect.length)
      expect(ret.mutations[2].data.sections.connect[0]).toBe(ret.mutations[1].placeholder)
    })
  })
})
