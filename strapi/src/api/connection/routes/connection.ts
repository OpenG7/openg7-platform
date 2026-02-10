export default {
  routes: [
    {
      method: 'POST',
      path: '/connections',
      handler: 'connection.create',
      config: {},
    },
    {
      method: 'GET',
      path: '/connections',
      handler: 'connection.history',
      config: {},
    },
    {
      method: 'GET',
      path: '/connections/:id',
      handler: 'connection.findOne',
      config: {},
    },
    {
      method: 'PATCH',
      path: '/connections/:id/status',
      handler: 'connection.updateStatus',
      config: {},
    },
  ],
};
