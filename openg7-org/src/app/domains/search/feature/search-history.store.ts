import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, Signal, computed, inject, signal } from '@angular/core';
import { RecentSearch } from '@app/core/models/search';

const STORAGE_KEY = 'og7.quickSearch.history';
const HISTORY_LIMIT = 15;

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Utilisé dans « domains/search/feature » pour conserver l'état local côté client.
 * Raison d’être : Expose des signaux et mutations autour de « Search History » pour les composants consommateurs.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns SearchHistoryStore gérée par le framework.
 */
export class SearchHistoryStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  private readonly entriesSig = signal<RecentSearch[]>(this.restore());

  readonly entries: Signal<RecentSearch[]> = this.entriesSig.asReadonly();
  readonly hasEntries = computed(() => this.entriesSig().length > 0);

  add(entry: RecentSearch): void {
    const existing = this.entriesSig();
    const withoutDuplicate = existing.filter((item) => item.id !== entry.id);
    const next = [entry, ...withoutDuplicate].slice(0, HISTORY_LIMIT);
    this.entriesSig.set(next);
    this.persist();
  }

  remove(id: string): void {
    this.entriesSig.update((items) => items.filter((item) => item.id !== id));
    this.persist();
  }

  clear(): void {
    this.entriesSig.set([]);
    this.persist();
  }

  private restore(): RecentSearch[] {
    if (!this.browser) {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as RecentSearch[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.slice(0, HISTORY_LIMIT);
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.browser) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entriesSig()));
    } catch {
      // ignore storage errors
    }
  }
}
