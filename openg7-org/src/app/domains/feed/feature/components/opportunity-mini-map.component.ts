import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-feed-opportunity-mini-map',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './opportunity-mini-map.component.html',
  styleUrl: './opportunity-mini-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityMiniMapComponent {
  readonly fromLabel = input.required<string>();
  readonly toLabel = input.required<string>();
  readonly capacityMw = input.required<number>();
  readonly connected = input(true);
  readonly lastUpdatedLabel = input('');
}
