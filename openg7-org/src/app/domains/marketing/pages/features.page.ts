import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'og7-features-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './features.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Features » du dossier « domains/marketing/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FeaturesPage gérée par le framework.
 */
export class FeaturesPage {}
