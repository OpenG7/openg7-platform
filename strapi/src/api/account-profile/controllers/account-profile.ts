import type { Core } from '@strapi/strapi';

const ACCOUNT_PROFILE_UID = 'api::account-profile.account-profile' as any;

type NotificationPreferences = {
  emailOptIn: boolean;
  webhookUrl: string | null;
};

type SanitizedProfileInput = {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  organization: string | null;
  phone: string | null;
  avatarUrl: string | null;
  sectorPreferences: string[];
  provincePreferences: string[];
  notificationPreferences: NotificationPreferences;
};

type UserRole = {
  type?: string;
  name?: string;
};

type AuthenticatedUser = {
  id: number | string;
  email?: string;
  username?: string;
  role?: UserRole | null;
};

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();
  for (const entry of value) {
    const normalized = normalizeString(entry);
    if (!normalized) {
      continue;
    }
    if (normalized.length > maxLength) {
      continue;
    }
    unique.add(normalized);
    if (unique.size >= maxItems) {
      break;
    }
  }

  return Array.from(unique);
}

function isValidUrl(value: string, options: { httpsOnly?: boolean } = {}): boolean {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    if (options.httpsOnly && url.protocol !== 'https:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function validateLength(value: string | null, label: string, max: number) {
  if (!value) {
    return;
  }
  if (value.length > max) {
    throw new Error(`${label} must be at most ${max} characters long.`);
  }
}

function validatePhone(value: string | null) {
  if (!value) {
    return;
  }
  if (!/^[+()0-9.\-\s]{7,24}$/.test(value)) {
    throw new Error('phone must be a valid phone number.');
  }
}

function validateUrl(value: string | null, label: string, options: { httpsOnly?: boolean } = {}) {
  if (!value) {
    return;
  }
  if (!isValidUrl(value, options)) {
    if (options.httpsOnly) {
      throw new Error(`${label} must be a valid HTTPS URL.`);
    }
    throw new Error(`${label} must be a valid URL.`);
  }
}

function sanitizeNotificationPreferences(value: unknown): NotificationPreferences {
  const record = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const emailOptIn = Boolean(record.emailOptIn);
  const webhookUrl = normalizeString(record.webhookUrl);
  return {
    emailOptIn,
    webhookUrl: emailOptIn ? webhookUrl : null,
  };
}

function sanitizePayload(payload: unknown): SanitizedProfileInput {
  const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;

  const sanitized: SanitizedProfileInput = {
    firstName: normalizeString(record.firstName),
    lastName: normalizeString(record.lastName),
    jobTitle: normalizeString(record.jobTitle),
    organization: normalizeString(record.organization),
    phone: normalizeString(record.phone),
    avatarUrl: normalizeString(record.avatarUrl),
    sectorPreferences: normalizeStringList(record.sectorPreferences, 20, 40),
    provincePreferences: normalizeStringList(record.provincePreferences, 20, 20),
    notificationPreferences: sanitizeNotificationPreferences(record.notificationPreferences),
  };

  validateLength(sanitized.firstName, 'firstName', 80);
  validateLength(sanitized.lastName, 'lastName', 80);
  validateLength(sanitized.jobTitle, 'jobTitle', 120);
  validateLength(sanitized.organization, 'organization', 120);
  validatePhone(sanitized.phone);
  validateUrl(sanitized.avatarUrl, 'avatarUrl');
  validateUrl(sanitized.notificationPreferences.webhookUrl, 'notificationPreferences.webhookUrl', {
    httpsOnly: true,
  });

  return sanitized;
}

function mapRoles(user: AuthenticatedUser): string[] {
  const role = user.role;
  if (!role) {
    return [];
  }

  const roles = new Set<string>();
  if (typeof role.type === 'string' && role.type.trim().length > 0) {
    roles.add(role.type.trim().toLowerCase());
  }
  if (typeof role.name === 'string' && role.name.trim().length > 0) {
    roles.add(role.name.trim().toLowerCase());
  }

  return Array.from(roles);
}

async function findProfileByUser(strapi: Core.Strapi, userId: number | string) {
  const existing = await strapi.entityService.findMany(ACCOUNT_PROFILE_UID, {
    filters: {
      user: {
        id: userId,
      },
    },
    limit: 1,
  });

  if (Array.isArray(existing)) {
    return existing[0] ?? null;
  }

  return existing ?? null;
}

function mapResponse(user: AuthenticatedUser, profile: Record<string, unknown> | null) {
  const source = profile ?? {};
  const notificationPreferencesRaw =
    source.notificationPreferences && typeof source.notificationPreferences === 'object'
      ? (source.notificationPreferences as Record<string, unknown>)
      : {};

  return {
    id: String(user.id),
    email: user.email ?? null,
    roles: mapRoles(user),
    firstName: typeof source.firstName === 'string' ? source.firstName : null,
    lastName: typeof source.lastName === 'string' ? source.lastName : null,
    jobTitle: typeof source.jobTitle === 'string' ? source.jobTitle : null,
    organization: typeof source.organization === 'string' ? source.organization : null,
    phone: typeof source.phone === 'string' ? source.phone : null,
    avatarUrl: typeof source.avatarUrl === 'string' ? source.avatarUrl : null,
    sectorPreferences: Array.isArray(source.sectorPreferences)
      ? (source.sectorPreferences as string[])
      : [],
    provincePreferences: Array.isArray(source.provincePreferences)
      ? (source.provincePreferences as string[])
      : [],
    notificationPreferences: {
      emailOptIn: Boolean(notificationPreferencesRaw.emailOptIn),
      webhookUrl:
        typeof notificationPreferencesRaw.webhookUrl === 'string'
          ? notificationPreferencesRaw.webhookUrl
          : null,
    },
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async me(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    const profile = await findProfileByUser(strapi, currentUser.id);
    ctx.body = mapResponse(currentUser, profile as Record<string, unknown> | null);
  },

  async updateMe(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    try {
      const payload = sanitizePayload(ctx.request.body);
      const existing = await findProfileByUser(strapi, currentUser.id);

      const data = {
        ...payload,
        user: currentUser.id,
      };

      const profile = existing?.id
        ? await strapi.entityService.update(ACCOUNT_PROFILE_UID, existing.id, { data: data as any })
        : await strapi.entityService.create(ACCOUNT_PROFILE_UID, { data: data as any });

      ctx.body = mapResponse(currentUser, profile as Record<string, unknown>);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid profile payload.';
      return ctx.badRequest(message);
    }
  },
});
