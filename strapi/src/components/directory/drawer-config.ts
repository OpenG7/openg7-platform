import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_directory_drawer_configs',
  modelType: 'component',
  uid: 'directory.drawer-config',
  modelName: 'drawer-config',
  globalId: 'DirectoryDrawerConfig',
  category: 'directory',
  info: {
    displayName: 'Drawer config',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    fields: {
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
