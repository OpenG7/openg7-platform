import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeroSectionComponent } from '@app/shared/components/hero/hero-section/hero-section.component';
import { NgxThreeGlobeComponent } from '@omnedia/ngx-three-globe';
import { StatMetric } from '@app/shared/components/hero/hero-stats/hero-stats.component';

@Component({
  selector: 'og7-home-hero-section',
  standalone: true,
  imports: [HeroSectionComponent, NgxThreeGlobeComponent],
  templateUrl: './home-hero-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/home/feature » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Home Hero Section ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HomeHeroSectionComponent gérée par le framework.
 */
export class HomeHeroSectionComponent {
  readonly stats = input.required<StatMetric[]>();
}

