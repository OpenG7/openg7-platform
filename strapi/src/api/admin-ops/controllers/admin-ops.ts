import fs from 'node:fs/promises';
import path from 'node:path';

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

const USER_UID = 'plugin::users-permissions.user' as any;
const COMPANY_UID = 'api::company.company' as any;
const FEED_UID = 'api::feed.feed' as any;
const SESSION_STORE_PLUGIN = 'openg7-auth-sessions';
const SESSION_KEY_PREFIX = 'user';
const DEFAULT_BACKUP_RETENTION_DAYS = 30;
const DEFAULT_BACKUP_MAX_FILES = 25;
const DEFAULT_UPLOAD_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_UPLOAD_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_IMPORT_SCAN_LIMIT = 2000;
const DEFAULT_SECURITY_SESSION_SCAN_LIMIT = 250;
const DEFAULT_SESSION_IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

interface BackupFileEntry {
  readonly name: string;
  readonly sizeBytes: number;
  readonly modifiedAt: string;
}

interface SessionStateLike {
  readonly sessions?: unknown;
}

interface SessionEntryLike {
  readonly revokedAt?: unknown;
}

interface ImportedCompanyLike {
  readonly id?: number | string;
  readonly name?: unknown;
  readonly businessId?: unknown;
  readonly status?: unknown;
  readonly importMetadata?: unknown;
  readonly updatedAt?: unknown;
}

function normalizeString(value: unknown, maxLength = 320): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function normalizeInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = normalizeInteger(value);
  if (parsed == null || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
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

function normalizeMimeType(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function parseMimeTypeEnv(value: unknown): string[] {
  if (typeof value !== 'string') {
    return [];
  }
  const unique = new Set<string>();
  const entries = value
    .split(/[\s,;]+/)
    .map((entry) => normalizeMimeType(entry))
    .filter((entry): entry is string => Boolean(entry));

  for (const entry of entries) {
    unique.add(entry);
  }
  return Array.from(unique);
}

function parseSessionIdleTimeoutMs(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return DEFAULT_SESSION_IDLE_TIMEOUT_MS;
  }
  const normalized = value.trim().toLowerCase();
  if (['0', 'off', 'none', 'false', 'disabled'].includes(normalized)) {
    return null;
  }
  const parsed = Number.parseInt(normalized, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_SESSION_IDLE_TIMEOUT_MS;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function buildHealthSnapshot(strapi: Core.Strapi) {
  const now = new Date().toISOString();
  const memory = process.memoryUsage();
  let databaseStatus: 'ok' | 'degraded' = 'ok';
  let users = 0;
  let companies = 0;
  let feedItems = 0;

  try {
    const userQuery = strapi.db.query(USER_UID);
    const companyQuery = strapi.db.query(COMPANY_UID);
    const feedQuery = strapi.db.query(FEED_UID);
    [users, companies, feedItems] = await Promise.all([
      userQuery.count(),
      companyQuery.count(),
      feedQuery.count(),
    ]);
  } catch {
    databaseStatus = 'degraded';
  }

  return {
    generatedAt: now,
    status: databaseStatus === 'ok' ? 'ok' : 'degraded',
    runtime: {
      env: process.env.STRAPI_ENV || process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
    },
    memory: {
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
    },
    database: {
      status: databaseStatus,
      users,
      companies,
      feedItems,
    },
  };
}

async function listBackupFiles(backupDir: string, maxFiles: number): Promise<BackupFileEntry[]> {
  const entries = await (async () => {
    try {
      return await fs.readdir(backupDir, { encoding: 'utf8', withFileTypes: true });
    } catch (error: unknown) {
      const message = toErrorMessage(error).toLowerCase();
      if (message.includes('enoent')) {
        return [] as Awaited<ReturnType<typeof fs.readdir>>;
      }
      throw error;
    }
  })();

  if (!entries.length) {
    return [];
  }

  try {
    const files: BackupFileEntry[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }
      const filename = typeof entry.name === 'string' ? entry.name : entry.name.toString('utf8');
      const fullPath = path.join(backupDir, filename);
      try {
        const stats = await fs.stat(fullPath);
        if (!stats.isFile()) {
          continue;
        }
        files.push({
          name: filename,
          sizeBytes: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        });
      } catch {
        // Ignore unreadable file entries.
      }
    }
    files.sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt));
    return files.slice(0, maxFiles);
  } catch {
    return [];
  }
}

async function buildBackupsSnapshot(strapi: Core.Strapi) {
  const enabled = parseBoolean(process.env.OPS_BACKUP_ENABLED, true);
  const backupDir =
    normalizeString(process.env.OPS_BACKUP_DIR, 500) ??
    path.join(strapi.dirs.app.root, 'backups');
  const retentionDays = parsePositiveInteger(
    process.env.OPS_BACKUP_RETENTION_DAYS,
    DEFAULT_BACKUP_RETENTION_DAYS
  );
  const schedule = normalizeString(process.env.OPS_BACKUP_SCHEDULE, 120);
  const maxFiles = parsePositiveInteger(process.env.OPS_BACKUP_MAX_FILES, DEFAULT_BACKUP_MAX_FILES);
  const files = enabled ? await listBackupFiles(backupDir, maxFiles) : [];
  const totalSizeBytes = files.reduce((total, file) => total + file.sizeBytes, 0);
  const lastBackupAt = files.length > 0 ? files[0].modifiedAt : null;
  const status: 'ok' | 'warning' | 'disabled' = !enabled
    ? 'disabled'
    : files.length > 0
      ? 'ok'
      : 'warning';

  return {
    generatedAt: new Date().toISOString(),
    status,
    enabled,
    directory: backupDir,
    retentionDays,
    schedule,
    totalFiles: files.length,
    totalSizeBytes,
    lastBackupAt,
    files,
  };
}

function extractImportMetadata(value: unknown): { source: string | null; importedAt: string | null } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { source: null, importedAt: null };
  }
  const record = value as Record<string, unknown>;
  return {
    source: normalizeString(record.source, 120),
    importedAt: normalizeIsoDate(record.importedAt),
  };
}

async function buildImportsSnapshot(strapi: Core.Strapi) {
  const importScanLimit = parsePositiveInteger(process.env.OPS_IMPORT_SCAN_LIMIT, DEFAULT_IMPORT_SCAN_LIMIT);
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const companyQuery = strapi.db.query(COMPANY_UID);
  const totalCompanies = await companyQuery.count();
  const companies = normalizeFindManyResult(
    (await strapi.entityService.findMany(COMPANY_UID, {
      fields: ['id', 'name', 'businessId', 'status', 'importMetadata', 'updatedAt'],
      publicationState: 'preview',
      sort: ['updatedAt:desc', 'id:desc'],
      limit: importScanLimit,
    })) as ImportedCompanyLike[] | ImportedCompanyLike | null
  );

  let importedCompanies = 0;
  let importsLast24h = 0;
  let lastImportAt: string | null = null;
  const sourceCounts = new Map<string, number>();
  const recent: Array<{
    id: string;
    businessId: string | null;
    name: string;
    status: string;
    source: string | null;
    importedAt: string | null;
    updatedAt: string | null;
  }> = [];

  for (const company of companies) {
    const metadata = extractImportMetadata(company.importMetadata);
    if (metadata.source) {
      sourceCounts.set(metadata.source, (sourceCounts.get(metadata.source) ?? 0) + 1);
    }
    if (metadata.source === 'province-upload') {
      importedCompanies += 1;
    }
    if (metadata.importedAt) {
      const importedAtMs = new Date(metadata.importedAt).getTime();
      if (Number.isFinite(importedAtMs) && importedAtMs >= dayAgo) {
        importsLast24h += 1;
      }
      if (!lastImportAt || metadata.importedAt.localeCompare(lastImportAt) > 0) {
        lastImportAt = metadata.importedAt;
      }
    }

    const updatedAt = normalizeIsoDate(company.updatedAt);
    if (!metadata.source && !metadata.importedAt) {
      continue;
    }

    recent.push({
      id: String(company.id ?? ''),
      businessId: normalizeString(company.businessId, 80),
      name: normalizeString(company.name, 180) ?? 'Unknown company',
      status: normalizeString(company.status, 40) ?? 'unknown',
      source: metadata.source,
      importedAt: metadata.importedAt,
      updatedAt,
    });
  }

  recent.sort((left, right) => {
    const leftDate = left.importedAt ?? left.updatedAt ?? '1970-01-01T00:00:00.000Z';
    const rightDate = right.importedAt ?? right.updatedAt ?? '1970-01-01T00:00:00.000Z';
    return rightDate.localeCompare(leftDate);
  });

  const sources = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((left, right) => right.count - left.count || left.source.localeCompare(right.source));

  return {
    generatedAt: new Date().toISOString(),
    totalCompanies,
    scannedCompanies: companies.length,
    truncated: companies.length >= importScanLimit && totalCompanies > companies.length,
    importedCompanies,
    importsLast24h,
    lastImportAt,
    sources,
    recent: recent.slice(0, 20),
  };
}

function parseSessionState(value: unknown): { active: number; revoked: number } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { active: 0, revoked: 0 };
  }
  const state = value as SessionStateLike;
  const sessions = Array.isArray(state.sessions) ? state.sessions : [];
  let active = 0;
  let revoked = 0;
  for (const entry of sessions) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    const session = entry as SessionEntryLike;
    const revokedAt = normalizeIsoDate(session.revokedAt);
    if (revokedAt) {
      revoked += 1;
    } else {
      active += 1;
    }
  }
  return { active, revoked };
}

async function buildSecuritySnapshot(strapi: Core.Strapi) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const userQuery = strapi.db.query(USER_UID);
  const companyQuery = strapi.db.query(COMPANY_UID);
  const [totalUsers, blockedUsers, registrationsLast7d, pendingCompanies, suspendedCompanies] =
    await Promise.all([
      userQuery.count(),
      userQuery.count({
        where: { blocked: true },
      }),
      userQuery.count({
        where: {
          createdAt: {
            $gte: sevenDaysAgo,
          },
        },
      }),
      companyQuery.count({
        where: { status: 'pending' },
      }),
      companyQuery.count({
        where: { status: 'suspended' },
      }),
    ]);

  const sessionScanLimit = parsePositiveInteger(
    process.env.OPS_SECURITY_SESSION_SCAN_LIMIT,
    DEFAULT_SECURITY_SESSION_SCAN_LIMIT
  );
  const usersForSessionScan = normalizeFindManyResult(
    (await userQuery.findMany({
      select: ['id'],
      orderBy: [{ updatedAt: 'desc' }],
      limit: sessionScanLimit,
    })) as Array<{ id?: number | string }> | { id?: number | string } | null
  );

  let activeSessions = 0;
  let revokedSessions = 0;
  let usersWithActiveSessions = 0;

  for (const user of usersForSessionScan) {
    if (!user?.id) {
      continue;
    }
    try {
      const store = strapi.store({
        type: 'plugin',
        name: SESSION_STORE_PLUGIN,
        key: `${SESSION_KEY_PREFIX}:${String(user.id)}`,
      });
      const rawState = await store.get();
      const stats = parseSessionState(rawState);
      activeSessions += stats.active;
      revokedSessions += stats.revoked;
      if (stats.active > 0) {
        usersWithActiveSessions += 1;
      }
    } catch {
      // Ignore malformed session buckets and continue.
    }
  }

  const uploadSafetyEnabled = parseBoolean(process.env.UPLOAD_SAFETY_ENABLED, true);
  const maxFileSizeBytes = parsePositiveInteger(
    process.env.UPLOAD_MAX_FILE_SIZE_BYTES,
    DEFAULT_UPLOAD_MAX_FILE_SIZE_BYTES
  );
  const allowedMimeTypes = (() => {
    const fromEnv = parseMimeTypeEnv(process.env.UPLOAD_ALLOWED_MIME_TYPES);
    if (fromEnv.length > 0) {
      return fromEnv;
    }
    return DEFAULT_UPLOAD_ALLOWED_MIME_TYPES;
  })();

  return {
    generatedAt: new Date().toISOString(),
    users: {
      total: totalUsers,
      blocked: blockedUsers,
      registrationsLast7d,
    },
    sessions: {
      scannedUsers: usersForSessionScan.length,
      truncated: totalUsers > usersForSessionScan.length,
      active: activeSessions,
      revoked: revokedSessions,
      usersWithActiveSessions,
    },
    uploads: {
      safetyEnabled: uploadSafetyEnabled,
      maxFileSizeBytes,
      allowedMimeTypes,
    },
    auth: {
      sessionIdleTimeoutMs: parseSessionIdleTimeoutMs(process.env.AUTH_SESSION_IDLE_TIMEOUT_MS),
    },
    moderation: {
      pendingCompanies,
      suspendedCompanies,
    },
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async health(ctx: Context) {
    try {
      ctx.body = { data: await buildHealthSnapshot(strapi) };
    } catch (error: unknown) {
      strapi.log.error(`[ops] Failed to build health snapshot: ${toErrorMessage(error)}`);
      ctx.internalServerError('owner.ops.health.failed');
    }
  },

  async backups(ctx: Context) {
    try {
      ctx.body = { data: await buildBackupsSnapshot(strapi) };
    } catch (error: unknown) {
      strapi.log.error(`[ops] Failed to build backups snapshot: ${toErrorMessage(error)}`);
      ctx.internalServerError('owner.ops.backups.failed');
    }
  },

  async imports(ctx: Context) {
    try {
      ctx.body = { data: await buildImportsSnapshot(strapi) };
    } catch (error: unknown) {
      strapi.log.error(`[ops] Failed to build imports snapshot: ${toErrorMessage(error)}`);
      ctx.internalServerError('owner.ops.imports.failed');
    }
  },

  async security(ctx: Context) {
    try {
      ctx.body = { data: await buildSecuritySnapshot(strapi) };
    } catch (error: unknown) {
      strapi.log.error(`[ops] Failed to build security snapshot: ${toErrorMessage(error)}`);
      ctx.internalServerError('owner.ops.security.failed');
    }
  },
});
