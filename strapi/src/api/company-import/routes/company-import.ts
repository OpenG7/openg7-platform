export default {
  routes: [
    {
      method: 'POST',
      path: '/import/companies',
      handler: 'company-import.importCompanies',
      config: {},
    },
  ],
};
