export const STRAPI_ROUTES = {
  auth: {
    login: '/api/auth/local',
    register: '/api/auth/local/register',
    sendEmailConfirmation: '/api/auth/send-email-confirmation',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  users: {
    root: '/api/users',
    me: '/api/users/me',
    meProfile: '/api/users/me/profile',
  },
} as const;

export const strapiUserById = (id: string | number): string => {
  const userId = encodeURIComponent(String(id));
  return `${STRAPI_ROUTES.users.root}/${userId}`;
};
