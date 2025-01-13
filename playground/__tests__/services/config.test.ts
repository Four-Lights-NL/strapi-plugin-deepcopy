import { setupDocuments } from "../helpers/setupDocuments"
import { setupStrapi, strapi, teardownStrapi } from "../helpers/strapi"
import type { UnwrapPromise } from "../helpers/unwrapPromise"

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

      const service = strapi.plugin("deep-copy").service("config")

      const ret = await service.getCopyTree({ contentType: "api::page.page", documentId: page.output.documentId })

      // first to be created should be the nestedSection
      expect(ret.mutations[0].contentType).toEqual("api::section.section")
      expect(ret.mutations[0].data.name).toContain(nestedSection.input.name) // with a slightly modified name
      expect(ret.mutations[0].data.coolitems).toEqual(
        expect.arrayContaining(nestedSection.input.coolitems.map((coolItem) => expect.objectContaining(coolItem))),
      )

      // next the primarySection
      expect(ret.mutations[1].contentType).toEqual("api::section.section")
      expect(ret.mutations[1].data.name).toContain(primarySection.input.name) // with a slightly modified name
      expect(ret.mutations[1].data.coolitems).toEqual(
        expect.arrayContaining(primarySection.input.coolitems.map((coolItem) => expect.objectContaining(coolItem))),
      )
      expect(ret.mutations[1].data.blocks).toEqual(
        expect.arrayContaining(primarySection.input.blocks.map((block) => expect.objectContaining(block))),
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
