import { Injectable, inject } from '@angular/core';
import { RbacFacadeService } from '@app/core/security/rbac.facade';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Centralise les règles d’accès pour le module Importation.
 * Raison d’être : Fournit des helpers synchrones pour conditionner l’UI et les appels API.
 * @returns ImportationPermissionsService géré par le framework.
 */
export class ImportationPermissionsService {
  private readonly rbac = inject(RbacFacadeService);

  canViewCollaboration(): boolean {
    return this.rbac.hasPermission('read');
  }

  canManageWatchlists(): boolean {
    return this.rbac.hasPermission('write');
  }

  canScheduleReports(): boolean {
    return this.rbac.isPremium();
  }

  canExportData(): boolean {
    return this.rbac.hasPermission('write') || this.rbac.isPremium();
  }
}
