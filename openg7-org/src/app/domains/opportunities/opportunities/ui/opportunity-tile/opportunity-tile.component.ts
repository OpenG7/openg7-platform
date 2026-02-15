import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FavoritesService } from '@app/core/favorites.service';
import { PartnerSelection } from '@app/core/models/partner-selection';
import { TranslateModule } from '@ngx-translate/core';

import { OpportunityViewSheetPayload } from '../opportunity-view-sheet-payload';

interface OpportunityTileActor {
  readonly name: string;
  readonly provinceLabelKey: string;
  readonly sectorLabelKey: string;
  readonly logoUrl?: string | null;
}

export interface OpportunityTileVm {
  readonly id: string;
  readonly matchId: string;
  readonly title: string;
  readonly score: number; // 0..100
  readonly buyer: OpportunityTileActor;
  readonly supplier: OpportunityTileActor;
  readonly distanceKm: number | null;
  readonly profileSelection: PartnerSelection;
}

@Component({
  selector: 'og7-opportunity-tile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './opportunity-tile.component.html',
  styleUrl: './opportunity-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/opportunities/opportunities/ui/opportunity-tile » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Opportunity Tile ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunityTileComponent gérée par le framework.
 */
export class OpportunityTileComponent {
  private readonly favorites = inject(FavoritesService);

  readonly vm = input.required<OpportunityTileVm>();
  readonly viewSheet = output<OpportunityViewSheetPayload>();
  readonly connect = output<string>();

  private readonly circleCircumference = 2 * Math.PI * 32;
  readonly scoreStrokeDasharray = this.circleCircumference.toFixed(2);

  readonly scoreTone = computed<'high' | 'medium' | 'low'>(() => {
    const score = this.vm().score;
    if (score >= 85) {
      return 'high';
    }
    if (score >= 70) {
      return 'medium';
    }
    return 'low';
  });

  readonly scoreStrokeDashoffset = computed(() => {
    const value = Math.max(0, Math.min(100, this.vm().score));
    const ratio = value / 100;
    const offset = this.circleCircumference - ratio * this.circleCircumference;
    return offset.toFixed(2);
  });

  readonly scoreStroke = computed(() => {
    switch (this.scoreTone()) {
      case 'high':
        return 'url(#opportunity-tile-score-high)';
      case 'medium':
        return 'url(#opportunity-tile-score-medium)';
      default:
        return 'url(#opportunity-tile-score-low)';
    }
  });

  readonly scoreLabel = computed(() => `${this.vm().score}%`);

  readonly distanceLabel = computed(() => {
    const value = this.vm().distanceKm;
    if (value == null) {
      return '—';
    }
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value) + ' km';
  });

  readonly titleId = computed(() => `opportunity-tile-title-${this.vm().id}`);
  readonly scoreId = computed(() => `opportunity-tile-score-${this.vm().id}`);
  readonly favoriteKey = computed(() => `opportunity:${this.vm().matchId}`);
  readonly saved = computed(() => this.favorites.list().includes(this.favoriteKey()));

  protected emitViewSheet(): void {
    const vm = this.vm();
    this.viewSheet.emit({ matchId: vm.matchId, selection: vm.profileSelection });
  }

  protected emitConnect(): void {
    this.connect.emit(this.vm().matchId);
  }

  protected toggleSave(): void {
    const key = this.favoriteKey();
    if (this.saved()) {
      this.favorites.remove(key);
      return;
    }
    this.favorites.add(key);
  }
}
