import { Injectable, inject } from '@angular/core';
import { AnalyticsService } from '@app/core/observability/analytics.service';
import { RbacFacadeService } from '@app/core/security/rbac.facade';
import { ImportationFilters } from '../models/importation.models';

function serializeFilters(filters: ImportationFilters): Record<string, unknown> {
  return {
    periodGranularity: filters.periodGranularity,
    periodValue: filters.periodValue,
    originScope: filters.originScope,
    originCodes: filters.originCodes,
    hsSectionCount: filters.hsSections.length,
    compareMode: filters.compareMode,
    compareWith: filters.compareWith,
  };
}

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Encapsule les émissions analytics spécifiques à la page Importation.
 * Raison d’être : Normalise les noms d’évènements et payloads pour éviter la duplication.
 * @returns ImportationAnalyticsService géré par le framework.
 */
export class ImportationAnalyticsService {
  private readonly analytics = inject(AnalyticsService);
  private readonly rbac = inject(RbacFacadeService);

  trackPageViewed(filters: ImportationFilters): void {
    this.analytics.emit('importation_page_viewed', {
      ...serializeFilters(filters),
      role: this.rbac.currentRole(),
    });
  }

  trackFilterChange(filters: ImportationFilters): void {
    this.analytics.emit('importation_filter_updated', serializeFilters(filters));
  }

  trackMapDrilldown(originCode: string, filters: ImportationFilters): void {
    this.analytics.emit('importation_map_drilldown', {
      originCode,
      ...serializeFilters(filters),
    });
  }

  trackTimelinePlayback(playing: boolean, filters: ImportationFilters): void {
    this.analytics.emit('importation_timeline_playback', {
      playing,
      ...serializeFilters(filters),
    });
  }

  trackWatchlistCreated(name: string, filters: ImportationFilters): void {
    this.analytics.emit('importation_watchlist_created', {
      name,
      ...serializeFilters(filters),
    });
  }

  trackExportRequested(type: 'csv' | 'json' | 'look', filters: ImportationFilters): void {
    this.analytics.emit('importation_export_requested', {
      type,
      ...serializeFilters(filters),
    });
  }
}
