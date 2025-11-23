import { upsertByUID, ensureLocale, ensureRole } from '../utils/seed-helpers';

export default async () => {
  await ensureLocale('en');
  await ensureLocale('fr');

  const projects = [
    {
      slug: 'canal-expansion',
      title: { en: 'Canal Expansion', fr: 'Expansion du canal' },
      country: 'CA',
      description: { en: 'Expansion of canal in Canada', fr: 'Expansion du canal au Canada' },
      impactOnShipping: { increase: 10, unit: '%' },
      highlight: true,
    },
    {
      slug: 'high-speed-rail',
      title: { en: 'High-Speed Rail', fr: 'Train à grande vitesse' },
      country: 'US',
      description: { en: 'Rail project in the United States', fr: 'Projet ferroviaire aux États-Unis' },
      impactOnShipping: { decrease: 5, unit: '%' },
      highlight: false,
    },
    {
      slug: 'port-modernization',
      title: { en: 'Port Modernization', fr: 'Modernisation du port' },
      country: 'FR',
      description: { en: 'Modernization of major port in France', fr: 'Modernisation d\'un port majeur en France' },
      impactOnShipping: { increase: 7, unit: '%' },
      highlight: true,
    }
  ];

  for (const project of projects) {
    await upsertByUID('api::national-project.national-project', project);
  }

  const publicRole = await ensureRole('Public');
  const roleService = strapi.service('plugin::users-permissions.role');
  await roleService.updateRolePermissions(publicRole.id, {
    'api::national-project.national-project': {
      find: true,
      findOne: true,
    },
  });
};
