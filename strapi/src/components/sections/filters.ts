import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_filters',
  modelType: 'component',
  uid: 'sections.filters',
  modelName: 'filters',
  globalId: 'SectionsFilters',
  category: 'sections',
  info: {
    displayName: 'Filters section',
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
