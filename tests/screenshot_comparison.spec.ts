import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Define the URL to navigate to
const baseUrl = 'https://www.saucedemo.com/';

// Custom command to login
async function login(page, username, password) {
  await page.goto(`${baseUrl}`);
  await page.locator('[data-test="username"]').click();
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').click();
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
}

// Viewport configurations for testing
const viewports = [
  { width: 1440, height: 900 }, // Desktop viewport
  { width: 320, height: 568 },  // Mobile viewport
  { width: 768, height: 1024 } // Tablet viewport
];

// Path to the baseline screenshot directory
const baselineDir = 'screenshots/baseline';
const currentDir = 'screenshots/current';

viewports.forEach(viewport => {
  test.describe(`Screenshot Comparison Test - ${viewport.width}x${viewport.height}`, () => {
    test(`Login and compare list items screenshot - ${viewport.width}x${viewport.height}`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize(viewport);

      const username = process.env.USERNAME_SUCCESS;
      const password = process.env.PASSWORD;

      // Login
      await login(page, username, password);

      // Capture a screenshot of the list items
      const listItemsSelector = '.inventory_list'; // Adjust the selector based on your list items
      const currentScreenshotPath = `${currentDir}/list-items-${viewport.width}x${viewport.height}.png`;
      const baselineScreenshotPath = `${baselineDir}/list-items-${viewport.width}x${viewport.height}.png`;

      await page.locator(listItemsSelector).screenshot({ path: currentScreenshotPath });

      // Compare the screenshot with the baseline image
      if (fs.existsSync(baselineScreenshotPath)) {
        const currentScreenshot = await fs.promises.readFile(currentScreenshotPath);
        const baselineScreenshot = await fs.promises.readFile(baselineScreenshotPath);

        expect(currentScreenshot).toEqual(baselineScreenshot); // This will compare the screenshots
      } else {
        // If baseline doesn't exist, save the current screenshot as the baseline
        await fs.promises.copyFile(currentScreenshotPath, baselineScreenshotPath);
        console.log(`Baseline screenshot saved at ${baselineScreenshotPath}`);
      }
    });
  });
});
