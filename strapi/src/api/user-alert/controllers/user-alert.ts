import type { Core } from '@strapi/strapi';

const USER_ALERT_UID = 'api::user-alert.user-alert' as any;
const SAVED_SEARCH_UID = 'api::saved-search.saved-search' as any;
const ALLOWED_SEVERITIES = new Set(['info', 'success', 'warning', 'critical']);
const SOURCE_TYPE_SAVED_SEARCH = 'saved-search';
const RECENT_ALERT_WINDOW_MS = 24 * 60 * 60 * 1000;

type AuthenticatedUser = {
  id: number | string;
};

type UserAlertEntity = {
  id: number | string;
  title?: unknown;
  message?: unknown;
  severity?: unknown;
  sourceType?: unknown;
  sourceId?: unknown;
  metadata?: unknown;
  readAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type SavedSearchEntity = {
  id: number | string;
  name?: unknown;
  scope?: unknown;
  filters?: unknown;
  frequency?: unknown;
};

type CreateUserAlertPayload = {
  title: string;
  message: string;
  severity: string;
  sourceType: string | null;
  sourceId: string | null;
  metadata: Record<string, unknown> | null;
};

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeId(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const asInteger = Number.parseInt(normalized, 10);
  if (Number.isFinite(asInteger) && String(asInteger) === normalized) {
    return asInteger;
  }

  return normalized;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function sanitizeSeverity(value: unknown): string {
  const normalized = normalizeString(value)?.toLowerCase() ?? 'info';
  if (!ALLOWED_SEVERITIES.has(normalized)) {
    throw new Error(`severity must be one of: ${Array.from(ALLOWED_SEVERITIES).join(', ')}.`);
  }
  return normalized;
}

function normalizeSeverity(value: unknown): string {
  const normalized = normalizeString(value)?.toLowerCase() ?? 'info';
  return ALLOWED_SEVERITIES.has(normalized) ? normalized : 'info';
}

function sanitizeMetadata(value: unknown): Record<string, unknown> | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('metadata must be an object.');
  }

  return value as Record<string, unknown>;
}

function sanitizeCreatePayload(payload: unknown): CreateUserAlertPayload {
  const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const title = normalizeString(record.title);
  const message = normalizeString(record.message);

  if (!title) {
    throw new Error('title is required.');
  }
  if (title.length > 140) {
    throw new Error('title must be at most 140 characters.');
  }

  if (!message) {
    throw new Error('message is required.');
  }
  if (message.length > 1000) {
    throw new Error('message must be at most 1000 characters.');
  }

  const sourceType = normalizeString(record.sourceType)?.toLowerCase() ?? null;
  const sourceId = normalizeString(record.sourceId);

  if (sourceType && !/^[a-z0-9][a-z0-9:_-]{0,47}$/.test(sourceType)) {
    throw new Error('sourceType format is invalid.');
  }

  if (sourceId && sourceId.length > 160) {
    throw new Error('sourceId must be at most 160 characters.');
  }

  return {
    title,
    message,
    severity: sanitizeSeverity(record.severity),
    sourceType,
    sourceId,
    metadata: sanitizeMetadata(record.metadata),
  };
}

function sanitizeMarkReadPayload(payload: unknown): { isRead: boolean } {
  const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(record, 'isRead')) {
    return { isRead: true };
  }

  return { isRead: normalizeBoolean(record.isRead, true) };
}

function normalizeFindManyResult<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

function toAlertResponse(entity: UserAlertEntity) {
  const readAt = typeof entity.readAt === 'string' ? entity.readAt : null;
  return {
    id: String(entity.id),
    title: typeof entity.title === 'string' ? entity.title : '',
    message: typeof entity.message === 'string' ? entity.message : '',
    severity: normalizeSeverity(entity.severity),
    sourceType: typeof entity.sourceType === 'string' ? entity.sourceType : null,
    sourceId: typeof entity.sourceId === 'string' ? entity.sourceId : null,
    metadata:
      entity.metadata && typeof entity.metadata === 'object' && !Array.isArray(entity.metadata)
        ? (entity.metadata as Record<string, unknown>)
        : null,
    isRead: Boolean(readAt),
    readAt,
    createdAt: typeof entity.createdAt === 'string' ? entity.createdAt : null,
    updatedAt: typeof entity.updatedAt === 'string' ? entity.updatedAt : null,
  };
}

function toTimestamp(candidate: string | null): number {
  if (!candidate) {
    return 0;
  }

  const parsed = Date.parse(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function findAlertForUser(
  strapi: Core.Strapi,
  userId: number | string,
  alertId: number | string
): Promise<UserAlertEntity | null> {
  const existing = await strapi.entityService.findMany(USER_ALERT_UID, {
    filters: {
      id: alertId,
      user: {
        id: userId,
      },
    },
    limit: 1,
  });

  const entries = normalizeFindManyResult(existing);
  return (entries[0] as UserAlertEntity | undefined) ?? null;
}

async function findAlertsForUser(
  strapi: Core.Strapi,
  userId: number | string,
  filters: Record<string, unknown>,
  limit = 100
): Promise<UserAlertEntity[]> {
  const existing = await strapi.entityService.findMany(USER_ALERT_UID, {
    filters: {
      user: {
        id: userId,
      },
      ...filters,
    },
    sort: ['createdAt:desc'],
    limit,
  });

  return normalizeFindManyResult(existing) as UserAlertEntity[];
}

async function hasRecentSavedSearchAlert(
  strapi: Core.Strapi,
  userId: number | string,
  sourceId: string
): Promise<boolean> {
  const threshold = new Date(Date.now() - RECENT_ALERT_WINDOW_MS).toISOString();
  const existing = await strapi.entityService.findMany(USER_ALERT_UID, {
    filters: {
      user: {
        id: userId,
      },
      sourceType: SOURCE_TYPE_SAVED_SEARCH,
      sourceId,
      createdAt: {
        $gte: threshold,
      },
    },
    limit: 1,
  });

  return normalizeFindManyResult(existing).length > 0;
}

function readSavedSearchQuery(entry: SavedSearchEntity): string | null {
  const filters = entry.filters;
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
    return null;
  }

  const query = (filters as Record<string, unknown>)['query'];
  return normalizeString(query);
}

function buildSavedSearchAlert(entry: SavedSearchEntity): CreateUserAlertPayload {
  const normalizedName = normalizeString(entry.name) ?? `Search ${String(entry.id)}`;
  const scope = normalizeString(entry.scope)?.toLowerCase() ?? 'all';
  const query = readSavedSearchQuery(entry);
  const frequency = normalizeString(entry.frequency)?.toLowerCase() ?? 'daily';

  const title = `Saved search update: ${normalizedName}`;
  const message = query
    ? `New activity matches "${query}" in ${scope}.`
    : `New activity detected in ${scope}.`;

  return {
    title,
    message,
    severity: frequency === 'realtime' ? 'warning' : 'info',
    sourceType: SOURCE_TYPE_SAVED_SEARCH,
    sourceId: String(entry.id),
    metadata: {
      savedSearchId: String(entry.id),
      scope,
      query,
      frequency,
    },
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async me(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    const entries = await strapi.entityService.findMany(USER_ALERT_UID, {
      filters: {
        user: {
          id: currentUser.id,
        },
      },
      sort: ['createdAt:desc'],
      limit: 100,
    });

    const alerts = normalizeFindManyResult(entries)
      .map((entry) => toAlertResponse(entry as UserAlertEntity))
      .sort((left, right) => {
        const unreadOrder = Number(left.isRead) - Number(right.isRead);
        if (unreadOrder !== 0) {
          return unreadOrder;
        }
        return toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
      });

    ctx.body = alerts;
  },

  async createMe(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    try {
      const payload = sanitizeCreatePayload(ctx.request.body);
      const created = await strapi.entityService.create(USER_ALERT_UID, {
        data: {
          ...payload,
          user: currentUser.id,
        } as any,
      });

      ctx.status = 201;
      ctx.body = toAlertResponse(created as UserAlertEntity);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid user-alert payload.';
      return ctx.badRequest(message);
    }
  },

  async generateFromSavedSearches(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    const savedSearchesRaw = await strapi.entityService.findMany(SAVED_SEARCH_UID, {
      filters: {
        user: {
          id: currentUser.id,
        },
        notifyEnabled: true,
      },
      sort: ['updatedAt:desc'],
      limit: 50,
    });

    const savedSearches = normalizeFindManyResult(savedSearchesRaw) as SavedSearchEntity[];
    if (!savedSearches.length) {
      ctx.body = { count: 0, skipped: 0, generated: [] };
      return;
    }

    const now = new Date().toISOString();
    const generated: ReturnType<typeof toAlertResponse>[] = [];
    let skipped = 0;

    for (const savedSearch of savedSearches) {
      const sourceId = String(savedSearch.id);
      const alreadyGenerated = await hasRecentSavedSearchAlert(strapi, currentUser.id, sourceId);

      if (alreadyGenerated) {
        skipped += 1;
        continue;
      }

      const payload = buildSavedSearchAlert(savedSearch);
      const created = await strapi.entityService.create(USER_ALERT_UID, {
        data: {
          ...payload,
          user: currentUser.id,
        } as any,
      });

      generated.push(toAlertResponse(created as UserAlertEntity));

      try {
        await strapi.entityService.update(SAVED_SEARCH_UID, savedSearch.id, {
          data: {
            lastRunAt: now,
          } as any,
        });
      } catch {
        // Best-effort update: the alert is still valid even if this metadata update fails.
      }
    }

    ctx.status = generated.length > 0 ? 201 : 200;
    ctx.body = {
      count: generated.length,
      skipped,
      generated,
    };
  },

  async markReadMe(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    const alertId = normalizeId(ctx.params?.id);
    if (!alertId) {
      return ctx.badRequest('id is required.');
    }

    const existing = await findAlertForUser(strapi, currentUser.id, alertId);
    if (!existing?.id) {
      return ctx.notFound('userAlert.notFound');
    }

    try {
      const payload = sanitizeMarkReadPayload(ctx.request.body);
      const readAt = payload.isRead
        ? typeof existing.readAt === 'string'
          ? existing.readAt
          : new Date().toISOString()
        : null;

      const updated = await strapi.entityService.update(USER_ALERT_UID, existing.id, {
        data: {
          readAt,
        } as any,
      });

      ctx.body = toAlertResponse(updated as UserAlertEntity);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid user-alert payload.';
      return ctx.badRequest(message);
    }
  },

  async markAllReadMe(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    const readAt = new Date().toISOString();
    let updated = 0;

    while (true) {
      const unread = await findAlertsForUser(
        strapi,
        currentUser.id,
        {
          readAt: {
            $null: true,
          },
        },
        100
      );

      if (!unread.length) {
        break;
      }

      for (const entry of unread) {
        await strapi.entityService.update(USER_ALERT_UID, entry.id, {
          data: {
            readAt,
          } as any,
        });
        updated += 1;
      }

      if (unread.length < 100) {
        break;
      }
    }

    ctx.body = {
      updated,
      readAt: updated > 0 ? readAt : null,
    };
  },

  async deleteReadMe(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    let deleted = 0;

    while (true) {
      const readEntries = await findAlertsForUser(
        strapi,
        currentUser.id,
        {
          readAt: {
            $notNull: true,
          },
        },
        100
      );

      if (!readEntries.length) {
        break;
      }

      for (const entry of readEntries) {
        await strapi.entityService.delete(USER_ALERT_UID, entry.id);
        deleted += 1;
      }

      if (readEntries.length < 100) {
        break;
      }
    }

    ctx.body = {
      deleted,
    };
  },

  async deleteMe(ctx) {
    const currentUser = ctx.state.user as AuthenticatedUser | undefined;
    if (!currentUser?.id) {
      return ctx.unauthorized();
    }

    const alertId = normalizeId(ctx.params?.id);
    if (!alertId) {
      return ctx.badRequest('id is required.');
    }

    const existing = await findAlertForUser(strapi, currentUser.id, alertId);
    if (!existing?.id) {
      return ctx.notFound('userAlert.notFound');
    }

    await strapi.entityService.delete(USER_ALERT_UID, existing.id);
    ctx.body = {
      id: String(existing.id),
      deleted: true,
    };
  },
});
