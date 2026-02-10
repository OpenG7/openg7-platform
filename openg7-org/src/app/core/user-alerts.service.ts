import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@app/core/auth/auth.service';
import { UserAlertRecord, UserAlertsApiService } from '@app/core/services/user-alerts-api.service';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecte dans les pages compte qui pilotent les alertes utilisateur.
 * Raison d'etre : Centralise l'etat signal-first et les actions inbox (refresh, generate, read, delete).
 * @param dependencies Dependances injectees automatiquement par Angular.
 * @returns UserAlertsService geree par le framework.
 */
export class UserAlertsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly api = inject(UserAlertsApiService);

  private readonly entriesSig = signal<UserAlertRecord[]>([]);
  private readonly loadingSig = signal(false);
  private readonly generatingSig = signal(false);
  private readonly markAllReadPendingSig = signal(false);
  private readonly clearReadPendingSig = signal(false);
  private readonly errorSig = signal<string | null>(null);
  private readonly pendingByIdSig = signal<Record<string, boolean>>({});

  readonly entries = this.entriesSig.asReadonly();
  readonly loading = this.loadingSig.asReadonly();
  readonly generating = this.generatingSig.asReadonly();
  readonly markAllReadPending = this.markAllReadPendingSig.asReadonly();
  readonly clearReadPending = this.clearReadPendingSig.asReadonly();
  readonly error = this.errorSig.asReadonly();
  readonly pendingById = this.pendingByIdSig.asReadonly();

  readonly hasEntries = computed(() => this.entriesSig().length > 0);
  readonly unreadCount = computed(() => this.entriesSig().filter((entry) => !entry.isRead).length);

  /**
   * Contexte : Appelee a l'ouverture de la page pour synchroniser l'inbox utilisateur.
   * Raison d'etre : Charge les alertes de l'utilisateur authentifie.
   * @returns void
   */
  refresh(): void {
    if (!this.auth.isAuthenticated()) {
      this.entriesSig.set([]);
      this.pendingByIdSig.set({});
      this.loadingSig.set(false);
      this.generatingSig.set(false);
      this.markAllReadPendingSig.set(false);
      this.clearReadPendingSig.set(false);
      this.errorSig.set(null);
      return;
    }

    this.loadingSig.set(true);
    this.errorSig.set(null);

    this.api
      .listMine()
      .pipe(
        finalize(() => this.loadingSig.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (entries) => {
          this.entriesSig.set(this.sortEntries(entries));
        },
        error: () => {
          this.errorSig.set('pages.alerts.errors.load');
        },
      });
  }

  /**
   * Contexte : Declenchee sur action explicite de l'utilisateur depuis l'inbox.
   * Raison d'etre : Genere des alertes a partir des recherches sauvegardees actives.
   * @returns void
   */
  generateFromSavedSearches(): void {
    if (!this.auth.isAuthenticated() || this.generatingSig()) {
      return;
    }

    this.generatingSig.set(true);
    this.errorSig.set(null);

    this.api
      .generateFromSavedSearches()
      .pipe(
        finalize(() => this.generatingSig.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          const generated = Array.isArray(response.generated) ? response.generated : [];
          if (generated.length === 0) {
            return;
          }

          this.entriesSig.update((current) =>
            this.sortEntries(this.upsertMany(current, generated))
          );
        },
        error: () => {
          this.errorSig.set('pages.alerts.errors.generate');
        },
      });
  }

  /**
   * Contexte : Declenchee pour basculer une alerte en lue/non lue.
   * Raison d'etre : Met a jour l'etat de lecture cote serveur puis localement.
   * @param id Identifiant de l'alerte.
   * @param isRead Etat cible de lecture.
   * @returns void
   */
  markRead(id: string, isRead: boolean): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    const normalizedId = this.normalizeId(id);
    if (!normalizedId) {
      return;
    }

    this.setPending(normalizedId, true);
    this.errorSig.set(null);

    this.api
      .markRead(normalizedId, isRead)
      .pipe(
        finalize(() => this.setPending(normalizedId, false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updated) => {
          this.entriesSig.update((current) => this.sortEntries(this.upsert(current, updated)));
        },
        error: () => {
          this.errorSig.set('pages.alerts.errors.update');
        },
      });
  }

  /**
   * Contexte : Declenchee par l'action de suppression dans la liste d'alertes.
   * Raison d'etre : Supprime l'alerte distante et retire l'entree locale.
   * @param id Identifiant de l'alerte.
   * @returns void
   */
  remove(id: string): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    const normalizedId = this.normalizeId(id);
    if (!normalizedId) {
      return;
    }

    this.setPending(normalizedId, true);
    this.errorSig.set(null);

    this.api
      .deleteMine(normalizedId)
      .pipe(
        finalize(() => this.setPending(normalizedId, false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.entriesSig.update((current) => current.filter((entry) => entry.id !== normalizedId));
        },
        error: () => {
          this.errorSig.set('pages.alerts.errors.delete');
        },
      });
  }

  /**
   * Contexte : Declenchee via l'action globale "tout marquer comme lu".
   * Raison d'etre : Met toutes les alertes non lues en etat lu en un seul appel API.
   * @returns void
   */
  markAllRead(): void {
    if (!this.auth.isAuthenticated() || this.markAllReadPendingSig()) {
      return;
    }

    if (this.unreadCount() === 0) {
      return;
    }

    this.markAllReadPendingSig.set(true);
    this.errorSig.set(null);

    this.api
      .markAllRead()
      .pipe(
        finalize(() => this.markAllReadPendingSig.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ readAt }) => {
          const normalizedReadAt =
            typeof readAt === 'string' && readAt.trim().length > 0
              ? readAt.trim()
              : new Date().toISOString();

          this.entriesSig.update((current) =>
            this.sortEntries(
              current.map((entry) =>
                entry.isRead
                  ? entry
                  : {
                      ...entry,
                      isRead: true,
                      readAt: entry.readAt ?? normalizedReadAt,
                    }
              )
            )
          );
        },
        error: () => {
          this.errorSig.set('pages.alerts.errors.update');
        },
      });
  }

  /**
   * Contexte : Declenchee via l'action globale "supprimer les alertes lues".
   * Raison d'etre : Nettoie rapidement l'historique deja traite.
   * @returns void
   */
  clearRead(): void {
    if (!this.auth.isAuthenticated() || this.clearReadPendingSig()) {
      return;
    }

    if (!this.entriesSig().some((entry) => entry.isRead)) {
      return;
    }

    this.clearReadPendingSig.set(true);
    this.errorSig.set(null);

    this.api
      .deleteRead()
      .pipe(
        finalize(() => this.clearReadPendingSig.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.entriesSig.update((current) => current.filter((entry) => !entry.isRead));
        },
        error: () => {
          this.errorSig.set('pages.alerts.errors.delete');
        },
      });
  }

  private normalizeId(id: string): string | null {
    if (typeof id !== 'string') {
      return null;
    }
    const normalized = id.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private upsert(entries: UserAlertRecord[], next: UserAlertRecord): UserAlertRecord[] {
    const index = entries.findIndex((entry) => entry.id === next.id);
    if (index < 0) {
      return [...entries, next];
    }

    const merged = [...entries];
    merged[index] = next;
    return merged;
  }

  private upsertMany(entries: UserAlertRecord[], incoming: UserAlertRecord[]): UserAlertRecord[] {
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    for (const entry of incoming) {
      byId.set(entry.id, entry);
    }
    return Array.from(byId.values());
  }

  private sortEntries(entries: UserAlertRecord[]): UserAlertRecord[] {
    return [...entries].sort((left, right) => {
      const unreadOrder = Number(left.isRead) - Number(right.isRead);
      if (unreadOrder !== 0) {
        return unreadOrder;
      }
      return this.toTimestamp(right.createdAt) - this.toTimestamp(left.createdAt);
    });
  }

  private toTimestamp(candidate: string | null): number {
    if (!candidate) {
      return 0;
    }

    const parsed = Date.parse(candidate);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private setPending(id: string, pending: boolean): void {
    this.pendingByIdSig.update((current) => {
      const next = { ...current };
      if (pending) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  }
}
