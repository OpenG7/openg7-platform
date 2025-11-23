import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_company_verification_sources',
  modelType: 'component',
  uid: 'company.verification-source',
  modelName: 'verification-source',
  globalId: 'CompanyVerificationSource',
  category: 'company',
  info: {
    displayName: 'Verification source',
    description: 'Registry, audit or chamber of commerce attestation',
  },
  options: {},
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'enumeration',
      enum: ['registry', 'chamber', 'audit', 'other'],
      default: 'registry',
      required: true,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'validated', 'revoked'],
      default: 'pending',
      required: true,
    },
    referenceId: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    issuedAt: {
      type: 'datetime',
    },
    lastCheckedAt: {
      type: 'datetime',
    },
    evidenceUrl: {
      type: 'string',
    },
    notes: {
      type: 'text',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
