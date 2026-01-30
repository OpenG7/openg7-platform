import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ImportationCollaborationViewModel } from '../../models/importation.models';

interface ScheduleDraft {
  recipients: string;
  format: 'csv' | 'json' | 'look';
  frequency: 'weekly' | 'monthly' | 'quarterly';
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'og7-importation-collaboration-hub',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './importation-collaboration-hub.component.html',
  styleUrls: ['./importation-collaboration-hub.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Centralise les listes de veille, annotations et exports collaboratifs.
 * Raison d’être : Permet de créer des watchlists, consulter les notes et planifier les rapports.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ImportationCollaborationHubComponent géré par le framework.
 */
export class ImportationCollaborationHubComponent {
  @Input({ required: true }) viewModel!: ImportationCollaborationViewModel;

  @Output() createWatchlist = new EventEmitter<string>();
  @Output() scheduleReport = new EventEmitter<{ recipients: readonly string[]; format: 'csv' | 'json' | 'look'; frequency: 'weekly' | 'monthly' | 'quarterly'; notes?: string }>();

  watchlistName = '';
  scheduleDraft: ScheduleDraft = {
    recipients: '',
    format: 'csv',
    frequency: 'monthly',
    notes: '',
  };

  trackWatchlist = (_: number, item: { id: string }) => item.id;
  trackAnnotation = (_: number, item: { id: string }) => item.id;

  submitWatchlist(): void {
    if (!this.viewModel.canManageWatchlists) {
      return;
    }
    const trimmed = this.watchlistName.trim();
    if (!trimmed) {
      return;
    }
    this.createWatchlist.emit(trimmed);
    this.watchlistName = '';
  }

  submitSchedule(): void {
    if (!this.viewModel.canScheduleReports) {
      return;
    }
    const recipients = this.scheduleDraft.recipients
      .split(',')
      .map((value) => value.trim())
      .filter((value) => Boolean(value));
    if (!recipients.length) {
      return;
    }
    this.scheduleReport.emit({
      recipients,
      format: this.scheduleDraft.format,
      frequency: this.scheduleDraft.frequency,
      notes: this.scheduleDraft.notes?.trim() || undefined,
    });
    this.scheduleDraft = { recipients: '', format: 'csv', frequency: 'monthly', notes: '' };
  }
}
