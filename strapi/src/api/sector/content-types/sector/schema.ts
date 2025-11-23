import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'sectors',
  modelType: 'contentType',
  uid: 'api::sector.sector',
  modelName: 'sector',
  globalId: 'Sector',
  info: {
    singularName: 'sector',
    pluralName: 'sectors',
    displayName: 'Sector',
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
