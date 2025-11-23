import type { Struct } from '@strapi/strapi';

const schema = {
  collectionName: 'components_sections_directories',
  modelType: 'component',
  uid: 'sections.directory',
  modelName: 'directory',
  globalId: 'SectionsDirectory',
  category: 'sections',
  info: {
    displayName: 'Directory section',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    table: {
      type: 'component',
      repeatable: false,
      component: 'directory.table-config',
    },
    drawer: {
      type: 'component',
      repeatable: false,
      component: 'directory.drawer-config',
    },
  },
} satisfies Struct.ComponentSchema;

export default schema;
