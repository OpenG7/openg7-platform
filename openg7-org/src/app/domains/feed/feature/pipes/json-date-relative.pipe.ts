import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonDateRelative',
  standalone: true,
})
/**
 * Contexte : Utilisée dans les templates Angular du dossier « domains/feed/feature/pipes » pour transformer les données.
 * Raison d’être : Expose une transformation réutilisable liée à « Json Date Relative » dans les vues.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns JsonDateRelativePipe gérée par le framework.
 */
export class JsonDateRelativePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, locale?: string): string {
    if (!value) {
      return '';
    }
    const target = typeof value === 'string' ? new Date(value) : value;
    if (!(target instanceof Date) || Number.isNaN(target.getTime())) {
      return '';
    }
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (Math.abs(diffDays) <= 1) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(diffDays, 'day');
    }
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(target);
  }
}
