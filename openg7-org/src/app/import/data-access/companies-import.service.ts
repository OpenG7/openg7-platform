import { Injectable, inject } from '@angular/core';
import { HttpClientService } from '@app/core/http/http-client.service';
import { Observable } from 'rxjs';

import { Og7ImportedCompany } from './companies-import.models';

export interface CompaniesImportResponse {
  data: {
    received: number;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: ReadonlyArray<{
      index: number;
      businessId: string | null;
      reason: string;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class CompaniesImportService {
  private readonly http = inject(HttpClientService);

  /**
   * Contexte : Les entreprises importées alimenteront ensuite la couche `map/companies` de la carte OpenG7 côté front.
   * Raison d’être : Transmettre les entreprises validées au backend OpenG7 via l’API dédiée.
   * @param companies Entreprises validées prêtes pour intégration dans l’écosystème OpenG7.
   * @returns Observable résolu lorsque l’API confirme la réception.
   */
  importCompanies(companies: Og7ImportedCompany[]): Observable<CompaniesImportResponse> {
    return this.http.post<CompaniesImportResponse>('/api/import/companies', { companies });
  }
}
