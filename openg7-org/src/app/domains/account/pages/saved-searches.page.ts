import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { SavedSearchesService } from '@app/core/saved-searches.service';
import {
  SavedSearchFrequency,
  SavedSearchRecord,
  SavedSearchScope,
} from '@app/core/services/saved-searches-api.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'og7-saved-searches-page',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './saved-searches.page.html',
})
/**
 * Contexte : Chargee par le routeur Angular pour afficher la page des recherches sauvegardees.
 * Raison d'etre : Expose un formulaire de creation et une liste d'edition rapide pour l'utilisateur connecte.
 * @param dependencies Dependances injectees automatiquement par Angular.
 * @returns SavedSearchesPage geree par le framework.
 */
export class SavedSearchesPage {
  private readonly fb = inject(FormBuilder);
  private readonly savedSearches = inject(SavedSearchesService);

  protected readonly scopes: readonly SavedSearchScope[] = [
    'all',
    'companies',
    'partners',
    'feed',
    'map',
    'opportunities',
  ];

  protected readonly frequencies: readonly SavedSearchFrequency[] = ['realtime', 'daily', 'weekly'];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    query: ['', [Validators.maxLength(200)]],
    scope: this.fb.nonNullable.control<SavedSearchScope>('all'),
    notifyEnabled: this.fb.nonNullable.control(false),
    frequency: this.fb.nonNullable.control<SavedSearchFrequency>('daily'),
  });

  protected readonly loading = this.savedSearches.loading;
  protected readonly saving = this.savedSearches.saving;
  protected readonly error = this.savedSearches.error;
  protected readonly entries = this.savedSearches.entries;
  protected readonly pendingById = this.savedSearches.pendingById;
  protected readonly hasEntries = this.savedSearches.hasEntries;

  constructor() {
    this.savedSearches.refresh();
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const query = raw.query.trim();

    this.savedSearches.create({
      name: raw.name,
      scope: raw.scope,
      notifyEnabled: raw.notifyEnabled,
      frequency: raw.frequency,
      filters: query ? { query } : {},
    });
  }

  protected onDelete(id: string): void {
    this.savedSearches.remove(id);
  }

  protected onNotifyChanged(entry: SavedSearchRecord, checked: boolean): void {
    this.savedSearches.update(entry.id, { notifyEnabled: Boolean(checked) });
  }

  protected onFrequencyChanged(entry: SavedSearchRecord, frequency: string): void {
    const isAllowed = this.frequencies.includes(frequency as SavedSearchFrequency);
    if (!isAllowed) {
      return;
    }

    this.savedSearches.update(entry.id, { frequency: frequency as SavedSearchFrequency });
  }

  protected isPending(id: string): boolean {
    return Boolean(this.pendingById()[id]);
  }

  protected readQuery(entry: SavedSearchRecord): string {
    const query = entry.filters?.['query'];
    if (typeof query !== 'string') {
      return '';
    }
    return query.trim();
  }

  protected trackById = (_: number, entry: SavedSearchRecord) => entry.id;

  protected canSubmit(): boolean {
    return this.form.valid && !this.saving();
  }
}
