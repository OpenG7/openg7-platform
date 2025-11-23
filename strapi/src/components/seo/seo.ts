import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_seo_seos',
  modelType: 'component',
  uid: 'seo.seo',
  modelName: 'seo',
  globalId: 'SeoSeo',
  category: 'seo',
  info: {
    displayName: 'SEO',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    metaTitle: {
      type: 'string',
    },
    metaDescription: {
      type: 'text',
    },
    shareImage: {
      type: 'media',
      multiple: false,
      required: false,
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
