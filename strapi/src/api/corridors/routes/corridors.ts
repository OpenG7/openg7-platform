export default {
  routes: [
    {
      method: 'GET',
      path: '/corridors/realtime',
      handler: 'corridors.realtime',
      config: {
        auth: false,
      },
    },
  ],
};
