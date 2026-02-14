import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { OpportunityAlertItem, OpportunityIndicator } from './opportunity-detail.models';
import { OpportunityMiniMapComponent } from './opportunity-mini-map.component';

@Component({
  selector: 'og7-opportunity-context-aside',
  standalone: true,
  imports: [CommonModule, TranslateModule, OpportunityMiniMapComponent],
  templateUrl: './opportunity-context-aside.component.html',
  styleUrl: './opportunity-context-aside.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityContextAsideComponent {
  readonly capacityMw = input.required<number>();
  readonly fromLabel = input.required<string>();
  readonly toLabel = input.required<string>();
  readonly connected = input(true);
  readonly lastUpdatedLabel = input('');
  readonly indicators = input<readonly OpportunityIndicator[]>([]);
  readonly alerts = input<readonly OpportunityAlertItem[]>([]);

  readonly openAlerts = output<void>();
}
