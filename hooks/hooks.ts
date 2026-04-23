import { test } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  // If the test failed (or flaky, timedOut, etc.), attach a failure screenshot.
  // testInfo.status can be 'passed' | 'failed' | 'timedOut' | 'interrupted' | 'skipped' | 'expected' etc.
  if (testInfo.status !== 'passed') {
    try {
      const buffer = await page.screenshot({ fullPage: true });
      await testInfo.attach('screenshot-on-test-failure', { body: buffer, contentType: 'image/png' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to capture failure screenshot in afterEach:', e);
    }
  }
});