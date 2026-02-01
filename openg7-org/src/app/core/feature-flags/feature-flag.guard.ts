import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { FEATURE_FLAGS, FeatureFlags } from '../config/environment.tokens';

type FeatureFlagKey = Extract<keyof FeatureFlags, string>;

function isFlagEnabled(flag: FeatureFlagKey): boolean {
  const flags = inject(FEATURE_FLAGS, { optional: true });
  if (!flags) {
    return false;
  }

  return flags[flag] === true;
}

/**
 * Contexte : Applied to routes gated behind experimental or premium feature flags.
 * Raison d’être : Checks the runtime feature flag value and redirects to an access-denied page when disabled.
 * @param flag Identifier of the feature flag required by the route.
 * @returns Angular CanMatch function enforcing the flag.
 */
export function featureFlagGuard(flag: FeatureFlagKey): CanMatchFn {
  return () => {
    if (isFlagEnabled(flag)) {
      return true;
    }

    return inject(Router).createUrlTree(['/access-denied']);
  };
}
