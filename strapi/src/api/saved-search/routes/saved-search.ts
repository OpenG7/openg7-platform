export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me/saved-searches',
      handler: 'saved-search.me',
      config: {},
    },
    {
      method: 'POST',
      path: '/users/me/saved-searches',
      handler: 'saved-search.createMe',
      config: {},
    },
    {
      method: 'PATCH',
      path: '/users/me/saved-searches/:id',
      handler: 'saved-search.updateMe',
      config: {},
    },
    {
      method: 'DELETE',
      path: '/users/me/saved-searches/:id',
      handler: 'saved-search.deleteMe',
      config: {},
    },
  ],
};
