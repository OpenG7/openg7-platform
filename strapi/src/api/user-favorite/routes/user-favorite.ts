export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me/favorites',
      handler: 'user-favorite.me',
      config: {},
    },
    {
      method: 'POST',
      path: '/users/me/favorites',
      handler: 'user-favorite.createMe',
      config: {},
    },
    {
      method: 'DELETE',
      path: '/users/me/favorites/:id',
      handler: 'user-favorite.deleteMe',
      config: {},
    },
  ],
};
