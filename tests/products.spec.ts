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

// Custom command to sort items from Z to A
async function sortItemsDescending(page) {
  const sortDropdown = page.locator('[data-test="product-sort-container"]');
  await sortDropdown.selectOption({ index: 1 }); // Select the second option (Z to A)
}

// Custom command to add items to the cart
async function addItemToCart(page, itemName) {
  const addToCartButton = page.locator(`[data-test="add-to-cart-${itemName}"]`);
  await addToCartButton.click();
}

// Custom command to remove one item from the cart
async function removeOneItemFromCart(page) {
  const removeButton = page.locator('.cart_item .btn_secondary').first();
  await removeButton.click();
}

// Custom command to check if the cart icon is visible
async function isCartIconVisible(page) {
  try {
    await page.waitForSelector('.shopping_cart_badge', { state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

// Custom command to add different items to the cart
async function addDifferentItemsToCart(page) {
  const itemsToAdd = [
    'sauce-labs-onesie',
    'test.allthethings()-t-shirt-(red)',
    'sauce-labs-fleece-jacket'
  ];

  for (const itemName of itemsToAdd) {
    await addItemToCart(page, itemName);
  }
}

// Custom command to get the number displayed in the cart icon
async function getCartItemCount(page) {
  const cartIcon = page.locator('.shopping_cart_badge');
  const cartItemCount = await cartIcon.innerText();
  return parseInt(cartItemCount.trim(), 10);
}

// Custom command to remove all items from the cart
async function removeAllItemsFromCart(page) {
  const removeButtons = page.locator('.cart_item .btn_secondary');
  const count = await removeButtons.count();
  for (let i = 0; i < count; i++) {
    await removeButtons.nth(0).click(); // Always remove the first item in the list
  }
}

// Reusable function to perform authenticated actions (login and add initial items to cart)
async function performAuthenticatedAction(page, viewport) {
  await page.setViewportSize(viewport);

  const username = process.env.USERNAME_SUCCESS;
  const password = process.env.PASSWORD;

  await login(page, username, password);

  // Sort items from Z to A
  await sortItemsDescending(page);

  await addItemToCart(page, 'sauce-labs-backpack');
  await addItemToCart(page, 'sauce-labs-bolt-t-shirt');

  const cartItemCount = await getCartItemCount(page);
  expect(cartItemCount).toBe(2);

  await page.click('.shopping_cart_link');
  await removeAllItemsFromCart(page);
}

// Function to perform actions after adding different items to cart
async function performActionsAfterAddingItemsToCart(page) {
  let cartItemCount = await getCartItemCount(page);
  expect(cartItemCount).toBe(3);

  await page.click('.shopping_cart_link');

  for (let i = 2; i >= 1; i--) {
    await removeOneItemFromCart(page);
    if (i > 0) {
      cartItemCount = await getCartItemCount(page);
      expect(cartItemCount).toBe(i);
    } else {
      const isVisible = await isCartIconVisible(page);
      expect(isVisible).toBe(false);
    }
  }
}

const viewports = [
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 }
];

viewports.forEach(viewport => {
  test(`Sort products and add various items to cart and remove them - ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await performAuthenticatedAction(page, viewport);

    await page.click('[data-test="continue-shopping"]');
    await addDifferentItemsToCart(page);

    await performActionsAfterAddingItemsToCart(page);
  });
});
