import { compileStrapi, createStrapi } from '@strapi/strapi';

import runSeeds from '../src/seed';

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  try {
    await runSeeds();
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
