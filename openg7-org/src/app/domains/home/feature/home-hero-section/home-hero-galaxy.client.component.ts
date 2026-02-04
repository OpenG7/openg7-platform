import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxGalaxyComponent } from '@omnedia/ngx-galaxy';
import { NgxThreeGlobeComponent } from '@omnedia/ngx-three-globe';

@Component({
  selector: 'og7-home-hero-galaxy',
  standalone: true,
  imports: [NgxGalaxyComponent, NgxThreeGlobeComponent],
  templateUrl: './home-hero-galaxy.client.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroGalaxyClientComponent {}
