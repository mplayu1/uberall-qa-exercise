import { Page, TestInfo, expect } from '@playwright/test';
import { AccountPage } from '../pages/AccountPage';

/**
 * Attach a screenshot to the Playwright TestInfo (safe no-throw).
 */
async function attachScreenshot(page: Page, testInfo: TestInfo | undefined, name: string, fullPage = false) {
  if (!testInfo) return;
  try {
    const buffer = await page.screenshot({ fullPage });
    await testInfo.attach(name, { body: buffer, contentType: 'image/png' });
  } catch (e) {
    // Do not throw from attach failure
    // eslint-disable-next-line no-console
    console.error('attachScreenshot failed:', e);
  }
}

/**
 * Read a numeric balance from the page using multiple fallbacks.
 * Returns integer balance or throws if no numeric balance found.
 */
async function readBalance(account: AccountPage): Promise<number | null> {
    const balanceText = await account.balanceInnertext.textContent();

    console.log('Balance text found:', balanceText);
    if (!balanceText) {
        return null;
    }

    // Convert to number (handles both integers and decimals)
    const parsed = Number(balanceText.trim());
    return isNaN(parsed) ? null : parsed;
    };
    


/**
 * Assert that the visible Balance equals (total credits - total debits) computed
 * from the transactions table on `account`. Attaches screenshots on pass/fail
 * when `testInfo` is provided.
 *
 * Throws an AssertionError (via expect) when the values don't match.
 */
export async function assertBalanceMatchesTransactions(page: Page, account: AccountPage, testInfo?: TestInfo) {
    const contextName = `assert-balance-${Date.now()}`;



  try {
    // Read displayed balance
      const displayedBalance = await readBalance(account);

      // Click Transactions
      await account.goToTransactions();

    // Compute totals from transactions table: totalCredit - totalDebit
    const rows = account.transactionsRows;
    const rowCount = await rows.count();
    let totalCredit = 0;
    let totalDebit = 0;

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cellAmount = row.locator('td').nth(1);
      const cellsTxType = row.locator('td').nth(2);
      const texts = await cellAmount.allInnerTexts();
      const txType = await cellsTxType.allInnerTexts();
      const transaction = txType.join(' ');
      const joined = texts.join(' ');
      const match = joined.match(/-?\d+/);
        const amount = match ? parseInt(match[0], 10) : 0;
        console.log('Page amount is: ' + i + ': ', amount);
        console.log('Page txType is: ' + i + ': ', txType);
        if (/Credit/i.test(transaction)) totalCredit += amount;
        else if (/Debit/i.test(transaction)) totalDebit += amount;
    }

    //calculation
    const expectedBalance = totalCredit - totalDebit;

      // Final assertion
      console.log('Page totalCredit is:', totalCredit);
      console.log('Page totalDebit is:', totalDebit);
    await expect(expectedBalance).toBe(displayedBalance);
  } catch (err) {
    // Attach a failure screenshot for context, then rethrow
    await attachScreenshot(page, testInfo, `${contextName}-failed`, true);
    // Rethrow the original error (so Playwright shows the assertion failure)
    throw err;
  }
}