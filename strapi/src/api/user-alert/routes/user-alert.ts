export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me/alerts',
      handler: 'user-alert.me',
      config: {},
    },
    {
      method: 'POST',
      path: '/users/me/alerts',
      handler: 'user-alert.createMe',
      config: {},
    },
    {
      method: 'POST',
      path: '/users/me/alerts/generate',
      handler: 'user-alert.generateFromSavedSearches',
      config: {},
    },
    {
      method: 'PATCH',
      path: '/users/me/alerts/:id/read',
      handler: 'user-alert.markReadMe',
      config: {},
    },
    {
      method: 'PATCH',
      path: '/users/me/alerts/read-all',
      handler: 'user-alert.markAllReadMe',
      config: {},
    },
    {
      method: 'DELETE',
      path: '/users/me/alerts/read',
      handler: 'user-alert.deleteReadMe',
      config: {},
    },
    {
      method: 'DELETE',
      path: '/users/me/alerts/:id',
      handler: 'user-alert.deleteMe',
      config: {},
    },
  ],
};
