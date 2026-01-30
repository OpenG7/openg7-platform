import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PartnerSelection } from '@app/core/models/partner-selection';
import { TranslateModule } from '@ngx-translate/core';

import { OpportunityViewSheetPayload } from '../opportunity-view-sheet-payload';

interface OpportunityRadarActor {
  readonly name: string;
  readonly provinceLabelKey: string;
  readonly sectorLabelKey: string;
  readonly logoUrl?: string | null;
}

interface OpportunityRadarAxis {
  readonly id: 'price' | 'delay' | 'capacity' | 'footprint' | 'proximity' | (string & {});
  readonly labelKey: string;
  readonly value: number; // 0..100
  readonly detail?: string;
}

export interface OpportunityRadarVm {
  readonly id: string;
  readonly matchId: string;
  readonly title: string;
  readonly score: number; // 0..100
  readonly buyer: OpportunityRadarActor;
  readonly supplier: OpportunityRadarActor;
  readonly axes: ReadonlyArray<OpportunityRadarAxis>;
  readonly profileSelection: PartnerSelection;
}

@Component({
  selector: 'og7-opportunity-radar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './opportunity-radar.component.html',
  styleUrl: './opportunity-radar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/opportunities/opportunities/ui/opportunity-radar » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Opportunity Radar ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunityRadarComponent gérée par le framework.
 */
export class OpportunityRadarComponent {
  readonly vm = input.required<OpportunityRadarVm>();
  readonly viewSheet = output<OpportunityViewSheetPayload>();
  readonly connect = output<string>();

  private readonly scoreCircumference = 2 * Math.PI * 28;
  private readonly chartCenter = 60;
  private readonly chartRadius = 50;

  readonly titleId = computed(() => `opportunity-radar-title-${this.vm().id}`);
  readonly scoreId = computed(() => `opportunity-radar-score-${this.vm().id}`);

  readonly scoreTone = computed<'high' | 'medium' | 'low'>(() => {
    const value = this.vm().score;
    if (value >= 85) {
      return 'high';
    }
    if (value >= 70) {
      return 'medium';
    }
    return 'low';
  });

  readonly scoreStrokeDashoffset = computed(() => {
    const bounded = Math.max(0, Math.min(100, this.vm().score));
    const ratio = bounded / 100;
    const offset = this.scoreCircumference - ratio * this.scoreCircumference;
    return offset.toFixed(2);
  });

  readonly scoreStroke = computed(() => {
    switch (this.scoreTone()) {
      case 'high':
        return 'url(#opportunity-radar-score-high)';
      case 'medium':
        return 'url(#opportunity-radar-score-medium)';
      default:
        return 'url(#opportunity-radar-score-low)';
    }
  });

  readonly scoreLabel = computed(() => `${this.vm().score}%`);

  readonly axes = computed(() => this.vm().axes);
  readonly axisCount = computed(() => Math.max(3, this.axes().length));
  readonly angleStep = computed(() => (Math.PI * 2) / this.axisCount());

  readonly gridPolygons = computed(() => {
    const levels = [0.25, 0.5, 0.75, 1];
    return levels.map((level) => this.buildPolygon(level));
  });

  readonly axisGeometry = computed(() =>
    this.axes().map((axis, index) => {
      const angle = this.resolveAngle(index);
      const x = this.chartCenter + Math.cos(angle) * this.chartRadius;
      const y = this.chartCenter + Math.sin(angle) * this.chartRadius;
      const labelX = this.chartCenter + Math.cos(angle) * (this.chartRadius + 16);
      const labelY = this.chartCenter + Math.sin(angle) * (this.chartRadius + 16);
      const point = this.pointForValue(axis.value, index);
      return {
        id: axis.id,
        labelKey: axis.labelKey,
        value: axis.value,
        detail: axis.detail,
        line: { x2: x, y2: y },
        point,
        label: { x: labelX, y: labelY },
      };
    }),
  );

  readonly polygonPoints = computed(() =>
    this.axes()
      .map((axis, index) => {
        const point = this.pointForValue(axis.value, index);
        return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(' '),
  );

  protected emitViewSheet(): void {
    const vm = this.vm();
    this.viewSheet.emit({ matchId: vm.matchId, selection: vm.profileSelection });
  }

  protected emitConnect(): void {
    this.connect.emit(this.vm().matchId);
  }

  private buildPolygon(level: number): string {
    return this.axes()
      .map((_, index) => {
        const angle = this.resolveAngle(index);
        const x = this.chartCenter + Math.cos(angle) * this.chartRadius * level;
        const y = this.chartCenter + Math.sin(angle) * this.chartRadius * level;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  private resolveAngle(index: number): number {
    return -Math.PI / 2 + index * this.angleStep();
  }

  private pointForValue(value: number, index: number) {
    const clamped = Math.max(0, Math.min(100, value));
    const ratio = clamped / 100;
    const angle = this.resolveAngle(index);
    return {
      x: this.chartCenter + Math.cos(angle) * this.chartRadius * ratio,
      y: this.chartCenter + Math.sin(angle) * this.chartRadius * ratio,
    };
  }
}

export type { OpportunityRadarAxis };
