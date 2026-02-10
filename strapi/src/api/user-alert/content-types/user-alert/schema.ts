import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'user_alerts',
  modelType: 'contentType',
  uid: 'api::user-alert.user-alert',
  modelName: 'user-alert',
  globalId: 'UserAlert',
  info: {
    singularName: 'user-alert',
    pluralName: 'user-alerts',
    displayName: 'User Alert',
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
    title: {
      type: 'string',
      required: true,
    },
    message: {
      type: 'text',
      required: true,
    },
    severity: {
      type: 'enumeration',
      enum: ['info', 'success', 'warning', 'critical'],
      default: 'info',
      required: true,
    },
    sourceType: {
      type: 'string',
    },
    sourceId: {
      type: 'string',
    },
    metadata: {
      type: 'json',
    },
    readAt: {
      type: 'datetime',
    },
  },
} as unknown as Struct.CollectionTypeSchema;

export default schema;
