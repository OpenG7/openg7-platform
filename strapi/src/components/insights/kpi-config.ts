import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_insights_kpi_configs',
  modelType: 'component',
  uid: 'insights.kpi-config',
  modelName: 'kpi-config',
  globalId: 'InsightsKpiConfig',
  category: 'insights',
  info: {
    displayName: 'KPI config',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    label: {
      type: 'string',
    },
    value: {
      type: 'decimal',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    unit: {
      type: 'string',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
