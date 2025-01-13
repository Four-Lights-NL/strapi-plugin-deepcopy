import type { Data } from "@strapi/strapi"

const setupDocuments = async () => {
  const nestedSection = {
    input: {
      name: "Nested Section",
      content: "This is a nested section",
      coolitems: [{ title: "a hot potato", isCool: false, text: "Full of carbs" }],
    },
    output: {} as Data.ContentType<"api::section.section">,
  }
  nestedSection.output = await strapi.documents("api::section.section").create({
    data: nestedSection.input,
  })

  const primarySection = {
    input: {
      name: "Primary Section",
      content: "This is a primary section",
      coolitems: [
        { title: "beer", isCool: true, text: "Cool and refreshing" },
        { title: "water", isCool: true, text: "It's what plants crave" },
      ],
      blocks: [
        {
          __component: "cms.cool-component" as const,
          isCool: true,
          title: "dynamic and cool",
        },
        {
          __component: "cms.special" as const,
          isSpecial: true,
          name: "dynamic and special",
        },
      ],
      sections: { connect: [nestedSection.output.documentId] },
    },
    output: {} as Data.ContentType<"api::section.section">,
  }
  primarySection.output = await strapi.documents("api::section.section").create({
    data: primarySection.input,
  })

  const page = {
    input: {
      title: "example page",
      slug: "example-page",
      sections: { connect: [primarySection.output.documentId] },
    },
    output: {} as Data.ContentType<"api::page.page">,
  }

  page.output = await strapi.documents("api::page.page").create({
    data: page.input,
  })

  return { page, primarySection, nestedSection }
}

export { setupDocuments }
