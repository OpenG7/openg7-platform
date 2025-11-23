import { Injectable, Signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { RbacPolicyService, Role, Permission } from './rbac.policy';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/security ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Rbac Facade ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns RbacFacadeService gérée par le framework.
 */
export class RbacFacadeService {
  readonly role: Signal<Role>;
  readonly role$: Observable<Role>;
  readonly isPremiumSignal: Signal<boolean>;
  readonly isPremium$: Observable<boolean>;
  readonly permissions: Signal<readonly Permission[]>;
  readonly permissions$: Observable<readonly Permission[]>;

  constructor(private readonly policy: RbacPolicyService) {
    this.role = this.policy.role;
    this.role$ = toObservable(this.role);
    this.isPremiumSignal = this.policy.premium;
    this.isPremium$ = toObservable(this.isPremiumSignal);
    this.permissions = computed(() => this.policy.permissions());
    this.permissions$ = toObservable(this.permissions);
  }

  /**
   * Contexte : Called after authentication to align the RBAC store with the latest session data.
   * Raison d’être : Delegates context updates to the underlying policy service while exposing a facade-friendly API.
   * @param context Role and premium status coming from the authenticated user.
   * @returns void
   */
  setContext(context: { role: Role; isPremium: boolean }): void {
    this.policy.setContext(context);
  }

  /**
   * Contexte : Used by admin tools that impersonate different roles during testing.
   * Raison d’être : Provides a facade-level shortcut for updating only the role state.
   * @param role Role to set on the RBAC policy.
   * @returns void
   */
  setRole(role: Role): void {
    this.policy.setRole(role);
  }

  /**
   * Contexte : Accessed by guards and UI helpers that need synchronous role information.
   * Raison d’être : Surfaces the current role without exposing policy internals to feature code.
   * @returns The active role.
   */
  currentRole(): Role {
    return this.policy.currentRole();
  }

  /**
   * Contexte : Reused by permission guards, directives and analytics gating logic.
   * Raison d’être : Delegates to the policy while keeping the facade the single dependency in feature modules.
   * @param permission Permission identifier to evaluate.
   * @returns True when the permission is granted.
   */
  hasPermission(permission: string): boolean {
    return this.policy.hasPermission(permission);
  }

  /**
   * Contexte : Sugar for templates checking a single permission.
   * Raison d’être : Provides expressive alias mirroring familiar RBAC APIs.
   * @param permission Permission identifier to evaluate.
   * @returns True when the permission is granted.
   */
  can(permission: string): boolean {
    return this.hasPermission(permission);
  }

  /**
   * Contexte : Used by multi-permission guards requiring every capability.
   * Raison d’être : Aggregates multiple checks through the facade to keep consumers declarative.
   * @param permissions List of permissions to verify.
   * @returns True only if all permissions are granted.
   */
  canAll(permissions: readonly string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  /**
   * Contexte : Utilised by UI widgets that should render when at least one permission matches.
   * Raison d’être : Encapsulates the “any” evaluation pattern to avoid duplication in templates.
   * @param permissions List of permissions to test.
   * @returns True when at least one permission is granted.
   */
  canAny(permissions: readonly string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * Contexte : Accessed by paywalled sections to toggle premium-specific UI elements.
   * Raison d’être : Mirrors the policy’s premium flag through the facade API.
   * @returns True when the current user has premium entitlements.
   */
  isPremium(): boolean {
    return this.policy.isPremium();
  }

  /**
   * Contexte : Legacy helper kept for compatibility with older components checking premium availability.
   * Raison d’être : Delegates to {@link isPremium} to maintain backward-compatible API semantics.
   * @returns True when premium features are active for the current user.
   */
  isPremiumEnabled(): boolean {
    return this.policy.isPremium();
  }
}
