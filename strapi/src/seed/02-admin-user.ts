export default async () => {
  if (process.env.STRAPI_SEED_ADMIN_ALLOWED !== 'true') return;

  const email = process.env.STRAPI_ADMIN_EMAIL;
  const password = process.env.STRAPI_ADMIN_PASSWORD;

  if (!email || !password) return;

  const adminQuery = strapi.db.query('admin::user');
  const existing = await adminQuery.findOne({ where: { email } });

  if (existing) return;

  await adminQuery.create({
    data: {
      email,
      password,
      firstname: 'Admin',
      lastname: 'User',
      isActive: true,
    },
  });
};
