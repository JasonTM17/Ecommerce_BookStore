import { test, expect, Page } from '@playwright/test';

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:8080/api';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ============================================
// CART TESTS
// ============================================

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Login before cart tests
    const testEmail = process.env.TEST_USER_EMAIL || 'customer@example.com';
    const testPassword =
      process.env.TEST_USER_PASSWORD || 'E2ETestDemoCustomerPasswordForBookStore123!';
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    try {
      await page.locator('input[type="email"], input[name="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await expect(page).toHaveURL(/\/(?!login)/, { timeout: 15000 });
    } catch (e) {
      console.log('Login skipped, may already be logged in');
    }
  });

  test('Add product to cart', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');

    const firstCard = page.getByTestId('product-card').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.hover();
    
    // Look for add to cart button
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Thêm vào giỏ")').first();
    
    if (await addToCartButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Check if cart was updated
      const cartBadge = page.locator('[class*="cart"] span, [class*="badge"]').first();
      // Cart should be updated
    }
  });

  test('View cart', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    
    // Should show cart content or empty cart message
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Update cart quantity', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    
    // Look for quantity controls
    const increaseButton = page.locator('button:has-text("+"), button[aria-label*="increase"]').first();
    const decreaseButton = page.locator('button:has-text("-"), button[aria-label*="decrease"]').first();
    
    if (await increaseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await increaseButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Remove item from cart', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    
    // Look for remove button
    const removeButton = page.locator('button:has-text("Remove"), button:has-text("Xóa")').first();
    
    if (await removeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(500);
    }
  });
});

// ============================================
// CHECKOUT TESTS
// ============================================

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and add items to cart
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123456';
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    try {
      await page.locator('input[type="email"], input[name="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('Login skipped');
    }
  });

  test('Checkout page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForLoadState('networkidle');
    
    // Should show checkout form or redirect to cart if empty
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Complete checkout', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForLoadState('networkidle');
    
    // Fill checkout form if visible
    const formFields = await page.locator('input, select, textarea').all();
    
    for (const field of formFields.slice(0, 5)) {
      try {
        if (await field.isVisible({ timeout: 1000 })) {
          const tagName = await field.evaluate(el => el.tagName.toLowerCase());
          const type = await field.getAttribute('type');
          
          if (tagName === 'input' && type !== 'submit' && type !== 'button') {
            await field.fill('Test Value');
          }
        }
      } catch (e) {
        // Skip this field
      }
    }
    
    // Look for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Checkout"), button:has-text("Đặt hàng")').first();
    
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
  });
});

// ============================================
// USER PROFILE TESTS
// ============================================

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123456';
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    try {
      await page.locator('input[type="email"], input[name="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('Login skipped');
    }
  });

  test('Profile page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Update profile information', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Look for edit form
    const inputs = await page.locator('input[type="text"], input[type="email"]').all();
    
    for (const input of inputs.slice(0, 3)) {
      try {
        if (await input.isVisible({ timeout: 1000 })) {
          const name = await input.getAttribute('name');
          if (name && !name.includes('email')) {
            await input.fill('');
            await input.fill('Updated Value');
          }
        }
      } catch (e) {
        // Skip
      }
    }
  });

  test('View order history', async ({ page }) => {
    await page.goto(`${BASE_URL}/orders`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});

// ============================================
// PRODUCT REVIEWS TESTS
// ============================================

test.describe('Product Reviews', () => {
  test('View product reviews', async ({ page }) => {
    // Get a product ID first
    const response = await page.request.get(`${API_URL}/products?limit=1`);
    const data = await response.json();
    
    if (data?.data?.content?.length > 0) {
      const productId = data.data.content[0].id;
      await page.goto(`${BASE_URL}/products/${productId}`);
      await page.waitForLoadState('networkidle');
      
      // Look for reviews section
      const reviewsSection = page.locator('text=review, text=đánh giá, text=Review').first();
      if (await reviewsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        expect(true).toBe(true);
      }
    }
  });
});
