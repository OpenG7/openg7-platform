import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { IndicatorRelatedEntry } from './indicator-detail.models';

@Component({
  selector: 'og7-indicator-related-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './indicator-related-list.component.html',
  styleUrl: './indicator-related-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorRelatedListComponent {
  readonly title = input.required<string>();
  readonly entries = input<readonly IndicatorRelatedEntry[]>([]);
  readonly containerHook = input.required<string>();
  readonly footerLabelKey = input('feed.indicator.detail.related.viewDetails');

  readonly openEntry = output<IndicatorRelatedEntry>();
  readonly openFooter = output<void>();

  protected sparklinePoints(series: readonly number[]): string {
    if (!series.length) {
      return '';
    }
    const width = 94;
    const height = 28;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = Math.max(max - min, 0.001);
    const denominator = Math.max(series.length - 1, 1);
    return series
      .map((value, index) => {
        const x = (index / denominator) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }

  protected trackEntry(index: number, entry: IndicatorRelatedEntry): string {
    return entry.id ?? `entry-${index}`;
  }
}
