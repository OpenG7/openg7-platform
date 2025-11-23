import { ensureLocale, findId, upsertByUID } from '../utils/seed-helpers';

type CompanySeed = {
  slug: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  website: string;
  country: 'CA' | 'US' | 'FR' | 'UK' | 'JP' | 'DE' | 'IT';
  provinceSlug: string;
  sectorSlug: string;
  status: 'pending' | 'approved' | 'suspended';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'suspended';
  capacities: Record<string, any>;
  trustScore: number;
  verificationSources: any[];
  trustHistory: any[];
};

const companySeeds: CompanySeed[] = [
  {
    slug: 'north-river-energy',
    name: { en: 'North River Energy', fr: 'Énergie North River' },
    description: {
      en: 'Independent producer specialising in renewable hydroelectric power for Western Canada.',
      fr: 'Producteur indépendant spécialisé dans l’hydroélectricité renouvelable pour l’Ouest canadien.',
    },
    website: 'https://northriver.example.com',
    country: 'CA',
    provinceSlug: 'bc',
    sectorSlug: 'energy',
    status: 'approved',
    verificationStatus: 'verified',
    capacities: {
      electricity: { unit: 'GWh', value: 7.5 },
      storage: { unit: 'MWh', value: 55 },
    },
    trustScore: 0.86,
    verificationSources: [
      {
        name: 'BC Corporate Registry',
        type: 'registry',
        status: 'validated',
        referenceId: 'BC-778-2024',
        url: 'https://registry.example.com/BC-778-2024',
        lastCheckedAt: '2024-02-15T00:00:00.000Z',
      },
    ],
    trustHistory: [
      {
        label: 'Hydro infrastructure expansion audit',
        type: 'evaluation',
        direction: 'inbound',
        occurredAt: '2024-03-01T00:00:00.000Z',
        score: 0.9,
        notes: 'Independent review by provincial energy board.',
      },
    ],
  },
  {
    slug: 'prairie-agri-cooperative',
    name: { en: 'Prairie Agri Cooperative', fr: 'Coopérative Agro Prairie' },
    description: {
      en: 'Cooperative network exporting grain and pulses across central provinces.',
      fr: 'Réseau coopératif exportant des céréales et légumineuses à travers les provinces centrales.',
    },
    website: 'https://prairieagri.example.com',
    country: 'CA',
    provinceSlug: 'sk',
    sectorSlug: 'agriculture',
    status: 'approved',
    verificationStatus: 'pending',
    capacities: {
      storage: { unit: 'tonnes', value: 120000 },
      logistics: { unit: 'trucks/day', value: 45 },
    },
    trustScore: 0.72,
    verificationSources: [
      {
        name: 'Saskatchewan Agriculture Federation',
        type: 'chamber',
        status: 'pending',
        referenceId: 'SAF-98231',
        notes: 'Awaiting renewal confirmation for 2025 season.',
      },
    ],
    trustHistory: [
      {
        label: 'Interprovincial barley exchange',
        type: 'transaction',
        direction: 'outbound',
        occurredAt: '2024-01-18T00:00:00.000Z',
        amount: 2800,
        notes: 'Delivered to Ontario distributor under G7 resilience program.',
      },
    ],
  },
  {
    slug: 'atlantic-marine-systems',
    name: { en: 'Atlantic Marine Systems', fr: 'Systèmes Marins Atlantique' },
    description: {
      en: 'Engineering firm supporting maintenance and retrofits for coastal shipping fleets.',
      fr: 'Entreprise d’ingénierie soutenant la maintenance et la modernisation des flottes maritimes côtières.',
    },
    website: 'https://atlanticmarine.example.com',
    country: 'CA',
    provinceSlug: 'ns',
    sectorSlug: 'manufacturing',
    status: 'approved',
    verificationStatus: 'verified',
    capacities: {
      dryDock: { unit: 'ships/month', value: 6 },
      workforce: { unit: 'technicians', value: 220 },
    },
    trustScore: 0.81,
    verificationSources: [
      {
        name: 'Transport Canada Marine Safety',
        type: 'audit',
        status: 'validated',
        referenceId: 'TCMS-4411',
        issuedAt: '2023-11-02T00:00:00.000Z',
      },
    ],
    trustHistory: [
      {
        label: 'Emergency repair deployment',
        type: 'transaction',
        direction: 'outbound',
        occurredAt: '2024-04-05T00:00:00.000Z',
        amount: 3,
        notes: 'Rapid deployment to assist interprovincial supply route.',
      },
    ],
  },
];

export default async () => {
  await ensureLocale('fr');
  await ensureLocale('en');

  const provinceIds = new Map<string, number | string>();
  const sectorIds = new Map<string, number | string>();

  const ensureTaxonomyPresence = async (
    cache: Map<string, number | string>,
    uid: 'api::province.province' | 'api::sector.sector',
    slug: string,
    taxonomyLabel: 'province' | 'sector',
    companySlug: string
  ) => {
    if (!cache.has(slug)) {
      const id = await findId(uid, { slug });
      if (!id) {
        const message = `Cannot seed company "${companySlug}" because ${taxonomyLabel} with slug "${slug}" is missing.`;
        strapi.log?.error?.(message);
        throw new Error(message);
      }
      cache.set(slug, id);
    }

    return cache.get(slug)!;
  };

  for (const seed of companySeeds) {
    const provinceId = await ensureTaxonomyPresence(
      provinceIds,
      'api::province.province',
      seed.provinceSlug,
      'province',
      seed.slug
    );
    const sectorId = await ensureTaxonomyPresence(
      sectorIds,
      'api::sector.sector',
      seed.sectorSlug,
      'sector',
      seed.slug
    );

    await upsertByUID(
      'api::company.company',
      {
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        website: seed.website,
        country: seed.country,
        province: provinceId,
        sector: sectorId,
        status: seed.status,
        verificationStatus: seed.verificationStatus,
        capacities: seed.capacities,
        verificationSources: seed.verificationSources,
        trustHistory: seed.trustHistory,
        trustScore: seed.trustScore,
      }
    );
  }
};
