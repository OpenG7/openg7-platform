import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { COMPANY_STATUSES, CompanyRecord, CompanyService, CompanyStatus } from '@app/core/services/company.service';
import { injectNotificationStore } from '@app/core/observability/notification.store';

const STATUS_LABELS: Record<CompanyStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  suspended: 'Suspended',
};

@Component({
  standalone: true,
  selector: 'og7-admin-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Admin » du dossier « domains/admin/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns AdminPage gérée par le framework.
 */
export class AdminPage implements OnInit {
  private readonly service = inject(CompanyService);
  private readonly notifications = injectNotificationStore();

  protected readonly companies = this.service.companies();
  protected readonly loading = this.service.loading();
  protected readonly error = this.service.error();
  protected readonly statuses = COMPANY_STATUSES;
  protected readonly updating = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.service.loadCompanies({ status: 'all' });
  }

  statusLabel(status: CompanyStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  isUpdating(id: number): boolean {
    return Boolean(this.updating()[id]);
  }

  onStatusChange(company: CompanyRecord, event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    const rawStatus = target?.value ?? 'pending';
    if (rawStatus !== 'approved' && rawStatus !== 'pending' && rawStatus !== 'suspended') {
      return;
    }
    const status = rawStatus as CompanyStatus;
    if (status === company.status) {
      return;
    }
    this.setUpdating(company.id, true);
    this.service.updateStatus(company.id, status).subscribe({
      next: () => {
        this.notifications.success('Company status updated.', {
          source: 'admin',
          metadata: { companyId: company.id, status },
        });
        this.setUpdating(company.id, false);
      },
      error: () => {
        this.notifications.error('Failed to update status.', {
          source: 'admin',
          metadata: { companyId: company.id, status },
          deliver: { email: true },
        });
        this.setUpdating(company.id, false);
      },
    });
  }

  resolveError(message: string | null): string {
    if (!message) {
      return 'An unexpected error occurred while loading companies.';
    }
    if (message === 'company.error.load') {
      return 'Unable to load companies from the API.';
    }
    return message;
  }

  private setUpdating(id: number, value: boolean): void {
    const next = { ...this.updating() };
    if (value) {
      next[id] = true;
    } else {
      delete next[id];
    }
    this.updating.set(next);
  }
}
