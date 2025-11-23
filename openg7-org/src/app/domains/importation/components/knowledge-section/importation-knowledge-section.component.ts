import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImportationKnowledgeSectionViewModel } from '../../models/importation.models';

@Component({
  standalone: true,
  selector: 'og7-importation-knowledge-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './importation-knowledge-section.component.html',
  styleUrls: ['./importation-knowledge-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affiche les contenus de connaissance et la carte CTA.
 * Raison d’être : Donne accès aux articles Strapi et au call-to-action d’enrichissement.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ImportationKnowledgeSectionComponent géré par le framework.
 */
export class ImportationKnowledgeSectionComponent {
  @Input({ required: true }) viewModel!: ImportationKnowledgeSectionViewModel;

  trackArticle = (_: number, article: { id: string }) => article.id;
}
