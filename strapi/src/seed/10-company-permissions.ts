import { ensureRole, setRolePermissions } from '../utils/seed-helpers';

export default async () => {
  const publicRole = await ensureRole('Public');
  await setRolePermissions(publicRole.id, {
    'api::company.company': {
      find: true,
      findOne: true,
    },
  });

  const authenticatedRole = await ensureRole('Authenticated');
  await setRolePermissions(authenticatedRole.id, {
    'api::company.company': {
      find: true,
      findOne: true,
      create: true,
      update: true,
    },
  });
};
