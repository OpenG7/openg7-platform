import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { HeroCopyComponent } from './hero-copy.component';
import { HeroCtasComponent } from './hero-ctas.component';
import { HeroStatsComponent, StatMetric } from './hero-stats.component';

@Component({
  selector: 'og7-hero-section',
  standalone: true,
  imports: [HeroCopyComponent, HeroCtasComponent, HeroStatsComponent, TranslateModule],
  templateUrl: './hero-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/hero » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Hero Section ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HeroSectionComponent gérée par le framework.
 */
export class HeroSectionComponent {
  readonly stats = input.required<StatMetric[]>();
}
