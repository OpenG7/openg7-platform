import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

export interface HeroCta {
  label: string;
  trackingType: string;
  routerLink?: string | any[];
  href?: string;
  ariaLabel?: string;
}

export interface HeroCtaClickEvent {
  cta: HeroCta;
  trackingType: string;
  event: MouseEvent;
}

@Component({
  selector: 'og7-hero-ctas',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule],
  templateUrl: './hero-ctas.component.html',
  host: {
    class: 'hero-ctas',
    style: 'display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;',
  },
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/hero » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Hero Ctas ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HeroCtasComponent gérée par le framework.
 */
export class HeroCtasComponent {
  @Input() primaryCta: HeroCta | null = {
    label: 'hero.actions.registerCompany',
    routerLink: '/register',
    trackingType: 'hero-primary',
  };

  @Input() secondaryCta: HeroCta | null = {
    label: 'hero.actions.viewSectors',
    href: '#map',
    trackingType: 'hero-secondary',
  };

  @Output() readonly ctaClicked = new EventEmitter<HeroCtaClickEvent>();

  onCtaClick(event: MouseEvent, cta: HeroCta): void {
    this.ctaClicked.emit({ cta, trackingType: cta.trackingType, event });
  }
}
