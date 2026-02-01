import { Injectable, inject } from '@angular/core';
import { HttpClientService } from '@app/core/http/http-client.service';
import { Observable } from 'rxjs';

import { Og7ImportedCompany } from './companies-import.models';

export interface CompaniesImportResponse {
  message?: string;
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
  importCompanies(companies: Og7ImportedCompany[]): Observable<void | CompaniesImportResponse> {
    return this.http.post<void | CompaniesImportResponse>('/api/import/companies', { companies });
  }
}
