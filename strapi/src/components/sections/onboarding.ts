import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_onboardings',
  modelType: 'component',
  uid: 'sections.onboarding',
  modelName: 'onboarding',
  globalId: 'SectionsOnboarding',
  category: 'sections',
  info: {
    displayName: 'Onboarding section',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
    },
    steps: {
      type: 'json',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
