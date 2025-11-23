import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_navigation_menu_links',
  modelType: 'component',
  uid: 'navigation.menu-link',
  modelName: 'menu-link',
  globalId: 'NavigationMenuLink',
  category: 'navigation',
  info: {
    displayName: 'Menu link',
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
