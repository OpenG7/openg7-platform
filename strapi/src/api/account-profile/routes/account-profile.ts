export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me/profile',
      handler: 'account-profile.me',
      config: {},
    },
    {
      method: 'PUT',
      path: '/users/me/profile',
      handler: 'account-profile.updateMe',
      config: {},
    },
  ],
};
