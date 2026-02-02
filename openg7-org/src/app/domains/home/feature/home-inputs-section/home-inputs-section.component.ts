import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface InputCard {
  readonly id: string;
  readonly icon: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
}

const INPUT_CARDS: readonly InputCard[] = [
  {
    id: 'electricity',
    icon: '\u26A1',
    titleKey: 'home.inputs.cards.electricity.title',
    descriptionKey: 'home.inputs.cards.electricity.description',
  },
  {
    id: 'oil',
    icon: '\uD83D\uDEE2\uFE0F',
    titleKey: 'home.inputs.cards.oil.title',
    descriptionKey: 'home.inputs.cards.oil.description',
  },
  {
    id: 'services',
    icon: '\uD83E\uDDF0',
    titleKey: 'home.inputs.cards.services.title',
    descriptionKey: 'home.inputs.cards.services.description',
  },
  {
    id: 'workforce',
    icon: '\uD83E\uDDD1\u200D\uD83C\uDFED',
    titleKey: 'home.inputs.cards.workforce.title',
    descriptionKey: 'home.inputs.cards.workforce.description',
  },
  {
    id: 'materials',
    icon: '\uD83E\uDDF1',
    titleKey: 'home.inputs.cards.materials.title',
    descriptionKey: 'home.inputs.cards.materials.description',
  },
];

@Component({
  selector: 'og7-home-inputs-section',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-inputs-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : AffichÃ©e dans les vues du dossier Â« domains/home/feature Â» en tant que composant Angular standalone.
 * Raison dâ€™Ãªtre : Encapsule l'interface utilisateur et la logique propre Ã  Â« Home Inputs Section Â».
 * @param dependencies DÃ©pendances injectÃ©es automatiquement par Angular.
 * @returns HomeInputsSectionComponent gÃ©rÃ©e par le framework.
 */
export class HomeInputsSectionComponent {
  protected readonly cards = INPUT_CARDS;
}
