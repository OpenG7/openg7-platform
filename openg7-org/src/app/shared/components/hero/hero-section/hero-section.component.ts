import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HeroCopyComponent } from '../hero-copy/hero-copy.component';
import { HeroCtasComponent } from '../hero-ctas/hero-ctas.component';
import { HeroStatsComponent, StatMetric } from '../hero-stats/hero-stats.component';
import { TranslateModule } from '@ngx-translate/core';

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

  readonly heroStats = computed<StatMetric[]>(() => {
    const labels: Record<StatMetric['id'], string> = {
      tradeValue: 'hero.stats.listedInputs',
      exchangeQty: 'hero.stats.activeRequests',
      sectors: 'hero.stats.transportCapacity',
    };

    return this.stats().map((stat) => ({
      ...stat,
      labelKey: labels[stat.id] ?? stat.labelKey,
    }));
  });
}
