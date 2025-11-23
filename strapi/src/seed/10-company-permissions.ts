import { ensureRole } from '../utils/seed-helpers';

export default async () => {
  const roleService = strapi.service('plugin::users-permissions.role');

  const publicRole = await ensureRole('Public');
  await roleService.updateRolePermissions(publicRole.id, {
    'api::company.company': {
      find: true,
      findOne: true,
    },
  });

  const authenticatedRole = await ensureRole('Authenticated');
  await roleService.updateRolePermissions(authenticatedRole.id, {
    'api::company.company': {
      find: true,
      findOne: true,
      create: true,
      update: true,
    },
  });
};
