import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_navigation_search_configs',
  modelType: 'component',
  uid: 'navigation.search-config',
  modelName: 'search-config',
  globalId: 'NavigationSearchConfig',
  category: 'navigation',
  info: {
    displayName: 'Search config',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    placeholder: {
      type: 'string',
    },
    suggestions: {
      type: 'component',
      repeatable: true,
      component: 'navigation.search-suggestion',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
