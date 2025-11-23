import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-under-construction-banner',
  standalone: true,
  imports: [NgIf, TranslateModule],
  templateUrl: './under-construction-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/layout » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Under Construction Banner ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns UnderConstructionBannerComponent gérée par le framework.
 */
export class UnderConstructionBannerComponent {
  readonly dismissible = input(true);

  protected readonly hidden = signal(false);
  protected readonly titleId = 'under-construction-banner-title';
  protected readonly descriptionId = 'under-construction-banner-description';

  protected dismiss(): void {
    if (!this.dismissible()) {
      return;
    }

    this.hidden.set(true);
  }
}
