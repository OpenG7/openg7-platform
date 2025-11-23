import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'og7-quick-search-section-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-search-section-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/search/feature/quick-search-modal » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Quick Search Section Skeleton ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns QuickSearchSectionSkeletonComponent gérée par le framework.
 */
export class QuickSearchSectionSkeletonComponent {
  @Input() items = 3;

  get placeholders(): number[] {
    const length = Math.max(0, Math.floor(this.items));
    return Array.from({ length }, (_, index) => index);
  }
}
