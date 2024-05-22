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

// Custom command to add an item to the cart
async function addItemToCart(page, itemName) {
  const addToCartButton = page.locator(`[data-test="add-to-cart-${itemName}"]`);
  await addToCartButton.click();
}

// Custom command to get the number displayed in the cart icon
async function getCartItemCount(page) {
  const cartIcon = page.locator('.shopping_cart_badge');
  const cartItemCount = await cartIcon.innerText();
  return parseInt(cartItemCount.trim(), 10);
}

// Custom command to add multiple items to the cart and verify the cart count
async function addItemsAndVerifyCartCount(page, items) {
  for (let i = 0; i < items.length; i++) {
    await addItemToCart(page, items[i]);
    const cartItemCount = await getCartItemCount(page);
    expect(cartItemCount).toBe(i + 1);
  }
}

// Custom command to check for the presence of text on the page
async function verifyTextPresence(page, textArray) {
  for (const text of textArray) {
    await expect(page.locator(`text=${text}`)).toBeVisible();
  }
}

// Viewport configurations for testing
const viewports = [
  { width: 320, height: 568 },  // Mobile viewport
  { width: 768, height: 1024 }, // Tablet viewport
  { width: 1440, height: 900 }  // Desktop viewport
];

viewports.forEach(viewport => {
  test.describe(`Checkout Test - ${viewport.width}x${viewport.height}`, () => {
    const itemsToAdd = [
      'sauce-labs-backpack',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-onesie',
      'test.allthethings()-t-shirt-(red)'
    ];

    test(`Login, add items to cart, and proceed to checkout - ${viewport.width}x${viewport.height}`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize(viewport);

      const username = process.env.USERNAME_SUCCESS;
      const password = process.env.PASSWORD;

      // Login
      await login(page, username, password);

      // Add items to the cart and verify the cart count
      await addItemsAndVerifyCartCount(page, itemsToAdd);

      // Click on the cart icon to go to the cart page
      await page.click('.shopping_cart_link');

      // Click the "checkout" button
      await page.click('[data-test="checkout"]');

      // Retrieve checkout information from environment variables
      const firstName = process.env.NAME;
      const lastName = process.env.SURNAME;
      const postalCode = process.env.POSTAL_CODE;

      // Enter checkout information
      await page.locator('[data-test="firstName"]').fill(firstName);
      await page.locator('[data-test="lastName"]').fill(lastName);
      await page.locator('[data-test="postalCode"]').fill(postalCode);

      // Click the "continue" button to proceed with the checkout
      await page.click('[data-test="continue"]');

      // Verify that the specified texts are present on the checkout overview page
      const textsToVerify = [
        'Checkout: Overview',
        'Shipping Information:',
        'Payment Information:',
        'Price Total',
        'Total: $75.56'
      ];
      await verifyTextPresence(page, textsToVerify);

      // Click the "finish" button to complete the checkout
      await page.click('[data-test="finish"]');

      // Verify the order confirmation texts
      const confirmationTexts = [
        'Thank you for your order!',
        'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
      ];
      await verifyTextPresence(page, confirmationTexts);
    });
  });
});
