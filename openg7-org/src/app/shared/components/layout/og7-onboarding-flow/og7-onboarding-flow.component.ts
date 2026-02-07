import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'og7-onboarding-flow',
  standalone: true,
  templateUrl: './og7-onboarding-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/layout » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Onboarding Flow ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7OnboardingFlowComponent gérée par le framework.
 */
export class Og7OnboardingFlowComponent {}
