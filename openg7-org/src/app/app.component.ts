import { Component, Type, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { SiteHeaderComponent } from '@app/shared/components/layout/site-header.component';
import { UnderConstructionBannerComponent } from '@app/shared/components/layout/under-construction-banner.component';
import { Og7OnboardingFlowComponent } from '@app/shared/components/layout/og7-onboarding-flow.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Og7ModalContainerComponent } from './core/ui/modal/og7-modal-container.component';
import { CtrlKDirective } from '@app/shared/directives/ctrl-k.directive';
import { GlobalShortcutsService } from './core/shortcuts/global-shortcuts.service';
import { FEATURE_FLAGS } from './core/config/environment.tokens';

@Component({
  selector: 'og7-shell-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    SiteHeaderComponent,
    UnderConstructionBannerComponent,
    Og7OnboardingFlowComponent,
    Og7ModalContainerComponent,
    RouterLink,
    TranslateModule,
    CtrlKDirective,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
/**
 * Contexte : Affichée dans les vues du dossier « openg7-org/src/app » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « App ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns AppComponent gérée par le framework.
 */
export class AppComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly globalShortcuts = inject(GlobalShortcutsService);
  private readonly featureFlags = inject(FEATURE_FLAGS);

  readonly componentLabComponent = signal<Type<unknown> | null>(null);

  readonly isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  readonly currentYear = new Date().getFullYear();

  constructor() {
    void this.globalShortcuts;
    void this.loadComponentLabIfEnabled();
  }

  private async loadComponentLabIfEnabled(): Promise<void> {
    if (!this.featureFlags?.['componentLab']) {
      return;
    }

    const component = await import(
      '@app/domains/developer/pages/component-lab/og7-component-lab-page.component'
    ).then((m) => m.Og7ComponentLabPageComponent);

    this.componentLabComponent.set(component);
  }
}
