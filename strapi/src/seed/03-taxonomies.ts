import { ensureLocale, upsertByUID } from '../utils/seed-helpers';

const provinces = [
  { slug: 'ab', name: { en: 'Alberta', fr: 'Alberta' } },
  { slug: 'bc', name: { en: 'British Columbia', fr: 'Colombie-Britannique' } },
  { slug: 'mb', name: { en: 'Manitoba', fr: 'Manitoba' } },
  { slug: 'nb', name: { en: 'New Brunswick', fr: 'Nouveau-Brunswick' } },
  { slug: 'nl', name: { en: 'Newfoundland and Labrador', fr: 'Terre-Neuve-et-Labrador' } },
  { slug: 'ns', name: { en: 'Nova Scotia', fr: 'Nouvelle-Écosse' } },
  { slug: 'nt', name: { en: 'Northwest Territories', fr: 'Territoires du Nord-Ouest' } },
  { slug: 'nu', name: { en: 'Nunavut', fr: 'Nunavut' } },
  { slug: 'on', name: { en: 'Ontario', fr: 'Ontario' } },
  { slug: 'pe', name: { en: 'Prince Edward Island', fr: 'Île-du-Prince-Édouard' } },
  { slug: 'qc', name: { en: 'Quebec', fr: 'Québec' } },
  { slug: 'sk', name: { en: 'Saskatchewan', fr: 'Saskatchewan' } },
  { slug: 'yt', name: { en: 'Yukon', fr: 'Yukon' } },
];

const sectors = [
  { slug: 'energy', name: { en: 'Energy', fr: 'Énergie' } },
  { slug: 'agriculture', name: { en: 'Agriculture', fr: 'Agriculture' } },
  { slug: 'manufacturing', name: { en: 'Manufacturing', fr: 'Manufacturier' } },
  { slug: 'technology', name: { en: 'Technology', fr: 'Technologie' } },
];

export default async () => {
  await ensureLocale('fr');
  await ensureLocale('en');

  for (const province of provinces) {
    await upsertByUID('api::province.province', province);
  }

  for (const sector of sectors) {
    await upsertByUID('api::sector.sector', sector);
  }
};
