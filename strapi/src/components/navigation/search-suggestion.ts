import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_navigation_search_suggestions',
  modelType: 'component',
  uid: 'navigation.search-suggestion',
  modelName: 'search-suggestion',
  globalId: 'NavigationSearchSuggestion',
  category: 'navigation',
  info: {
    displayName: 'Search suggestion',
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
    url: {
      type: 'string',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
