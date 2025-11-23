import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_i18n_languages',
  modelType: 'component',
  uid: 'i18n.language',
  modelName: 'language',
  globalId: 'I18nLanguage',
  category: 'i18n',
  info: {
    displayName: 'Language',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    code: {
      type: 'string',
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    label: {
      type: 'string',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
