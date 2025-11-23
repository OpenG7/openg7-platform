import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyCapacity, CompanyRecord, CompanyStatus } from '@app/core/services/company.service';

const STATUS_LABELS: Record<CompanyStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  suspended: 'Suspended',
};

@Component({
  selector: '[data-og7="company-detail"]',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './company-detail.component.html',
  host: {
    class: 'block w-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/company » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Company Detail ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns CompanyDetailComponent gérée par le framework.
 */
export class CompanyDetailComponent {
  private readonly companySignal = signal<CompanyRecord | null>(null);

  protected readonly company = this.companySignal.asReadonly();

  @Input()
  set company(value: CompanyRecord | null) {
    this.companySignal.set(value);
  }

  statusLabel(status: CompanyStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  trackCapacity(index: number, capacity: CompanyCapacity): string {
    return `${capacity.label}-${index}`;
  }

  normalizeWebsite(url: string): string {
    if (!url) {
      return '#';
    }
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return `https://${url}`;
  }
}
