import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_directory_table_configs',
  modelType: 'component',
  uid: 'directory.table-config',
  modelName: 'table-config',
  globalId: 'DirectoryTableConfig',
  category: 'directory',
  info: {
    displayName: 'Table config',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    columns: {
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
