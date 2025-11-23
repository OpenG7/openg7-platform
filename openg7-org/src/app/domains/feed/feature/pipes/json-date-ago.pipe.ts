import { Pipe, PipeTransform } from '@angular/core';

const SECONDS = 1;
const MINUTE = 60 * SECONDS;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

@Pipe({
  name: 'jsonDateAgo',
  standalone: true,
})
/**
 * Contexte : Utilisée dans les templates Angular du dossier « domains/feed/feature/pipes » pour transformer les données.
 * Raison d’être : Expose une transformation réutilisable liée à « Json Date Ago » dans les vues.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns JsonDateAgoPipe gérée par le framework.
 */
export class JsonDateAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const target = typeof value === 'string' ? new Date(value) : value;
    if (!(target instanceof Date) || Number.isNaN(target.getTime())) {
      return '';
    }
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
    if (!Number.isFinite(diffSeconds)) {
      return '';
    }
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    if (diffSeconds < MINUTE) {
      return formatter.format(-Math.max(diffSeconds, 1), 'second');
    }
    if (diffSeconds < HOUR) {
      return formatter.format(-Math.round(diffSeconds / MINUTE), 'minute');
    }
    if (diffSeconds < DAY) {
      return formatter.format(-Math.round(diffSeconds / HOUR), 'hour');
    }
    if (diffSeconds < WEEK) {
      return formatter.format(-Math.round(diffSeconds / DAY), 'day');
    }
    if (diffSeconds < MONTH) {
      return formatter.format(-Math.round(diffSeconds / WEEK), 'week');
    }
    if (diffSeconds < YEAR) {
      return formatter.format(-Math.round(diffSeconds / MONTH), 'month');
    }
    return formatter.format(-Math.round(diffSeconds / YEAR), 'year');
  }
}
