import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxThreeGlobeComponent } from '@omnedia/ngx-three-globe';

@Component({
  selector: 'og7-home-hero-galaxy',
  standalone: true,
  imports: [NgxThreeGlobeComponent],
  templateUrl: './home-hero-galaxy.client.component.html',
  styleUrls: ['./home-hero-galaxy.client.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroGalaxyClientComponent {}
