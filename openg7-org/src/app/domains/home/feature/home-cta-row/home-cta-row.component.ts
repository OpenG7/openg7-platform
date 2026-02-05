import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-home-cta-row',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './home-cta-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCtaRowComponent {}
