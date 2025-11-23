import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_navigation_headers',
  modelType: 'component',
  uid: 'navigation.header',
  modelName: 'header',
  globalId: 'NavigationHeader',
  category: 'navigation',
  info: {
    displayName: 'Header',
    icon: 'bars',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    logo: {
      type: 'component',
      repeatable: false,
      component: 'branding.logo',
    },
    links: {
      type: 'component',
      repeatable: true,
      component: 'navigation.menu-link',
    },
    cta: {
      type: 'component',
      repeatable: false,
      component: 'navigation.cta-button',
    },
    announcement: {
      type: 'component',
      repeatable: false,
      component: 'navigation.announcement-bar',
    },
    search: {
      type: 'component',
      repeatable: false,
      component: 'navigation.search-config',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
