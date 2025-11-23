import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_insights',
  modelType: 'component',
  uid: 'sections.insights',
  modelName: 'insights',
  globalId: 'SectionsInsights',
  category: 'sections',
  info: {
    displayName: 'Insights section',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    kpis: {
      type: 'component',
      repeatable: true,
      component: 'insights.kpi-config',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
