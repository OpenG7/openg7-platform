import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_heroes',
  modelType: 'component',
  uid: 'sections.hero',
  modelName: 'hero',
  globalId: 'SectionsHero',
  category: 'sections',
  info: {
    displayName: 'Hero',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
    },
    subtitle: {
      type: 'string',
    },
    cta: {
      type: 'component',
      repeatable: false,
      component: 'navigation.cta-button',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
