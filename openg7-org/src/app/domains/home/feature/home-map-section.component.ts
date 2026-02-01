import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-home-map-section',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './home-map-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/home/feature » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Home Map Section ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HomeMapSectionComponent gérée par le framework.
 */
export class HomeMapSectionComponent {}
