import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'saved_searches',
  modelType: 'contentType',
  uid: 'api::saved-search.saved-search',
  modelName: 'saved-search',
  globalId: 'SavedSearch',
  info: {
    singularName: 'saved-search',
    pluralName: 'saved-searches',
    displayName: 'Saved Search',
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
    name: {
      type: 'string',
      required: true,
    },
    scope: {
      type: 'enumeration',
      enum: ['all', 'companies', 'partners', 'feed', 'map', 'opportunities'],
      default: 'all',
      required: true,
    },
    filters: {
      type: 'json',
    },
    notifyEnabled: {
      type: 'boolean',
      default: false,
    },
    frequency: {
      type: 'enumeration',
      enum: ['realtime', 'daily', 'weekly'],
      default: 'daily',
      required: true,
    },
    lastRunAt: {
      type: 'datetime',
    },
  },
} as unknown as Struct.CollectionTypeSchema;

export default schema;
