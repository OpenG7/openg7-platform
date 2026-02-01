import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CompanyRecord, CompanyService, CompanyStatus } from '@app/core/services/company.service';
import { TranslateModule } from '@ngx-translate/core';

import { CompanyDetailComponent } from './company-detail.component';

const STATUS_LABELS: Record<CompanyStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  suspended: 'Suspended',
};

@Component({
  selector: '[data-og7="company-table"]',
  standalone: true,
  imports: [CommonModule, TranslateModule, CompanyDetailComponent],
  templateUrl: './company-table.component.html',
  host: {
    class: 'block w-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/company » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Company Table ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns CompanyTableComponent gérée par le framework.
 */
export class CompanyTableComponent implements OnInit {
  private readonly companyService = inject(CompanyService);

  protected readonly companies = this.companyService.companies();
  protected readonly loading = this.companyService.loading();
  protected readonly error = this.companyService.error();
  protected readonly selected = signal<CompanyRecord | null>(null);

  ngOnInit(): void {
    this.companyService.loadCompanies();
  }

  selectCompany(company: CompanyRecord): void {
    this.selected.set(company);
  }

  statusLabel(status: CompanyStatus): string {
    return STATUS_LABELS[status] ?? status;
  }
}
