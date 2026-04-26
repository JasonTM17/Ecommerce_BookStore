import fs from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bookstore.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "E2ETestDemoAdminPasswordForBookStore123!";
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "manager@bookstore.com";
const MANAGER_PASSWORD =
  process.env.MANAGER_PASSWORD || "E2ETestDemoManagerPasswordForBookStore123!";

async function setVietnameseLocale(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("locale", "vi");
    document.cookie = "NEXT_LOCALE=vi; path=/";
  });
}

function getScreenshotFolder(testInfo: TestInfo) {
  return testInfo.project.name === "Mobile Chrome" ? "mobile" : "desktop";
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const dir = path.resolve(
    process.cwd(),
    "../docs/portfolio/screenshots",
    getScreenshotFolder(testInfo),
  );

  await fs.mkdir(dir, { recursive: true });
  await page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: true,
  });
}

async function assertNoMojibake(page: Page) {
  const bodyText = await page.locator("body").innerText();
  const suspiciousSequences = [
    "Ä‘",
    "Äƒ",
    "Ä",
    "Ã¡",
    "Ã ",
    "Ã¢",
    "Ã£",
    "Ã¨",
    "Ã©",
    "Ãª",
    "Ã¬",
    "Ã­",
    "Ã²",
    "Ã³",
    "Ã´",
    "Ãµ",
    "Ã¹",
    "Ãº",
    "Ã½",
    "Æ°",
    "Æ¡",
    "á»",
    "áº",
  ];

  for (const sequence of suspiciousSequences) {
    expect(bodyText).not.toContain(sequence);
  }

  expect(bodyText).not.toContain("�");
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);

  let loginSucceeded = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const loginResponsePromise = page.waitForResponse((response) => {
      return (
        response.request().method() === "POST" &&
        response.url().includes("/api/auth/login")
      );
    });

    await page.locator('button[type="submit"]').click();

    const loginResponse = await loginResponsePromise;
    if (loginResponse.ok()) {
      loginSucceeded = true;
      break;
    }

    if (loginResponse.status() !== 429) {
      expect(loginResponse.ok()).toBeTruthy();
    }

    const payload = (await loginResponse.json().catch(() => null)) as
      | { retryAfter?: number }
      | null;
    const retryAfterSeconds = Math.max(payload?.retryAfter ?? 3, 1);
    await page.waitForTimeout((retryAfterSeconds + 1) * 1000);
  }

  expect(loginSucceeded).toBeTruthy();

  await expect
    .poll(() => page.url(), { timeout: 15000 })
    .toContain("/admin");

  await expect(
    page.getByRole("heading", { name: /bảng điều khiển quản trị/i }),
  ).toBeVisible({ timeout: 15000 });
}

test.beforeEach(async ({ page }) => {
  await setVietnameseLocale(page);
});

test.describe("Admin portfolio smoke", () => {
  test("login page is clean for portfolio capture", async ({ page }, testInfo) => {
    await page.goto("/login", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { name: /đăng nhập/i }),
    ).toBeVisible();
    await expect(page.getByText(/đăng ký ngay/i)).toBeVisible();
    await expect(page.getByText(/demo accounts/i)).toHaveCount(0);
    await expect(page.getByText(/admin@bookstore\.com/i)).toHaveCount(0);

    await assertNoMojibake(page);
    await capture(page, testInfo, "login");
  });

  test("admin routes render and core CTAs respond", async ({ page }, testInfo) => {
    test.slow();
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.getByRole("button", { name: /làm mới/i }).click();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-dashboard");

    await page.goto("/admin/products", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /quản lý sản phẩm/i }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder(/tìm kiếm sản phẩm/i)).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-products");

    await page.goto("/admin/orders", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /quản lý đơn hàng/i }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByPlaceholder(/tìm theo mã đơn hoặc email/i),
    ).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-orders");

    const firstOrderDetailButton = page
      .getByRole("button", { name: /xem chi tiết đơn hàng/i })
      .first();
    await expect(firstOrderDetailButton).toBeVisible({ timeout: 15000 });

    await Promise.all([
      page.waitForURL(/\/admin\/orders\/\d+$/),
      firstOrderDetailButton.click(),
    ]);

    await expect(page.getByRole("heading", { name: /ORD/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: /sản phẩm trong đơn/i }),
    ).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-order-detail");

    await page.goto("/admin/users", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /quản lý người dùng/i }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByPlaceholder(/tìm kiếm theo tên hoặc email/i),
    ).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-users");

    const userDetailButton = page
      .getByRole("button", { name: /chi tiết người dùng/i })
      .first();
    await expect(userDetailButton).toBeVisible({ timeout: 15000 });
    await userDetailButton.click();
    await expect(
      page.getByRole("heading", { name: /chi tiết người dùng/i }),
    ).toBeVisible();
  });

  test("manager can access the shared admin surface", async ({ page }) => {
    test.slow();
    await login(page, MANAGER_EMAIL, MANAGER_PASSWORD);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: /bảng điều khiển quản trị/i }),
    ).toBeVisible();
  });
});
