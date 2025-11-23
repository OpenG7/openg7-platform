import type { Struct } from '@strapi/strapi';

const schema = {
  kind: 'singleType',
  collectionName: 'homepage',
  modelType: 'contentType',
  uid: 'api::homepage.homepage',
  modelName: 'homepage',
  globalId: 'Homepage',
  info: {
    singularName: 'homepage',
    pluralName: 'homepages',
    displayName: 'Homepage',
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
    navigation: {
      type: 'component',
      repeatable: false,
      component: 'navigation.header',
    },
    sections: {
      type: 'dynamiczone',
      components: [
        'sections.hero',
        'sections.filters',
        'sections.directory',
        'sections.insights',
        'sections.onboarding',
        'sections.news',
        'sections.trust',
      ],
    },
    seo: {
      type: 'component',
      repeatable: false,
      component: 'seo.seo',
    },
  },
} satisfies Struct.SingleTypeSchema;

export default schema;
