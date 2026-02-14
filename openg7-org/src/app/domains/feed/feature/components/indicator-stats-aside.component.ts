import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { IndicatorStatEntry } from './indicator-detail.models';

@Component({
  selector: 'og7-indicator-stats-aside',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './indicator-stats-aside.component.html',
  styleUrl: './indicator-stats-aside.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorStatsAsideComponent {
  readonly stats = input<readonly IndicatorStatEntry[]>([]);
  readonly openDetails = output<void>();

  protected sparklinePoints(series: readonly number[]): string {
    if (!series.length) {
      return '';
    }
    const width = 128;
    const height = 36;
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

  protected trackStat(index: number, stat: IndicatorStatEntry): string {
    return stat.id || `stat-${index}`;
  }
}
