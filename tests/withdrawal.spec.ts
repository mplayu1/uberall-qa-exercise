import { test, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import { assertBalanceMatchesTransactions } from '../helpers/assertions';
import { attachScreenshot } from '../helpers/screenshots';

test('Customer can deposit and withdraw and transactions/balance is updated correctly', async ({ page }, testInfo: TestInfo) => {
  const login = new LoginPage(page);
  const account = new AccountPage(page);

  // 1-4: login flow (same as deposit test)
  await login.goto();
  await login.openCustomerLogin();
  await login.selectUserByName('Harry Potter');
  await login.submit();

  // deposit first (same as deposit.spec)
  await account.goToDeposit();
  await account.deposit(100);

  // go to transactions to verify deposit exists (reusing deposit test flow)
  await account.goToTransactions();

  // Click back to account main
  await account.clickBack();

  // Click withdrawal tab/button
  await account.clickWithdrawTab();

  // Enter 88 as withdrawal amount and submit.
    await account.withdraw(88);
    await attachScreenshot(page, testInfo, 'TotalBalanceAfterWithdrawal');

  // Validate that new balance amount is correct using shared assertion helper.
    await assertBalanceMatchesTransactions(page, account, testInfo);
    await attachScreenshot(page, testInfo, 'TransactionsList');
});