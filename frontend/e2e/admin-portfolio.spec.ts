import fs from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bookstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

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
  const dir = path.resolve(process.cwd(), "../docs/portfolio/screenshots", getScreenshotFolder(testInfo));
  await fs.mkdir(dir, { recursive: true });
  await page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: true,
  });
}

async function assertNoMojibake(page: Page) {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/[ÃÄ�]/);
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator("#email").fill(ADMIN_EMAIL);
  await page.locator("#password").fill(ADMIN_PASSWORD);

  await Promise.all([
    page.waitForURL(/\/admin$/),
    page.locator('button[type="submit"]').click(),
  ]);
}

test.beforeEach(async ({ page }) => {
  await setVietnameseLocale(page);
});

test.describe("Admin portfolio smoke", () => {
  test("login page is clean for portfolio capture", async ({ page }, testInfo) => {
    await page.goto("/login", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByText(/Đăng ký ngay/)).toBeVisible();
    await expect(page.getByText(/demo accounts/i)).toHaveCount(0);
    await expect(page.getByText(/admin@bookstore\.com/i)).toHaveCount(0);

    await assertNoMojibake(page);
    await capture(page, testInfo, "login");
  });

  test("admin routes render and core CTAs respond", async ({ page }, testInfo) => {
    await loginAsAdmin(page);

    await expect(page.getByRole("heading", { name: "Bảng điều khiển quản trị" })).toBeVisible();
    await page.getByRole("button", { name: "Làm mới" }).click();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-dashboard");

    await page.goto("/admin/products", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Quản lý sản phẩm" })).toBeVisible();
    await expect(page.getByPlaceholder("Tìm kiếm sản phẩm...")).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-products");

    await page.goto("/admin/orders", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Quản lý đơn hàng" })).toBeVisible();
    await expect(page.getByPlaceholder("Tìm theo mã đơn hoặc email...")).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-orders");

    const firstViewButton = page.getByRole("button", { name: "Xem chi tiết đơn hàng" }).first();
    await expect(firstViewButton).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/admin\/orders\/\d+$/),
      firstViewButton.click(),
    ]);

    await expect(page.getByRole("heading", { name: /ORD-/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sản phẩm trong đơn/ })).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-order-detail");

    await page.goto("/admin/users", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Quản lý người dùng" })).toBeVisible();
    await expect(page.getByPlaceholder("Tìm kiếm theo tên hoặc email...")).toBeVisible();
    await assertNoMojibake(page);
    await capture(page, testInfo, "admin-users");

    const userDetailButton = page.getByRole("button", { name: "Chi tiết người dùng" }).first();
    if (await userDetailButton.count()) {
      await userDetailButton.click();
      await expect(page.getByRole("heading", { name: "Chi tiết người dùng" })).toBeVisible();
    }
  });
});
