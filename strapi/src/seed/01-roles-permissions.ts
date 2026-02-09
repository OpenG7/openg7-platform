import { ensureRole, setRolePermissions } from '../utils/seed-helpers';

type PermissionMap = Record<string, Record<string, boolean>>;

const baseReadPermissions: PermissionMap = {
  'api::company.company': { find: true, findOne: true },
  'api::exchange.exchange': { find: true, findOne: true },
  'api::homepage.homepage': { find: true },
  'api::national-project.national-project': { find: true, findOne: true },
  'api::province.province': { find: true, findOne: true },
  'api::sector.sector': { find: true, findOne: true },
  'api::statistics.statistics': { find: true },
  'api::statistic-insight.statistic-insight': { find: true, findOne: true },
};

function mergePermissions(...sources: PermissionMap[]): PermissionMap {
  return sources.reduce<PermissionMap>((acc, source) => {
    Object.entries(source).forEach(([uid, actions]) => {
      acc[uid] = { ...(acc[uid] ?? {}), ...actions };
    });
    return acc;
  }, {});
}

export default async () => {
  const publicRole = await ensureRole('Public');
  await setRolePermissions(publicRole.id, baseReadPermissions);

  const authenticatedExtra: PermissionMap = {
    'api::company.company': { update: true },
    'api::account-profile.account-profile': {
      me: true,
      updateMe: true,
      requestEmailChange: true,
    },
  };

  const proExtra: PermissionMap = {
    'api::company.company': { create: true, delete: true },
  };

  const authenticatedRole = await ensureRole('Authenticated');
  await setRolePermissions(authenticatedRole.id, mergePermissions(baseReadPermissions, authenticatedExtra));

  const proRole = await ensureRole('Pro');
  await setRolePermissions(proRole.id, mergePermissions(baseReadPermissions, authenticatedExtra, proExtra));

  await ensureRole('Admin');
};
