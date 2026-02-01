import waitForServer from '@openg7/tooling/check-server';
import { test } from '@playwright/test';

test.beforeAll(async () => {
  await waitForServer();
});
