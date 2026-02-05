import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JsonDateAgoPipe } from '@app/domains/feed/feature/pipes/json-date-ago.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-home-metrics-strip',
  standalone: true,
  imports: [CommonModule, TranslateModule, JsonDateAgoPipe],
  templateUrl: './home-metrics-strip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMetricsStripComponent {
  readonly intrantsValue = input.required<string>();
  readonly offersCount = input.required<string>();
  readonly activeCount = input.required<string>();
  readonly requestsCount = input.required<string>();
  readonly corridorsCount = input.required<string>();
  readonly lastFeedUpdate = input.required<string | null>();
  readonly systemStatusKey = input.required<string>();
  readonly systemStatusDotClass = input.required<string>();
}
