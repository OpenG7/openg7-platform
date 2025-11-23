import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'provinces',
  modelType: 'contentType',
  uid: 'api::province.province',
  modelName: 'province',
  globalId: 'Province',
  info: {
    singularName: 'province',
    pluralName: 'provinces',
    displayName: 'Province',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'string',
    },
    code: {
      type: 'string',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    slug: {
      type: 'uid',
      targetField: 'name',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
  },
} satisfies Struct.CollectionTypeSchema;

export default schema;
