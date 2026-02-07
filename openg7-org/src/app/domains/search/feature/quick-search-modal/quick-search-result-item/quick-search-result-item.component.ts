import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SearchItem } from '@app/core/models/search';

@Component({
  selector: 'og7-quick-search-result-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-search-result-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/search/feature/quick-search-modal » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Quick Search Result Item ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns QuickSearchResultItemComponent gérée par le framework.
 */
export class QuickSearchResultItemComponent {
  @Input({ required: true }) item!: SearchItem;
  @Input() active = false;
}
