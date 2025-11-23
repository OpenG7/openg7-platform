export default {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.index',
      config: {
        auth: false,
      },
    },
  ],
};
