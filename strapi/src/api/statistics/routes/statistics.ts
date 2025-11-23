export default {
  routes: [
    {
      method: 'GET',
      path: '/statistics',
      handler: 'statistics.find',
      config: {
        auth: false,
      },
    },
  ],
};
