import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'exchanges',
  modelType: 'contentType',
  uid: 'api::exchange.exchange',
  modelName: 'exchange',
  globalId: 'Exchange',
  info: {
    singularName: 'exchange',
    pluralName: 'exchanges',
    displayName: 'Exchange',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    sourceProvince: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::province.province',
    },
    targetProvince: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::province.province',
    },
    value: {
      type: 'decimal',
    },
    unit: {
      type: 'string',
    },
  },
} satisfies Struct.CollectionTypeSchema;

export default schema;
