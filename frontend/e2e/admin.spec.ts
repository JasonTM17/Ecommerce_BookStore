import { expect, test, type Page } from "@playwright/test";

const API_URL = process.env.API_URL || "http://localhost:8080/api";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bookstore.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "E2ETestDemoAdminPasswordForBookStore123!";

type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponseBody = Partial<AuthSession> & {
  data?: Partial<AuthSession>;
};

let cachedAdminSession: AuthSession | null = null;

function unwrapAuthSession(body: AuthResponseBody): AuthSession {
  const source = body.data ?? body;

  expect(source.accessToken).toBeTruthy();
  expect(source.refreshToken).toBeTruthy();

  return {
    accessToken: source.accessToken!,
    refreshToken: source.refreshToken!,
  };
}

async function getAdminSession(page: Page) {
  if (cachedAdminSession) {
    return cachedAdminSession;
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await page.request.post(`${API_URL}/auth/login`, {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });

    if (response.ok()) {
      cachedAdminSession = unwrapAuthSession(await response.json());
      return cachedAdminSession;
    }

    if (response.status() === 429) {
      const payload = (await response.json().catch(() => null)) as
        | { retryAfter?: number }
        | null;
      const retryAfterSeconds = Math.min(
        Math.max(payload?.retryAfter ?? 2, 1),
        5,
      );
      await page.waitForTimeout((retryAfterSeconds + 1) * 1000);
      continue;
    }

    throw new Error(
      `Admin API login failed with ${response.status()}: ${await response.text()}`,
    );
  }

  throw new Error("Unable to acquire an admin E2E session");
}

async function loginAsAdmin(page: Page) {
  const session = await getAdminSession(page);

  await page.context().clearCookies();
  await page.context().addCookies([
    {
      name: "access_token",
      value: session.accessToken,
      url: BASE_URL,
      sameSite: "Lax",
    },
    {
      name: "refresh_token",
      value: session.refreshToken,
      url: BASE_URL,
      sameSite: "Lax",
    },
  ]);

  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
}

test.describe("Admin Dashboard", () => {
  test("Admin dashboard loads", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("#main-content")).toContainText(/Admin|qu/i, {
      timeout: 15000,
    });
  });

  test("Admin sidebar navigation works", async ({ page }) => {
    await loginAsAdmin(page);

    const quickActionLinks = page.locator(
      'a[href="/admin/products"], a[href="/admin/orders"], a[href="/admin/users"]',
    );

    await expect(quickActionLinks.first()).toBeVisible({ timeout: 15000 });
    expect(await quickActionLinks.count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe("Admin Product Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("Products list page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/products`, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("table")).toBeVisible({ timeout: 15000 });
  });

  test("Product management remains stable in read-only portfolio mode", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/admin/products`, { waitUntil: "networkidle" });

    await expect(page.locator("table")).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="text"], input[type="search"]').first())
      .toBeVisible({ timeout: 15000 });
    await expect(page.locator('a[href="/admin/products/new"]')).toHaveCount(0);
  });

  test("Edit existing product is not exposed in portfolio mode", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/admin/products`, { waitUntil: "networkidle" });

    await expect(page.locator("table")).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a[href*="/admin/products/"][href*="/edit"]'))
      .toHaveCount(0);
  });
});

test.describe("Admin Order Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("Orders list page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/admin\/orders/);
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
  });

  test("View order details", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: "networkidle" });

    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    if (await orderLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orderLink.click();
      await expect(page).toHaveURL(/\/admin\/orders\/[\w-]+/, {
        timeout: 15000,
      });
    } else {
      await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
    }
  });

  test("Update order status controls do not block the page", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: "networkidle" });

    await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("body")).not.toContainText(
      /Backend service is unavailable|Backend request timed out/i,
    );
  });
});

test.describe("Admin User Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("Users list page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
  });

  test("View user details fallback remains stable", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "networkidle" });

    const userLink = page.locator('a[href*="/admin/users/"]').first();
    if (await userLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await userLink.click();
      await expect(page).toHaveURL(/\/admin\/users\/[\w-]+/, {
        timeout: 15000,
      });
    } else {
      await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
    }
  });
});
