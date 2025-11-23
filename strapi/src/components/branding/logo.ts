import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_branding_logos',
  modelType: 'component',
  uid: 'branding.logo',
  modelName: 'logo',
  globalId: 'BrandingLogo',
  category: 'branding',
  info: {
    displayName: 'Logo',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    image: {
      type: 'media',
      required: false,
      multiple: false,
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    alt: {
      type: 'string',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
