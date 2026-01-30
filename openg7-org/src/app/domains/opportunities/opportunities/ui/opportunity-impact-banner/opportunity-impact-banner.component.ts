import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface OpportunityImpactBannerKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface OpportunityImpactBannerVm {
  readonly id: string;
  readonly matchId: string;
  readonly title: string;
  readonly scorePercent: number; // 0..100
  readonly buyerName: string;
  readonly supplierName: string;
  readonly impactHeadline: string;
  readonly impactFootnote?: string | null;
  readonly supportingKpis: ReadonlyArray<OpportunityImpactBannerKpi>;
  readonly ctaLabel: string;
}

@Component({
  selector: 'og7-opportunity-impact-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './opportunity-impact-banner.component.html',
  styleUrl: './opportunity-impact-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/opportunities/opportunities/ui/opportunity-impact-banner » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Opportunity Impact Banner ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunityImpactBannerComponent gérée par le framework.
 */
export class OpportunityImpactBannerComponent {
  readonly vm = input.required<OpportunityImpactBannerVm>();
  readonly connect = output<string>();

  readonly titleId = computed(() => `opportunity-impact-banner-title-${this.vm().id}`);
  readonly summaryId = computed(() => `opportunity-impact-banner-summary-${this.vm().id}`);
  readonly partnersLabel = computed(() => `${this.vm().buyerName} ↔ ${this.vm().supplierName}`);

  readonly scoreLabel = computed(() => `${this.vm().scorePercent}%`);

  readonly scoreTone = computed<'high' | 'medium' | 'low'>(() => {
    const score = this.vm().scorePercent;
    if (score >= 85) {
      return 'high';
    }
    if (score >= 70) {
      return 'medium';
    }
    return 'low';
  });

  readonly hasFootnote = computed(() => Boolean(this.vm().impactFootnote));
  readonly hasKpis = computed(() => this.vm().supportingKpis.length > 0);

  protected trackByKpiId(_index: number, kpi: OpportunityImpactBannerKpi): string {
    return kpi.id;
  }

  protected emitConnect(): void {
    this.connect.emit(this.vm().matchId);
  }
}
