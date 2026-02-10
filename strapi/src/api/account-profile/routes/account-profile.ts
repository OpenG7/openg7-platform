export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me/profile',
      handler: 'account-profile.me',
      config: {},
    },
    {
      method: 'GET',
      path: '/users/me/profile/export',
      handler: 'account-profile.exportMe',
      config: {},
    },
    {
      method: 'GET',
      path: '/users/me/profile/sessions',
      handler: 'account-profile.sessionsMe',
      config: {},
    },
    {
      method: 'POST',
      path: '/users/me/profile/sessions/logout-others',
      handler: 'account-profile.logoutOtherSessions',
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
