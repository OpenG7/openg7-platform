export default {
  routes: [
    {
      method: 'GET',
      path: '/feed',
      handler: 'feed.index',
      config: {},
    },
    {
      method: 'POST',
      path: '/feed',
      handler: 'feed.create',
      config: {},
    },
    {
      method: 'GET',
      path: '/feed/highlights',
      handler: 'feed.highlights',
      config: {},
    },
    {
      method: 'GET',
      path: '/feed/stream',
      handler: 'feed.stream',
      config: {},
    },
  ],
};
