export default {
  type: 'admin',
  routes: [
    {
      method: "POST",
      path: "/:contentType/:id",
      handler: "core.deepCopy",
      config: {
        policies: [],
      },
    },
  ]
}
