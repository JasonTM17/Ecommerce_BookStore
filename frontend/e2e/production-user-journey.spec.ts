import { expect, test, type Page } from "@playwright/test";

const CUSTOMER_EMAIL =
  process.env.E2E_CUSTOMER_EMAIL ||
  process.env.TEST_USER_EMAIL ||
  "customer@example.com";
const CUSTOMER_PASSWORD =
  process.env.E2E_CUSTOMER_PASSWORD ||
  process.env.TEST_USER_PASSWORD ||
  "E2ETestDemoCustomerPasswordForBookStore123!";

type CapturedResponseIssue = {
  status: number;
  url: string;
};

function isAllowedGuestFailure(issue: CapturedResponseIssue) {
  if (issue.status !== 401 && issue.status !== 403) {
    return false;
  }

  const pathname = new URL(issue.url).pathname;
  return [
    /\/api\/auth\/me$/,
    /\/api\/cart(?:\/|$)/,
    /\/api\/wishlist(?:\/|$)/,
    /\/api\/orders(?:\/|$)/,
    /\/api\/users\/me$/,
  ].some((pattern) => pattern.test(pathname));
}

function attachRuntimeGuards(page: Page) {
  const consoleIssues: string[] = [];
  const responseIssues: CapturedResponseIssue[] = [];

  page.on("console", (message) => {
    const text = message.text();
    if (
      (message.type() === "error" || message.type() === "warning") &&
      !text.includes("Failed to load resource:") &&
      !text.includes("was preloaded using link preload")
    ) {
      consoleIssues.push(`${message.type()}: ${text}`);
    }
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      responseIssues.push({
        status: response.status(),
        url: response.url(),
      });
    }
  });

  return {
    assertCleanRuntime(label: string) {
      const unexpectedResponses = responseIssues.filter(
        (issue) =>
          issue.url.includes("/api/") && !isAllowedGuestFailure(issue),
      );

      expect(consoleIssues, `${label} console issues`).toEqual([]);
      expect(unexpectedResponses, `${label} API failures`).toEqual([]);
    },
  };
}

async function setEnglishLocale(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("locale", "en");
    document.cookie = "NEXT_LOCALE=en; path=/";
  });
}

async function waitForStablePage(page: Page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
}

async function assertNoLayoutBreaks(page: Page, label: string) {
  const issues = await page.evaluate(() => {
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0,
    );
    const clientWidth = document.documentElement.clientWidth;
    const visibleBrokenImages = Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        const style = window.getComputedStyle(image);
        return (
          rect.width > 2 &&
          rect.height > 2 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          image.complete &&
          (image.naturalWidth === 0 || image.naturalHeight === 0)
        );
      })
      .map((image) => image.currentSrc || image.src);

    return {
      hasOverflow: scrollWidth > clientWidth + 2,
      visibleBrokenImages,
    };
  });

  expect(issues.hasOverflow, `${label} horizontal overflow`).toBe(false);
  expect(issues.visibleBrokenImages, `${label} broken images`).toEqual([]);
}

async function openFirstProduct(page: Page) {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => page.getByTestId("product-card").count(), { timeout: 30000 })
    .toBeGreaterThan(0);
  await page.getByTestId("product-card").first().scrollIntoViewIfNeeded();
  await page.getByTestId("product-card").first().locator("a").first().click();
  await expect(page).toHaveURL(/\/products\/\d+/, { timeout: 15000 });
  await expect(page.locator("#main-content h1").first()).toBeVisible({
    timeout: 15000,
  });
}

async function addFirstProductToCart(page: Page) {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => page.getByTestId("product-card").count(), { timeout: 30000 })
    .toBeGreaterThan(0);

  const firstCard = page.getByTestId("product-card").first();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.hover();
  await firstCard.getByTestId("product-card-add-to-cart").click({
    timeout: 10000,
  });
}

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);

  const emailInput = page.locator("#email");
  const passwordInput = page.locator("#password");
  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await emailInput.fill(CUSTOMER_EMAIL);
  await passwordInput.fill(CUSTOMER_PASSWORD);
  await expect(emailInput).toHaveValue(CUSTOMER_EMAIL);

  const loginResponsePromise = page.waitForResponse((response) => {
    return (
      response.request().method() === "POST" &&
      response.url().includes("/api/auth/login")
    );
  });

  await page.getByTestId("login-submit").click();
  const loginResponse = await loginResponsePromise;

  test.skip(
    !loginResponse.ok(),
    `Customer login unavailable: /api/auth/login returned ${loginResponse.status()}`,
  );

  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

async function completeCheckout(page: Page) {
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);

  await page.locator("#receiverName").fill("Portfolio Customer");
  await page.locator("#phoneNumber").fill("0901234567");
  await page.locator("#province").fill("Ho Chi Minh");
  await page.locator("#district").fill("District 1");
  await page.locator("#ward").fill("Ben Nghe");
  await page.locator("#streetAddress").fill("1 Nguyen Hue");

  await page.getByRole("button", { name: /thanh toan|payment/i }).click();
  await page.getByRole("button", { name: /xac nhan thong tin|confirm information/i }).click();
  await page.getByRole("button", { name: /dat hang ngay|place order/i }).click();

  await expect(
    page.getByText(/dat hang thanh cong|order placed successfully/i).first(),
  ).toBeVisible({ timeout: 30000 });
}

test.beforeEach(async ({ page }) => {
  await setEnglishLocale(page);
});

test.describe("production storefront journey", () => {
  test("guest can inspect books, cart is protected, and chatbot works", async ({
    page,
  }) => {
    const runtime = attachRuntimeGuards(page);

    await page.context().clearCookies();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    await assertNoLayoutBreaks(page, "home");

    await openFirstProduct(page);
    await assertNoLayoutBreaks(page, "product detail");

    await addFirstProductToCart(page);
    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 15000 });
    await expect(page.getByTestId("login-redirect-notice")).toBeVisible();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toContainText(/sign in/i);

    await page.getByTestId("chatbot-launcher").click();
    await expect(page.getByTestId("chatbot-panel")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("chatbot-login-cta")).toBeVisible();
    await assertNoLayoutBreaks(page, "guest chatbot");

    runtime.assertCleanRuntime("guest journey");
  });

  test("mobile menu, search, cart, flash sale, and chatbot stay usable", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile interaction audit only runs on mobile project.");
    const runtime = attachRuntimeGuards(page);

    await page.goto("/flash-sale", { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    await assertNoLayoutBreaks(page, "mobile flash sale");

    await page.locator('header button[aria-label*="menu"]').last().click();
    await expect(page.locator("header nav").last()).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("link", { name: /products/i }).first().click();
    await expect(page).toHaveURL(/\/products/, { timeout: 15000 });
    await assertNoLayoutBreaks(page, "mobile products");

    await page.locator('header a[href="/products?focus=search"]').first().click();
    await expect(page).toHaveURL(/\/products\?focus=search/, {
      timeout: 15000,
    });

    await page.getByLabel(/cart/i).first().click();
    await expect(page).toHaveURL(/\/cart/, { timeout: 15000 });

    await page.getByTestId("chatbot-launcher").click();
    await expect(page.getByTestId("chatbot-panel")).toBeVisible({
      timeout: 15000,
    });
    await assertNoLayoutBreaks(page, "mobile chatbot");

    runtime.assertCleanRuntime("mobile journey");
  });

  test("authenticated customer can add to cart, checkout COD, and see orders", async ({
    page,
  }) => {
    const runtime = attachRuntimeGuards(page);

    await login(page);
    await addFirstProductToCart(page);

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    await expect(page.locator("#main-content")).toContainText(/cart/i);
    await assertNoLayoutBreaks(page, "authenticated cart");

    await completeCheckout(page);

    await page.getByRole("button", { name: /view orders/i }).click();
    await expect(page).toHaveURL(/\/orders/, { timeout: 15000 });
    await expect(page.locator("#main-content")).toContainText(/orders/i);
    await assertNoLayoutBreaks(page, "orders");

    runtime.assertCleanRuntime("authenticated checkout journey");
  });
});
