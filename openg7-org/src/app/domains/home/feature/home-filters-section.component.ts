import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalFiltersComponent } from '@app/shared/components/filters/global-filters.component';

@Component({
  selector: 'og7-home-filters-section',
  standalone: true,
  imports: [CommonModule, TranslateModule, GlobalFiltersComponent],
  templateUrl: './home-filters-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/home/feature » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Home Filters Section ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HomeFiltersSectionComponent gérée par le framework.
 */
export class HomeFiltersSectionComponent {}
