import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'user_favorites',
  modelType: 'contentType',
  uid: 'api::user-favorite.user-favorite',
  modelName: 'user-favorite',
  globalId: 'UserFavorite',
  info: {
    singularName: 'user-favorite',
    pluralName: 'user-favorites',
    displayName: 'User Favorite',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    entityType: {
      type: 'string',
      required: true,
    },
    entityId: {
      type: 'string',
      required: true,
    },
    metadata: {
      type: 'json',
    },
  },
} as unknown as Struct.CollectionTypeSchema;

export default schema;
