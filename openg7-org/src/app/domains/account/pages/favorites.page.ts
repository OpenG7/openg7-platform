import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FavoritesService } from '@app/core/favorites.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'og7-favorites-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './favorites.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Favorites » du dossier « domains/account/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FavoritesPage gérée par le framework.
 */
export class FavoritesPage {
  private readonly favorites = inject(FavoritesService);

  readonly loading = this.favorites.loading;
  readonly favoritesList = computed(() => this.favorites.list());
  readonly hasFavorites = computed(() => this.favoritesList().length > 0);

  constructor() {
    this.favorites.refresh();
  }
}
