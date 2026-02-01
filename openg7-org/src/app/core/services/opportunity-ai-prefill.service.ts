import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { Mode, OpportunityMatchQuery, ProvinceCode, SectorType } from '../models/opportunity';

import { OpportunityService } from './opportunity.service';


interface AiPreferenceSnapshot {
  readonly sectors?: readonly string[] | null;
  readonly provinces?: readonly string[] | null;
  readonly mode?: string | null;
  readonly query?: string | null;
}

const COOKIE_NAME = 'og7_ai_preferences';
const MODE_VALUES: readonly Mode[] = ['all', 'import', 'export'];
const PROVINCE_VALUES: readonly ProvinceCode[] = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
];
const SECTOR_VALUES: readonly SectorType[] = [
  'energy',
  'mining',
  'manufacturing',
  'construction',
  'services',
  'agri',
];

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/services ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Opportunity Ai Prefill ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunityAiPrefillService gérée par le framework.
 */
export class OpportunityAiPrefillService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly opportunities = inject(OpportunityService);

  private hydrated = false;

  /**
   * Contexte : Called once during boot to pre-populate opportunity results using stored AI preferences.
   * Raison d’être : Reads persisted hints (cookie) and triggers an initial match fetch that mirrors the user’s last context.
   * @returns void
   */
  prefillFromPreferences(): void {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;

    if (!this.browser) {
      return;
    }

    const currentMatches = this.opportunities.items()();
    if (currentMatches.length > 0) {
      return;
    }

    const rawCookie = this.readCookie(COOKIE_NAME);
    const preferences = rawCookie ? this.parseSnapshot(rawCookie) : null;
    const query = preferences ? this.buildQuery(preferences) : undefined;

    if (query) {
      this.opportunities.loadMatches(query);
    } else {
      this.opportunities.loadMatches();
    }
  }

  private readCookie(name: string): string | null {
    const cookieSource = document.cookie ?? '';
    if (!cookieSource) {
      return null;
    }

    const parts = cookieSource.split(';');
    for (const part of parts) {
      const [rawKey, ...rest] = part.split('=');
      if (!rawKey) {
        continue;
      }
      const key = rawKey.trim();
      if (key !== name) {
        continue;
      }
      const value = rest.join('=');
      return value ? decodeURIComponent(value.trim()) : '';
    }
    return null;
  }

  private parseSnapshot(raw: string): AiPreferenceSnapshot | null {
    try {
      const parsed = JSON.parse(raw) as AiPreferenceSnapshot | null;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private buildQuery(snapshot: AiPreferenceSnapshot): OpportunityMatchQuery | undefined {
    const province = this.pickFirstValid(snapshot.provinces, PROVINCE_VALUES);
    const sector = this.pickFirstValid(snapshot.sectors, SECTOR_VALUES);
    const mode = this.normalizeMode(snapshot.mode);
    const search = this.normalizeQuery(snapshot.query);
    const filteredMode: Exclude<Mode, 'all'> | undefined = mode && mode !== 'all' ? mode : undefined;

    if (!province && !sector && !filteredMode && !search) {
      return undefined;
    }

    return {
      ...(province ? { province } : {}),
      ...(sector ? { sector } : {}),
      ...(filteredMode ? { mode: filteredMode } : {}),
      ...(search ? { q: search } : {}),
    } satisfies OpportunityMatchQuery;
  }

  private pickFirstValid<T extends string>(
    candidates: readonly string[] | null | undefined,
    allowed: readonly T[],
  ): T | undefined {
    if (!Array.isArray(candidates)) {
      return undefined;
    }
    for (const candidate of candidates) {
      const normalized = typeof candidate === 'string' ? (candidate.trim().toUpperCase() as string) : '';
      const match = allowed.find(value => value.toUpperCase() === normalized);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  private normalizeMode(mode: string | null | undefined): Mode | undefined {
    if (!mode) {
      return undefined;
    }
    const normalized = mode.trim().toLowerCase();
    return MODE_VALUES.find(value => value === normalized) ?? undefined;
  }

  private normalizeQuery(value: string | null | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const normalized = value.trim();
    return normalized.length >= 2 ? normalized : undefined;
  }
}
