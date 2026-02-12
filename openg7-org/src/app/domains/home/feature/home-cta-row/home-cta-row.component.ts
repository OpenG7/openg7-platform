import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-home-cta-row',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './home-cta-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCtaRowComponent {}
