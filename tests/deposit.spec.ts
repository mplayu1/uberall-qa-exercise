import { test, expect, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import { attachScreenshot } from '../helpers/screenshots';

test('Customer can deposit $100 and see transaction', async ({ page }, testInfo: TestInfo) => {
  const login = new LoginPage(page);
  const account = new AccountPage(page);

  // 1. Navigate to the banking app login page
  await login.goto();

  // 2. Click "Customer Login"
  await login.openCustomerLogin();

  // 3. Select "Harry Potter" from the customer dropdown
  await login.selectUserByName('Harry Potter');

  // 4. Click Login
  await login.submit();

  // 5. Click the "Deposit" tab
  await account.goToDeposit();

  // 6. Enter 100 in the amount field
  // 7. Click the Deposit button to submit
  await account.deposit(100);

  // 8. Click the "Transactions" tab
  await account.goToTransactions();

  // 9. Assert that a transaction row exists showing a deposit of $100
  // The demo marks deposits as "Credit" and shows the amount (no currency symbol),
  // so verify a row contains "100" and "Credit".
    const tx = await account.getLastTransaction();
    await expect.soft(tx.amount, "The last transaction is incorrect.").toBe(100);
    await expect.soft(tx.type, "The last transaction type is not Credit").toBe('Credit');
    await attachScreenshot(page, testInfo, 'TransactionsList');
});