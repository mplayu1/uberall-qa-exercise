import { Page, Locator, expect } from '@playwright/test';

export type Transaction = {
  row: Locator;
  cells: string[];
  amount: number | null;
  type: 'Credit' | 'Debit' | '';
};

export class AccountPage {
  readonly page: Page;
  readonly depositTab: Locator;
  readonly transactionsTab: Locator;
  readonly amountInput: Locator;
  readonly depositSubmitButton: Locator;
  readonly transactionsTable: Locator;
    readonly transactionsRows: Locator;
    readonly WithdrawalButton: Locator;
    readonly balanceInnertext: Locator;

  constructor(page: Page) {
    this.page = page;

    // Tab buttons
    this.depositTab = page.getByRole('button', { name: 'Deposit' }).first();
    this.transactionsTab = page.getByRole('button', { name: 'Transactions' });

    // Deposit/withdraw controls
    this.amountInput = page.locator('input[ng-model="amount"]');

    // Deposit submit button:
      this.depositSubmitButton = page.locator('//button[text()="Deposit"]');

      // Withdrawal submit button:
      this.WithdrawalButton = page.locator('//button[text()="Withdraw"]');

      this.balanceInnertext = page.locator('//strong[@class="ng-binding"][2]');

    // Locate the transactions table by header "Amount" and its rows
    this.transactionsTable = page.locator('table').filter({ has: page.locator('a', { hasText: 'Amount' }) });
    this.transactionsRows = this.transactionsTable.locator('tbody tr');
  }

  async goToDeposit(): Promise<void> {
    await this.depositTab.click();
    await expect(this.amountInput).toBeVisible();
  }

    async deposit(amount: number): Promise<void> {
      await this.amountInput.click();
      await this.amountInput.pressSequentially(amount.toString(), {delay: 500});
    await this.depositSubmitButton.click();
  }

    async goToTransactions(): Promise<void> {
      await this.page.waitForTimeout(1000);
      await this.transactionsTab.click();
    // Wait for at least the first row to be visible (if present)
      await expect(this.transactionsRows.first(), "Transaction not recorded").toBeVisible({timeout:5000});
  }

  // synchronous locator for the last row
  getLastTransactionRow(): Locator {
    return this.transactionsRows.last();
  }

  // Returns a structured Transaction object with Locator + parsed fields
  async getLastTransaction(): Promise<Transaction> {
    const row = this.getLastTransactionRow();
    await row.waitFor({ state: 'visible' });

    const cellLocator = row.locator('td');
    const count = await cellLocator.count();
    const cells: string[] = [];
    for (let i = 1; i < count; i++) {
      const text = (await cellLocator.nth(i).innerText())?.trim() ?? '';
      cells.push(text);
    }

    const joined = cells.join(' ');
    const match = joined.match(/-?\d+/);
    const amount = match ? parseInt(match[0], 10) : null;

    let type: Transaction['type'] = '';
    if (/credit/i.test(joined)) type = 'Credit';
    else if (/debit/i.test(joined)) type = 'Debit';

    return { row, cells, amount, type };
  }

  /**
   * Click a button labeled "Back" using several fallbacks.
   */
  async clickBack(): Promise<void> {
    const backSelectors = [
      'button:has-text("Back")',
      'text=Back',
      'xpath=//button[@ng-click="back()"]',
      'xpath=//button[contains(., "Back")]',
    ];
    for (const sel of backSelectors) {
      const loc = this.page.locator(sel);
      if ((await loc.count()) > 0) {
        await loc.first().click();
        return;
      }
    }
    throw new Error('Back button not found');
  }

  /**
   * Click the withdrawal tab/button (some demos use "Withdrawl" typo).
   */
  async clickWithdrawTab(): Promise<void> {
    const withdrawSelectors = [
      'button:has-text("Withdrawl")',
      'button:has-text("Withdraw")',
      'xpath=//button[text()="Withdrawl"]',
      'xpath=//button[text()="Withdraw"]',
    ];
    for (const sel of withdrawSelectors) {
      const loc = this.page.locator(sel);
      if ((await loc.count()) > 0) {
        await loc.first().click();
        return;
      }
    }
    throw new Error('Withdraw tab/button not found');
  }

  /**
   * Submit a withdrawal using the amount input and a withdraw button on the form.
   */
    async withdraw(amount: number): Promise<void> {
        await this.amountInput.click();
        await this.amountInput.pressSequentially(amount.toString(), { delay: 500 });
        await this.WithdrawalButton.click();

 
    }


}