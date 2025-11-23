import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_trusts',
  modelType: 'component',
  uid: 'sections.trust',
  modelName: 'trust',
  globalId: 'SectionsTrust',
  category: 'sections',
  info: {
    displayName: 'Trust section',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    logos: {
      type: 'component',
      repeatable: true,
      component: 'branding.logo',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
