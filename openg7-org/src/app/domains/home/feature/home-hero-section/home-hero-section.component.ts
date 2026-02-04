import { NgComponentOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, Type, inject, input, signal } from '@angular/core';
import { HeroSectionComponent } from '@app/shared/components/hero/hero-section/hero-section.component';
import { StatMetric } from '@app/shared/components/hero/hero-stats/hero-stats.component';

@Component({
  selector: 'og7-home-hero-section',
  standalone: true,
  imports: [HeroSectionComponent, NgComponentOutlet],
  templateUrl: './home-hero-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/home/feature » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Home Hero Section ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HomeHeroSectionComponent gérée par le framework.
 */
export class HomeHeroSectionComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly stats = input.required<StatMetric[]>();
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly backdropComponent = signal<Type<unknown> | null>(null);

  constructor() {
    if (this.isBrowser) {
      void this.loadBackdrop();
    }
  }

  private async loadBackdrop(): Promise<void> {
    const module = await import('./home-hero-galaxy.client.component');
    this.backdropComponent.set(module.HomeHeroGalaxyClientComponent);
  }
}

