import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'account_profiles',
  modelType: 'contentType',
  uid: 'api::account-profile.account-profile',
  modelName: 'account-profile',
  globalId: 'AccountProfile',
  info: {
    singularName: 'account-profile',
    pluralName: 'account-profiles',
    displayName: 'Account Profile',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    jobTitle: {
      type: 'string',
    },
    organization: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    avatarUrl: {
      type: 'string',
    },
    sectorPreferences: {
      type: 'json',
    },
    provincePreferences: {
      type: 'json',
    },
    notificationPreferences: {
      type: 'json',
    },
  },
} satisfies Struct.CollectionTypeSchema;

export default schema;
