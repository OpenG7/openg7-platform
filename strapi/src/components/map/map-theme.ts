import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_map_map_themes',
  modelType: 'component',
  uid: 'map.map-theme',
  modelName: 'map-theme',
  globalId: 'MapTheme',
  category: 'map',
  info: {
    displayName: 'Map theme',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'string',
    },
    primaryColor: {
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
