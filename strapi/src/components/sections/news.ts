import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_news',
  modelType: 'component',
  uid: 'sections.news',
  modelName: 'news',
  globalId: 'SectionsNews',
  category: 'sections',
  info: {
    displayName: 'News section',
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
  },
} satisfies Struct.ComponentSchema;

export default schema;
