import runSeeds from './seed';
import { getSeedFailureStrategy, isAutoSeedEnabled, isDevOrIntegrationEnv } from './utils/seed-helpers';

export default async ({ strapi }: { strapi: any }) => {
  const shouldSeed = isDevOrIntegrationEnv() && isAutoSeedEnabled();

  if (!shouldSeed) {
    strapi.log?.info?.('Skipping seed execution (environment or flags not enabled).');
    return;
  }

  const failureStrategy = getSeedFailureStrategy();
  strapi.log?.info?.(`Running Strapi seeds for development environment (failure strategy: ${failureStrategy}).`);
  await runSeeds();
};
