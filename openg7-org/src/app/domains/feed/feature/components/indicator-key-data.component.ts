import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-indicator-key-data',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './indicator-key-data.component.html',
  styleUrl: './indicator-key-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorKeyDataComponent {
  readonly currentValueLabel = input.required<string>();
  readonly variationLabel = input.required<string>();
  readonly factors = input<readonly string[]>([]);
  readonly miniStatLabel = input.required<string>();
  readonly miniStatDelta = input.required<string>();
  readonly miniStatSeries = input<readonly number[]>([]);

  protected sparklinePoints(series: readonly number[]): string {
    if (!series.length) {
      return '';
    }
    const width = 220;
    const height = 72;
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
}
