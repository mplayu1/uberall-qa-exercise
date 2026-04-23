# uberall-qa-exercise
Uberall Exercise

## Project Test Runner

This repository contains Playwright tests written in TypeScript that exercise the demo banking app. The test suite includes examples `tests/deposit.spec.ts` and `tests/withdrawal.spec.ts`, along with helper code located in the `pages/` and `helpers/` directories.
Framework used is Page Object Model (POM) with helper functions for assertions and screenshots.

## Prerequisites

- Node.js 18+ (or a current LTS)
- Git (optional)

## Install Playwright + TypeScript (CLI)

Open a terminal or command prompt in the project root and run the following commands:

1. Initialize npm (if you don't already have a `package.json`):

    ```bash
    npm init -y
    ```

2. Install Playwright Test as a dev dependency:

    ```bash
    npm install -D @playwright/test
    ```

3. Install Playwright browsers (required to run tests):

    ```bash
    npx playwright install
    ```

4. (Optional) Initialize Playwright configuration and TypeScript support interactively:

    ```bash
    npx playwright test --init
    ```

    Choose the TypeScript option when prompted. This will create `playwright.config.ts`, example tests, and a `tsconfig.json` if not already present.

## TypeScript setup (if not created by init)

If you prefer to set up TypeScript manually, install TypeScript and node types:

    npm install -D typescript @types/node
    npx tsc --init

Make sure `tsconfig.json` includes `"module": "CommonJS"` or compatible settings for the Playwright test runner if needed.

## Add npm test script (recommended)

Add the following `scripts` entry to your `package.json` so tests can be run with `npm test`:

```json
"scripts": {
  "test": "playwright test",
  "test:headed": "playwright test --headed",
  "test:report": "playwright show-report"
}
```

## Run tests

- Run the full test suite:

    ```bash
    npx playwright test
    # or
    npm test
    ```

- Run a single test file (example: `withdrawal.spec.ts`): **headless = false by default**

    ```bash
    npx playwright test tests/withdrawal.spec.ts
    ```

- Run tests in headed mode (shows browser windows):

    ```bash
    npx playwright test --headed
    # or
    npm run test:headed
    ```

- Run a single test and open the HTML report afterwards:

    ```bash
    npx playwright test tests/deposit.spec.ts
    npx playwright show-report
    ```

## Report and screenshots

- The Playwright HTML report includes attachments that are added with `testInfo.attach()`.
- This project saves screenshot files to `screenshot/<testName>/` (one folder per test). Screenshots are also attached to each test when the helper `attachScreenshot(page, testInfo, name)` is used.
- If you used `page.screenshot({ path: 'filename.png' })` directly, that file will be written to disk but not automatically attached to the Playwright HTML report. Use `testInfo.attach()` to attach screenshots to the report.

## Example: Run the withdrawal test and view the report
 
# Run withdrawal test
npx playwright test tests/withdrawal.spec.ts

# Open the HTML report
npx playwright show-report

Inside the report, you will find attached screenshots (if the test or helper attached them). Screenshots saved on disk are located under `screenshot/<testName>/`.

## Troubleshooting

- If you see the error `Playwright Test did not expect test.afterEach() to be called here`, ensure you did not import any `test.*` hooks from a module inside `playwright.config.ts`. Register hooks from a test fixture file or your tests instead.
- If screenshots are not appearing in the HTML report, verify that the helper used `testInfo.attach(name, { body: buffer, contentType: 'image/png' })` and that `testInfo` was passed into the helper.

## Project structure (typical)
 
├── helpers/
│   ├── assertions.ts
│   └── screenshots.ts
├── pages/
│   ├── AccountPage.ts
│   └── LoginPage.ts
├── tests/
│   ├── deposit.spec.ts
│   └── withdrawal.spec.ts
├── playwright.config.ts
├── package.json
└── README.md

## Contact

For additional changes to this README or help configuring Playwright, please update me with specific requests.

