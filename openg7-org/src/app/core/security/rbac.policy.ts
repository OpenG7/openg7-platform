import { Injectable, computed, signal } from '@angular/core';

export type Role = 'visitor' | 'editor' | 'admin';
export type Permission =
  | 'read'
  | 'write'
  | 'admin:settings'
  | 'premium:visibility'
  | 'premium:analytics'
  | '*';

type RolePolicy = Record<Role, readonly Permission[]>;

const ROLE_POLICY: RolePolicy = {
  visitor: ['read'],
  editor: ['read', 'write'],
  admin: ['*', 'admin:settings'],
};

const PREMIUM_POLICY: readonly Permission[] = ['premium:visibility', 'premium:analytics'];

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/security ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Rbac Policy ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns RbacPolicyService gérée par le framework.
 */
export class RbacPolicyService {
  private readonly roleSig = signal<Role>('visitor');
  private readonly premiumSig = signal<boolean>(false);

  readonly role = this.roleSig.asReadonly();
  readonly premium = this.premiumSig.asReadonly();
  private readonly permissionsSig = computed<readonly Permission[]>(() => {
    const base = ROLE_POLICY[this.roleSig()];
    const premium = this.premiumSig() ? PREMIUM_POLICY : [];
    return Array.from(new Set<Permission>([...base, ...premium]));
  });

  /**
   * Contexte : Checked by guards and facades when determining the visitor’s current role.
   * Raison d’être : Provides synchronous access to the latest role signal value.
   * @returns The active role resolved from policy state.
   */
  currentRole(): Role {
    return this.roleSig();
  }

  /**
   * Contexte : Used by RBAC consumers to decide whether premium-only features should be shown.
   * Raison d’être : Exposes the boolean premium flag maintained by the policy.
   * @returns True when the premium policy flag is active.
   */
  isPremium(): boolean {
    return this.premiumSig();
  }

  /**
   * Contexte : Called by authentication flows whenever a user signs in or changes role.
   * Raison d’être : Updates the internal role signal so dependent selectors react accordingly.
   * @param role The role to set on the policy.
   * @returns void
   */
  setRole(role: Role): void {
    this.roleSig.set(role);
  }

  /**
   * Contexte : Invoked after successful authentication to synchronise both role and premium context.
   * Raison d’être : Updates the policy signals in one call to avoid inconsistent intermediate states.
   * @param context Combined role and premium information extracted from the session.
   * @returns void
   */
  setContext(context: { role: Role; isPremium: boolean }): void {
    this.roleSig.set(context.role);
    this.premiumSig.set(context.isPremium);
  }

  /**
   * Contexte : Used by guards and analytics to retrieve the computed permission list for the active role.
   * Raison d’être : Returns the deduplicated set of permissions factoring in premium entitlements.
   * @returns Readonly array of permissions granted to the current user.
   */
  permissions(): readonly Permission[] {
    return this.permissionsSig();
  }

  /**
   * Contexte : Called by guards, directives and services checking feature-level access.
   * Raison d’être : Evaluates whether the current permission set includes a specific capability (respecting wildcard grants).
   * @param permission Permission identifier to test.
   * @returns True when the permission is granted.
   */
  hasPermission(permission: string): boolean {
    const permissions = this.permissionsSig();
    if (permissions.includes('*')) {
      return true;
    }
    return permissions.includes(permission as Permission);
  }
}
