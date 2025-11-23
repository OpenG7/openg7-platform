import { ensureLocale } from '../utils/seed-helpers';

export default async () => {
  await ensureLocale('fr');
  await ensureLocale('en');
};
