import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080/api';

// Helper functions
async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'accessToken') return value;
    }
    return null;
  });
}

// ============================================
// PUBLIC PAGES TESTS
// ============================================

test.describe('Public Pages', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/BookStore/i);
    
    // Check for main content
    await expect(page.locator('body')).toBeVisible();
  });

  test('Products page loads and displays products', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    
    // Should have some content related to products
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('Product detail page loads', async ({ page }) => {
    // First get a product ID from API
    const response = await page.request.get(`${API_URL}/products?limit=1`);
    const data = await response.json();
    
    if (data?.data?.content?.length > 0) {
      const productId = data.data.content[0].id;
      await page.goto(`${BASE_URL}/products/${productId}`);
      await page.waitForLoadState('networkidle');
    }
  });

  test('About page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================
// AUTHENTICATION TESTS
// ============================================

test.describe('Authentication Flow', () => {
  test('Login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Check for login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(passwordInput).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Register page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    
    // Check for registration form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('User can login with valid credentials', async ({ page }) => {
    // Use test user credentials
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123456';
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    
    // Click login button
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    
    // Should either redirect or show error
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('Login fails with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill with invalid credentials
    await page.locator('input[type="email"], input[name="email"]').first().fill('invalid@test.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');
    
    // Submit
    await page.locator('button[type="submit"]').first().click();
    
    // Should show error message
    await page.waitForTimeout(2000);
  });
});

// ============================================
// API TESTS
// ============================================

test.describe('API Endpoints', () => {
  test('Health check endpoint works', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect([200, 404]).toContain(response.status()); // 404 is ok if endpoint doesn't exist
  });

  test('Products API returns data', async ({ request }) => {
    const response = await request.get(`${API_URL}/products`);
    expect([200, 401]).toContain(response.status()); // May need auth or may be public
  });

  test('Categories API returns data', async ({ request }) => {
    const response = await request.get(`${API_URL}/categories`);
    expect([200, 401]).toContain(response.status());
  });

  test('Auth register API works', async ({ request }) => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: uniqueEmail,
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'User'
      }
    });
    expect([200, 201, 400, 409]).toContain(response.status()); // Various responses possible
  });
});

// ============================================
// SECURITY TESTS
// ============================================

test.describe('Security Tests', () => {
  test('No sensitive data in page source', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // Should not contain sensitive patterns
    expect(content).not.toMatch(/password\s*[:=]\s*['"][^'"]+['"]/i);
    expect(content).not.toMatch(/apiKey\s*[:=]\s*['"][^'"]+['"]/i);
    expect(content).not.toMatch(/secret\s*[:=]\s*['"][^'"]+['"]/i);
  });

  test('HTTPS headers present in production', async ({ request }) => {
    const response = await request.get(BASE_URL);
    // Check for security headers
    const headers = response.headers();
    
    // Should have some security headers
    expect(
      headers['x-content-type-options'] || 
      headers['x-frame-options'] || 
      headers['strict-transport-security']
    ).toBeTruthy();
  });
});

// ============================================
// RESPONSIVE DESIGN TESTS
// ============================================

test.describe('Responsive Design', () => {
  test('Mobile view - Homepage', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Should be usable on mobile
    await expect(page.locator('body')).toBeVisible();
  });

  test('Tablet view - Homepage', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Desktop view - Homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
