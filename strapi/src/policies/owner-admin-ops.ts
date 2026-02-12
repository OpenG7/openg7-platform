import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

const USER_UID = 'plugin::users-permissions.user' as const;

interface PolicyContextState {
  readonly user?: {
    readonly id?: number | string;
  };
}

type PolicyContextWithMethods = Context & {
  readonly state?: PolicyContextState;
  unauthorized?: (message?: string) => Context;
  forbidden?: (message?: string) => Context;
};

interface UserRoleLike {
  readonly type?: unknown;
  readonly name?: unknown;
}

interface UserLike {
  readonly role?: UserRoleLike | null;
}

function normalizeString(value: unknown, maxLength = 120): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function isOwnerOrAdminRole(roleType: string | null, roleName: string | null): boolean {
  return roleType === 'admin' || roleType === 'owner' || roleName === 'admin' || roleName === 'owner';
}

export default async (
  policyContext: PolicyContextWithMethods,
  _config: unknown,
  { strapi }: { strapi: Core.Strapi }
): Promise<boolean> => {
  const userId = policyContext.state?.user?.id;
  if (!userId) {
    if (typeof policyContext.unauthorized === 'function') {
      policyContext.unauthorized('owner.ops.unauthorized');
    }
    return false;
  }

  const userQuery = strapi.db.query(USER_UID as any);
  const user = (await userQuery.findOne({
    where: { id: userId },
    populate: ['role'],
  })) as UserLike | null;

  if (!user) {
    if (typeof policyContext.unauthorized === 'function') {
      policyContext.unauthorized('owner.ops.unauthorized');
    }
    return false;
  }

  const roleType = normalizeString(user.role?.type, 80);
  const roleName = normalizeString(user.role?.name, 120);
  if (isOwnerOrAdminRole(roleType, roleName)) {
    return true;
  }

  if (typeof policyContext.forbidden === 'function') {
    policyContext.forbidden('owner.ops.forbidden');
  }
  return false;
};
