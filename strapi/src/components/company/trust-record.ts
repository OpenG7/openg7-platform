import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_company_trust_records',
  modelType: 'component',
  uid: 'company.trust-record',
  modelName: 'trust-record',
  globalId: 'CompanyTrustRecord',
  category: 'company',
  info: {
    displayName: 'Trust record',
    description: 'Transaction or evaluation used to compute reliability',
  },
  options: {},
  attributes: {
    label: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'enumeration',
      enum: ['transaction', 'evaluation'],
      default: 'transaction',
      required: true,
    },
    direction: {
      type: 'enumeration',
      enum: ['inbound', 'outbound'],
      default: 'inbound',
    },
    occurredAt: {
      type: 'datetime',
      required: true,
    },
    amount: {
      type: 'decimal',
    },
    score: {
      type: 'decimal',
    },
    notes: {
      type: 'text',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
