export default {
  routes: [
    {
      method: 'GET',
      path: '/homepage/preview',
      handler: 'homepage.preview',
      config: {
        auth: false,
      },
    },
  ],
};
