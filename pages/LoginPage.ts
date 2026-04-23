import { Page, Locator } from '@playwright/test';

export class LoginPage {
  static readonly url = 'https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login';
  readonly page: Page;
  readonly customerLoginButton: Locator;
  readonly userSelect: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.customerLoginButton = page.locator('button[ng-click="customer()"]');
    this.userSelect = page.locator('#userSelect');
    this.loginButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(LoginPage.url);
  }

  async openCustomerLogin(): Promise<void> {
    await this.customerLoginButton.click();
  }

  async selectUserByName(name: string): Promise<void> {
    await this.userSelect.selectOption({ label: name });
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }
}