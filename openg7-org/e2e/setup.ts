import { test } from '@playwright/test';
import waitForServer from '@openg7/tooling/check-server';

test.beforeAll(async () => {
  await waitForServer();
});
