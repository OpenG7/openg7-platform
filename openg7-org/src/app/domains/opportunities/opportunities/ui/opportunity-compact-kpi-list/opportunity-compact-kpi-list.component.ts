import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface OpportunityCompactKpiListVm {
  readonly id: string;
  readonly items: readonly OpportunityCompactKpiItemVm[];
}

export interface OpportunityCompactKpiItemVm {
  readonly id: string;
  readonly sectorIcon: string;
  readonly sectorLabelKey: string;
  readonly buyerName: string;
  readonly supplierName: string;
  readonly scorePercent: number;
  readonly scoreTone: 'high' | 'medium' | 'low';
  readonly distanceLabel: string;
  readonly distancePending: boolean;
  readonly matchId: string;
}

@Component({
  selector: 'og7-opportunity-compact-kpi-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './opportunity-compact-kpi-list.component.html',
  styleUrl: './opportunity-compact-kpi-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/opportunities/opportunities/ui/opportunity-compact-kpi-list » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Opportunity Compact Kpi List ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunityCompactKpiListComponent gérée par le framework.
 */
export class OpportunityCompactKpiListComponent {
  readonly vm = input.required<OpportunityCompactKpiListVm>();
  readonly connect = output<string>();

  protected trackByItemId(index: number, item: OpportunityCompactKpiItemVm): string {
    return item.id;
  }

  protected requestConnect(matchId: string): void {
    this.connect.emit(matchId);
  }
}
