export const STRAPI_ROUTES = {
  auth: {
    login: '/api/auth/local',
    register: '/api/auth/local/register',
    sendEmailConfirmation: '/api/auth/send-email-confirmation',
    changePassword: '/api/auth/change-password',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  users: {
    root: '/api/users',
    me: '/api/users/me',
    meProfile: '/api/users/me/profile',
    meProfileEmailChange: '/api/users/me/profile/email-change',
    meFavorites: '/api/users/me/favorites',
    meSavedSearches: '/api/users/me/saved-searches',
  },
  upload: {
    files: '/api/upload',
  },
} as const;

export const strapiUserById = (id: string | number): string => {
  const userId = encodeURIComponent(String(id));
  return `${STRAPI_ROUTES.users.root}/${userId}`;
};

export const strapiFavoriteById = (id: string | number): string => {
  const favoriteId = encodeURIComponent(String(id));
  return `${STRAPI_ROUTES.users.meFavorites}/${favoriteId}`;
};

export const strapiSavedSearchById = (id: string | number): string => {
  const savedSearchId = encodeURIComponent(String(id));
  return `${STRAPI_ROUTES.users.meSavedSearches}/${savedSearchId}`;
};
