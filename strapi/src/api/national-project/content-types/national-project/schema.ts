import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'collectionType',
  collectionName: 'national_projects',
  modelType: 'contentType',
  uid: 'api::national-project.national-project',
  modelName: 'national-project',
  globalId: 'NationalProject',
  info: {
    singularName: 'national-project',
    pluralName: 'national-projects',
    displayName: 'National Project',
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
    title: {
      type: 'string',
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    country: {
      type: 'enumeration',
      enum: ['CA', 'US', 'FR'],
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    description: {
      type: 'richtext',
    },
    impactOnShipping: {
      type: 'json',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    highlight: {
      type: 'boolean',
      default: false,
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
  },
} satisfies Struct.CollectionTypeSchema;

export default schema;
