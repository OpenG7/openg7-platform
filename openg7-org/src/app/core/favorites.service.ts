import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

const STORAGE_KEY = 'og7.favorites';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Favorites ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FavoritesService gérée par le framework.
 */
export class FavoritesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  private readonly items = signal<string[]>(this.restore());
  readonly list = this.items.asReadonly();

  readonly count = computed(() => this.items().length);
  readonly count$ = toObservable(this.count);

  /**
   * Contexte : Called by UI components when a user stars an opportunity or entity for later reference.
   * Raison d’être : Persists the selection in the shared favourites signal and syncs it to storage when available.
   * @param item Identifier of the entity to persist in the favourites collection.
   * @returns void
   */
  add(item: string) {
    this.applyChange(current => (current.includes(item) ? current : [...current, item]));
  }

  /**
   * Contexte : Triggered by components when the user unstars a previously saved entry.
   * Raison d’être : Removes the identifier from the favourites set while keeping persistence consistent across sessions.
   * @param item Identifier of the entity to remove from favourites.
   * @returns void
   */
  remove(item: string) {
    this.applyChange(current => (current.includes(item) ? current.filter(i => i !== item) : current));
  }

  /**
   * Contexte : Used by account screens offering a “clear favourites” action.
   * Raison d’être : Resets the signal and underlying storage when the list should be wiped in one action.
   * @returns void
   */
  clear() {
    this.applyChange(current => (current.length ? [] : current));
  }

  private applyChange(mutator: (current: string[]) => string[]) {
    const current = this.items();
    const next = mutator(current);
    if (next === current) {
      return;
    }
    this.items.set(next);
    this.persist(next);
  }

  private restore(): string[] {
    if (!this.browser) {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const filtered = parsed.filter((item): item is string => typeof item === 'string');
      return Array.from(new Set(filtered));
    } catch {
      return [];
    }
  }

  private persist(next: string[]) {
    if (!this.browser) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }
}
