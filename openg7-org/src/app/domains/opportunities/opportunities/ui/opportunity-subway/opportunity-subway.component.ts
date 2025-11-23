import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PartnerSelection } from '@app/core/models/partner-selection';
import { OpportunityViewSheetPayload } from '../opportunity-view-sheet-payload';

export type OpportunitySubwayParty = {
  readonly name: string;
  readonly provinceLabelKey: string;
  readonly sectorLabelKey: string;
  readonly logoUrl?: string | null;
};

export type OpportunitySubwayStationBadge = {
  readonly id: string;
  readonly label?: string;
  readonly labelKey?: string;
  readonly labelParams?: Record<string, unknown>;
};

export type OpportunitySubwayStation = {
  readonly id: string;
  readonly role: 'buyer' | 'supplier' | 'partner';
  readonly title: string;
  readonly titleKey?: string;
  readonly titleParams?: Record<string, unknown>;
  readonly badges: ReadonlyArray<OpportunitySubwayStationBadge>;
  readonly distanceBadge?: OpportunitySubwayStationBadge;
  readonly junction?: boolean;
};

export type OpportunitySubwayLine = {
  readonly id: 'cost' | 'delay' | 'carbon' | (string & {});
  readonly labelKey: string;
  readonly severity: 'stable' | 'caution' | 'critical';
  readonly metricLabelKey: string;
  readonly metricValueKey: string;
  readonly metricValueParams?: Record<string, unknown>;
  readonly stations: ReadonlyArray<OpportunitySubwayStation>;
};

export type OpportunitySubwayVm = {
  readonly id: string;
  readonly matchId: string;
  readonly title: string;
  readonly score: number; // 0..100
  readonly buyer: OpportunitySubwayParty;
  readonly supplier: OpportunitySubwayParty;
  readonly distanceKm: number | null;
  readonly lines: ReadonlyArray<OpportunitySubwayLine>;
  readonly profileSelection: PartnerSelection;
};

@Component({
  selector: 'og7-opportunity-subway',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './opportunity-subway.component.html',
  styleUrl: './opportunity-subway.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/opportunities/opportunities/ui/opportunity-subway » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Opportunity Subway ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunitySubwayComponent gérée par le framework.
 */
export class OpportunitySubwayComponent {
  readonly vm = input.required<OpportunitySubwayVm>();
  readonly viewSheet = output<OpportunityViewSheetPayload>();
  readonly connect = output<string>();

  private readonly scoreCircumference = 2 * Math.PI * 26;
  readonly scoreStrokeDasharray = this.scoreCircumference.toFixed(2);

  readonly titleId = computed(() => `opportunity-subway-title-${this.vm().id}`);
  readonly scoreId = computed(() => `opportunity-subway-score-${this.vm().id}`);

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
    const offset = this.scoreCircumference - ratio * this.scoreCircumference;
    return offset.toFixed(2);
  });

  readonly scoreStroke = computed(() => {
    switch (this.scoreTone()) {
      case 'high':
        return 'url(#opportunity-subway-score-high)';
      case 'medium':
        return 'url(#opportunity-subway-score-medium)';
      default:
        return 'url(#opportunity-subway-score-low)';
    }
  });

  readonly scoreLabel = computed(() => `${this.vm().score}%`);

  readonly distanceLabel = computed(() => {
    const distance = this.vm().distanceKm;
    if (distance == null) {
      return null;
    }
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(distance) + ' km';
  });

  readonly lines = computed(() => this.vm().lines);

  protected emitViewSheet(): void {
    const vm = this.vm();
    this.viewSheet.emit({ matchId: vm.matchId, selection: vm.profileSelection });
  }

  protected emitConnect(): void {
    this.connect.emit(this.vm().matchId);
  }
}

export type { OpportunitySubwayStation as SubwayStation, OpportunitySubwayStationBadge as SubwayStationBadge };
