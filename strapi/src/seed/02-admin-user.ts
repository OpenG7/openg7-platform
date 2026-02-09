const DEV_ENVIRONMENTS = new Set(['development', 'dev', 'integration', 'test']);
const DEFAULT_ADMIN_EMAIL = 'admin@openg7.org';
const DEFAULT_ADMIN_PASSWORD = 'change-me';
const DEFAULT_ADMIN_FIRSTNAME = 'Admin';
const DEFAULT_ADMIN_LASTNAME = 'User';
const SUPER_ADMIN_CODE = 'strapi-super-admin';

function isSeedAdminAllowed(): boolean {
  const explicitFlag = process.env.STRAPI_SEED_ADMIN_ALLOWED?.trim().toLowerCase();
  if (explicitFlag === 'false' || explicitFlag === '0' || explicitFlag === 'no') {
    return false;
  }

  if (explicitFlag === 'true' || explicitFlag === '1' || explicitFlag === 'yes') {
    return true;
  }

  const environment = (process.env.STRAPI_ENV || process.env.NODE_ENV || '').trim().toLowerCase();
  if (!environment) {
    return true;
  }
  return DEV_ENVIRONMENTS.has(environment);
}

function readNonEmpty(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function isPasswordHashed(password: string | null | undefined): boolean {
  if (!password) {
    return false;
  }

  return /^\$2[aby]\$/.test(password) || password.startsWith('$argon2');
}

export default async () => {
  if (!isSeedAdminAllowed()) {
    return;
  }

  const email = readNonEmpty(process.env.STRAPI_ADMIN_EMAIL, DEFAULT_ADMIN_EMAIL);
  const password = readNonEmpty(process.env.STRAPI_ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
  const firstname = readNonEmpty(process.env.STRAPI_ADMIN_FIRSTNAME, DEFAULT_ADMIN_FIRSTNAME);
  const lastname = readNonEmpty(process.env.STRAPI_ADMIN_LASTNAME, DEFAULT_ADMIN_LASTNAME);

  const adminUserService = strapi.service('admin::user') as any;
  const adminRoleService = strapi.service('admin::role') as any;

  let superAdminRole = await adminRoleService.getSuperAdmin();
  if (!superAdminRole) {
    superAdminRole = await adminRoleService.create({
      name: 'Super Admin',
      code: SUPER_ADMIN_CODE,
      description: 'Super Admins can access and manage all features and settings.',
    });
    await adminRoleService.resetSuperAdminPermissions();
  }

  const existing = await adminUserService.findOneByEmail(email, ['roles']);
  if (existing) {
    const existingRoleIds = (existing.roles ?? []).map((role: any) => role.id);
    const nextRoleIds = existingRoleIds.includes(superAdminRole.id)
      ? existingRoleIds
      : [...existingRoleIds, superAdminRole.id];

    const updatePayload: Record<string, any> = {};
    if (!existing.isActive) {
      updatePayload.isActive = true;
    }
    if (nextRoleIds.length !== existingRoleIds.length) {
      updatePayload.roles = nextRoleIds;
    }
    if (!isPasswordHashed(existing.password)) {
      updatePayload.password = password;
    }

    if (Object.keys(updatePayload).length > 0) {
      await adminUserService.updateById(existing.id, updatePayload);
    }
    return;
  }

  await adminUserService.create({
    email,
    password,
    firstname,
    lastname,
    isActive: true,
    registrationToken: null,
    roles: [superAdminRole.id],
  });
};
