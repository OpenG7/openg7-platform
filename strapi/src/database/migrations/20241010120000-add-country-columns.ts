import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('companies', 'country'))) {
    await knex.schema.alterTable('companies', (table) => {
      table.string('country', 2).nullable();
    });
  }

  if (!(await knex.schema.hasColumn('statistic_insights', 'country'))) {
    await knex.schema.alterTable('statistic_insights', (table) => {
      table.string('country', 2).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasColumn('statistic_insights', 'country')) {
    await knex.schema.alterTable('statistic_insights', (table) => {
      table.dropColumn('country');
    });
  }

  if (await knex.schema.hasColumn('companies', 'country')) {
    await knex.schema.alterTable('companies', (table) => {
      table.dropColumn('country');
    });
  }
}
