import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_map_legend_items',
  modelType: 'component',
  uid: 'map.legend-item',
  modelName: 'legend-item',
  globalId: 'MapLegendItem',
  category: 'map',
  info: {
    displayName: 'Legend item',
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
    color: {
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
