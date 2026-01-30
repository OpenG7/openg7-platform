import { computed, inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';

import { AuthRedirectService } from './auth-redirect.service';
import { AuthService } from './auth.service';

const auth = () => inject(AuthService);

/**
 * Contexte : Observed by route components displaying guard outcomes (e.g. login prompts).
 * Raison d’être : Exposes a reactive signal mirroring the authentication guard decision.
 * @returns True when the current user session is authenticated.
 */
export const isAllowedSig = computed(() => auth().isAuthenticated());

/**
 * Contexte : Consumed by UI elements to show the rejection reason when navigation is blocked.
 * Raison d’être : Provides a translated reason key for the last guard evaluation.
 * @returns Translation key explaining why access was denied or null when allowed.
 */
export const reasonSig = computed(() => (isAllowedSig() ? null : 'auth.required'));

/**
 * Contexte : Attached to protected routes that require an authenticated session.
 * Raison d’être : Redirects anonymous users to the login page while exposing reactive guard state.
 * @param route Route definition invoking the guard.
 * @param segments Attempted URL segments.
 * @returns True to continue navigation or a UrlTree redirecting to login.
 */
export const authGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  if (isAllowedSig()) {
    return true;
  }

  const router = inject(Router);
  const redirect = inject(AuthRedirectService);
  const navigation = router.getCurrentNavigation();
  const target =
    navigation?.finalUrl?.toString() ??
    navigation?.extractedUrl?.toString() ??
    `/${segments.map((segment) => segment.path).join('/')}`;

  redirect.setRedirectUrl(target);

  const queryParams = target ? { redirect: target } : undefined;

  return router.createUrlTree(['/login'], { queryParams });
};
