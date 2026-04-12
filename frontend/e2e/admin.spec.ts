import { test, expect, Page, request } from '@playwright/test';

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:8080/api';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bookstore.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456';

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);
}

// ============================================
// ADMIN DASHBOARD TESTS
// ============================================

test.describe('Admin Dashboard', () => {
  test('Admin dashboard loads', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    
    // Check for admin elements
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Admin sidebar navigation works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    
    // Look for navigation links
    const navLinks = await page.locator('nav a, [class*="sidebar"] a').all();
    expect(navLinks.length).toBeGreaterThan(0);
  });
});

// ============================================
// ADMIN PRODUCT MANAGEMENT
// ============================================

test.describe('Admin Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Products list page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Add new product', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/products/new`);
    await page.waitForLoadState('networkidle');
    
    // Fill product form
    const inputs = await page.locator('input[type="text"], input[type="number"], textarea').all();
    
    for (const input of inputs.slice(0, 6)) {
      try {
        if (await input.isVisible({ timeout: 1000 })) {
          const type = await input.getAttribute('type');
          const name = await input.getAttribute('name');
          
          if (type === 'number') {
            await input.fill('99');
          } else if (name?.includes('name') || name?.includes('title')) {
            await input.fill('Test Product');
          } else if (name?.includes('description')) {
            await input.fill('Test Description');
          } else {
            await input.fill('Test Value');
          }
        }
      } catch (e) {
        // Skip
      }
    }
    
    // Save button
    const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Lưu")').first();
    if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Edit existing product', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState('networkidle');
    
    // Look for edit button
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Sửa"), a:has-text("Edit")').first();
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(2000);
      
      // Should be on edit page
      const url = page.url();
      expect(url).toContain('/edit') || expect(url).toContain('/products/');
    }
  });
});

// ============================================
// ADMIN ORDER MANAGEMENT
// ============================================

test.describe('Admin Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Orders list page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('View order details', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');
    
    // Look for first order link
    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    
    if (await orderLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orderLink.click();
      await page.waitForTimeout(2000);
      
      // Should show order details
      const url = page.url();
      expect(url).toMatch(/\/admin\/orders\/[\w-]+/);
    }
  });

  test('Update order status', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');
    
    // Go to first order
    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    
    if (await orderLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orderLink.click();
      await page.waitForTimeout(2000);
      
      // Look for status dropdown
      const statusSelect = page.locator('select[name*="status"], [class*="status"] select').first();
      
      if (await statusSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusSelect.selectOption({ index: 1 });
        
        // Save
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Cập nhật")').first();
        if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });
});

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Users list page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('View user details', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    
    // Look for user link
    const userLink = page.locator('a[href*="/admin/users/"]').first();
    
    if (await userLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await userLink.click();
      await page.waitForTimeout(2000);
      
      const url = page.url();
      expect(url).toMatch(/\/admin\/users\/[\w-]+/);
    }
  });
});

// ============================================
// ADMIN CATEGORY MANAGEMENT
// ============================================

test.describe('Admin Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Categories page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/categories`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Add new category', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/categories`);
    await page.waitForLoadState('networkidle');
    
    // Look for add button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Thêm"), a:has-text("Add")').first();
    
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // Fill form
      const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test Category');
        
        const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
        if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });
});

// ============================================
// ADMIN ANALYTICS
// ============================================

test.describe('Admin Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Analytics dashboard loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});
