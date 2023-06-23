export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/:contentType/:id',
      handler: 'deepCopy.copy',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/content-types',
      handler: 'config.getContentTypes',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/:contentType/:id/initial-values',
      handler: 'config.getInitialValues',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/:contentType/:id/:field/fill',
      handler: 'config.getFillValue',
      config: {
        policies: [],
      },
    },
  ],
}
