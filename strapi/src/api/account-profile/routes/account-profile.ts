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
    {
      method: 'POST',
      path: '/users/me/profile/email-change',
      handler: 'account-profile.requestEmailChange',
      config: {},
    },
  ],
};
