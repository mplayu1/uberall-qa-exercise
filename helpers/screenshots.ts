import { Page, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Attach a screenshot buffer to TestInfo and save a copy under the `screenhot/<testName>` folder.
 * Keeps only the last 5 screenshots in that folder to avoid disk accumulation.
 * - `name` is used in the test report and to form the filename.
 * - The function will not throw if attach/save/cleanup fails; it logs the error instead.
 */
export async function attachScreenshot(page: Page, testInfo: TestInfo | undefined, name: string, options?: { fullPage?: boolean }) {
  try {
    // Capture screenshot as buffer
    const buffer = await page.screenshot({ fullPage: options?.fullPage ?? false });

    // Determine test name folder (fallback to 'unknown-test' when not available)
    const rawTestName = testInfo?.title ?? testInfo?.testId ?? 'unknown-test';
    const safeTestName = String(rawTestName).replace(/[^a-z0-9-_]/gi, '_').slice(0, 120);

    // Ensure screenhot/<testName> directory exists (note: "screenhot" per request)
    const dir = path.resolve(process.cwd(), 'screenhot', safeTestName);
    await fs.promises.mkdir(dir, { recursive: true });

    // Create a safe filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = name.replace(/[^a-z0-9-_]/gi, '_').slice(0, 120);
    const filename = `${safeName}-${timestamp}.png`;
    const filepath = path.join(dir, filename);

    // Write file to disk
    await fs.promises.writeFile(filepath, buffer);

    // Attach to Playwright report when testInfo is available
    if (testInfo) {
      await testInfo.attach(name, { body: buffer, contentType: 'image/png' });
    }

    // Cleanup: keep only the last 5 screenshots in the directory
    try {
      const files = await fs.promises.readdir(dir);
      const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));
      if (pngFiles.length > 5) {
        const fileStats = await Promise.all(
          pngFiles.map(async (f) => {
            const p = path.join(dir, f);
            const s = await fs.promises.stat(p);
            return { file: p, mtime: s.mtimeMs };
          })
        );

        // Sort by mtime descending (newest first)
        fileStats.sort((a, b) => b.mtime - a.mtime);

        // Keep first 5, delete the rest
        const toDelete = fileStats.slice(5);
        await Promise.all(toDelete.map(async (item) => {
          try {
            await fs.promises.unlink(item.file);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to delete old screenshot:', item.file, e);
          }
        }));
      }
    } catch (cleanupErr) {
      // eslint-disable-next-line no-console
      console.error('Screenshot cleanup failed for', dir, cleanupErr);
    }
  } catch (e) {
    // Do not throw: attaching/saving screenshots should not mask original errors
    // eslint-disable-next-line no-console
    console.error(`attachScreenshot failed for ${name}:`, e);
  }
}