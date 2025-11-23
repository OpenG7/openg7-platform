import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_navigation_cta_buttons',
  modelType: 'component',
  uid: 'navigation.cta-button',
  modelName: 'cta-button',
  globalId: 'NavigationCtaButton',
  category: 'navigation',
  info: {
    displayName: 'CTA button',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    label: {
      type: 'string',
    },
    url: {
      type: 'string',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
