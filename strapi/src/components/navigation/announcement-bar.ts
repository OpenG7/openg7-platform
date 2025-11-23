import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_navigation_announcement_bars',
  modelType: 'component',
  uid: 'navigation.announcement-bar',
  modelName: 'announcement-bar',
  globalId: 'NavigationAnnouncementBar',
  category: 'navigation',
  info: {
    displayName: 'Announcement bar',
    icon: 'megaphone',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    enabled: {
      type: 'boolean',
      default: true,
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
    },
    message: {
      type: 'string',
    },
    linkLabel: {
      type: 'string',
    },
    linkUrl: {
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
