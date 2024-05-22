import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

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
  { width: 320, height: 568 },  // Mobile viewport
  { width: 768, height: 1024 }, // Tablet viewport
  { width: 1440, height: 900 }  // Desktop viewport
];

viewports.forEach(viewport => {
  test(`Login test - ${viewport.width}x${viewport.height}`, async ({ page }) => {
    // Set viewport size
    await page.setViewportSize(viewport);

    // Accessing environment variables
    const username = process.env.USERNAME_SUCCESS;
    const password = process.env.PASSWORD;

    // Login using custom command
    await login(page, username, password);

    // Make assertions or perform actions after login
    await expect(page.locator('[data-test="title"]')).toBeVisible();
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
  });

  // Negative test within the viewport loop
  test(`Login test - Invalid Credentials ${viewport.width}x${viewport.height}`, async ({ page }) => {
    // Set viewport size
    await page.setViewportSize(viewport);

    // Accessing environment variables
    const invalidUsername = 'invalid_user';
    const invalidPassword = 'invalid_password';

    // Attempt login with invalid credentials
    await login(page, invalidUsername, invalidPassword);

    // Verify that an error message is displayed or the user remains on the login page
    // Find the error
    const element = await page.locator('[data-test="error"]');

    // Get the text of the error
    const textContent = await element.textContent();

    // Assert that the error is not empty or undefined
    expect(textContent).toBeDefined();

    // Assert that the text content contains the expected text
    expect(textContent).toContain('Epic sadface: Username and password do not match any user in this service');
  });
});
