export default {
  type: "admin",
  routes: [
    {
      method: "POST",
      path: "/:contentType/:documentId",
      handler: "deepCopy.copy",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/:contentType/:documentId",
      handler: "config.getCopyTree",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/content-types",
      handler: "config.getContentTypes",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/:contentType/:documentId/initial-values",
      handler: "config.getInitialValues",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/:contentType/:documentId/:field/fill",
      handler: "config.getFillValue",
      config: {
        policies: [],
      },
    },
  ],
}
