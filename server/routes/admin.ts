export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/:contentType/:id',
      handler: 'core.deepCopy',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/contentTypes',
      handler: 'core.getContentTypes',
      config: {
        policies: [],
      },
    },
  ],
}
