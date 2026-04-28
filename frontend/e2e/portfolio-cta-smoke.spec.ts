import { expect, test, type Locator, type Page } from "@playwright/test";

declare global {
  interface Window {
    __copiedText?: string;
    __openCalls?: string[][];
  }
}

const CUSTOMER_EMAIL = process.env.TEST_USER_EMAIL || "customer@example.com";
const CUSTOMER_PASSWORD =
  process.env.TEST_USER_PASSWORD || "E2ETestDemoCustomerPasswordForBookStore123!";
const API_URL = process.env.API_URL || "http://localhost:3001/api";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function setVietnameseLocale(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("locale", "vi");
    document.cookie = "NEXT_LOCALE=vi; path=/";
  });
}

async function installBrowserActionSpies(page: Page) {
  await page.addInitScript(() => {
    window.__copiedText = "";
    window.__openCalls = [];

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          window.__copiedText = value;
        },
      },
    });

    window.open = (...args: unknown[]) => {
      window.__openCalls!.push(args.map((arg) => String(arg)));
      return null;
    };
  });
}

async function expectImageLoaded(image: Locator) {
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible({ timeout: 15000 });
  await expect
    .poll(
      async () =>
        image.evaluate((img) => {
          const element = img as HTMLImageElement;
          return element.complete && element.naturalWidth > 0;
        }),
      { timeout: 15000 },
    )
    .toBe(true);
}

async function waitForProductCards(page: Page, minCount = 1) {
  await expect
    .poll(async () => page.getByTestId("product-card").count(), {
      timeout: 30000,
    })
    .toBeGreaterThan(minCount - 1);
}

async function getFirstProductCard(page: Page) {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await waitForProductCards(page);
  const firstCard = page.getByTestId("product-card").first();
  await expect(firstCard).toBeVisible({ timeout: 15000 });
  return firstCard;
}

async function getFlashSaleCard(page: Page, index = 0) {
  await page.goto("/flash-sale", { waitUntil: "networkidle" });
  await expect
    .poll(async () => page.getByTestId("flash-sale-card").count(), {
      timeout: 20000,
    })
    .toBeGreaterThan(index);
  const card = page.getByTestId("flash-sale-card").nth(index);
  await expect(card).toBeVisible({ timeout: 15000 });
  return card;
}

async function login(page: Page) {
  await page.waitForLoadState("networkidle");

  let loginSucceeded = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.locator("#email").fill(CUSTOMER_EMAIL);
    await page.locator("#password").fill(CUSTOMER_PASSWORD);

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

    if (loginResponse.status() === 401) {
      await page.waitForTimeout(1000);
      continue;
    }

    if (loginResponse.status() !== 429) {
      const loginBodyText = await page.locator("body").innerText();
      throw new Error(
        `Login did not complete successfully. Current page copy: ${loginBodyText.slice(0, 300)}`,
      );
    }

    const payload = (await loginResponse.json().catch(() => null)) as {
      retryAfter?: number;
    } | null;
    const retryAfterSeconds = Math.max(payload?.retryAfter ?? 3, 1);
    await page.waitForTimeout((retryAfterSeconds + 1) * 1000);
  }

  expect(loginSucceeded).toBeTruthy();
  await expect
    .poll(() => page.url(), { timeout: 15000 })
    .not.toContain("/login");
}

async function clearCart(page: Page) {
  await page.context().request.delete(`${API_URL}/cart`);
  await page.goto("/cart", { waitUntil: "networkidle" });
}

function extractCurrencyText(value: string) {
  const match = value.match(/\d[\d.\s,]*[₫đ]/u);
  if (!match) {
    throw new Error(`Unable to resolve a currency value from: ${value}`);
  }
  return match[0].replace(/\s+/g, " ").trim();
}

test.beforeEach(async ({ page }) => {
  await setVietnameseLocale(page);
});

test.describe("Portfolio CTA smoke", () => {
  test("product cards navigate cleanly and guest redirects preserve intent", async ({
    page,
  }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await waitForProductCards(page, 6);

    const targetCard = page.getByTestId("product-card").nth(5);
    await targetCard.scrollIntoViewIfNeeded();
    await expectImageLoaded(targetCard.locator("img").first());

    const productLink = targetCard.locator('a[href^="/products/"]').first();
    const productPath = await productLink.getAttribute("href");
    if (!productPath) {
      throw new Error(
        "Unable to resolve a product path from the product grid.",
      );
    }

    await Promise.all([
      page.waitForURL(new RegExp(`${escapeRegExp(productPath)}$`)),
      productLink.click(),
    ]);

    await page.waitForLoadState("networkidle");
    await expect(page.locator("#main-content h1").first()).toBeVisible({
      timeout: 15000,
    });
    await expect
      .poll(() => page.evaluate(() => window.scrollY), {
        timeout: 5000,
      })
      .toBeLessThanOrEqual(64);

    const firstCard = await getFirstProductCard(page);
    await firstCard.hover();
    await expect(
      firstCard.getByTestId("product-card-add-to-cart"),
    ).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login\?redirect=%2Fproducts$/),
      firstCard.getByTestId("product-card-add-to-cart").click(),
    ]);
    await expect(page.getByTestId("login-redirect-notice")).toContainText(
      /thêm sản phẩm vào giỏ hàng|add .*cart/i,
    );

    const wishlistCard = await getFirstProductCard(page);
    await wishlistCard.hover();

    await Promise.all([
      page.waitForURL(/\/login\?redirect=%2Fproducts$/),
      wishlistCard.getByTestId("product-card-wishlist").click(),
    ]);

    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login\?redirect=%2Forders$/);

    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout$/);
  });

  test("authenticated customer can buy an active flash-sale book with COD end-to-end", async ({
    page,
  }) => {
    test.slow();

    await page.goto("/login", { waitUntil: "networkidle" });
    await login(page);
    await clearCart(page);

    const flashSaleCard = await getFlashSaleCard(page, 0);
    await expectImageLoaded(flashSaleCard.locator("img").first());

    const productPath = await flashSaleCard.getAttribute("href");
    if (!productPath) {
      throw new Error("Unable to resolve a flash sale product path.");
    }

    const flashSaleCardText = await flashSaleCard.innerText();
    const salePriceText = extractCurrencyText(flashSaleCardText);
    const productName =
      (await flashSaleCard.locator("h3").textContent())?.trim() || "";

    await Promise.all([
      page.waitForURL(new RegExp(`${escapeRegExp(productPath)}$`)),
      flashSaleCard.click(),
    ]);

    await expect(page.getByTestId("flash-sale-countdown-card")).toBeVisible();
    await expect(
      page.getByTestId("product-detail-flash-sale-context"),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-detail-flash-sale-context"),
    ).toContainText(/flash sale đang diễn ra|flash sale is live/i);
    await expect(
      page
        .getByTestId("product-detail-price-panel")
        .getByText(salePriceText, { exact: false }),
    ).toBeVisible();
    await expectImageLoaded(page.locator("main img").first());

    await page.getByTestId("product-detail-add-to-cart").click();
    await expect(page.getByText(/đã thêm|added/i)).toBeVisible({
      timeout: 15000,
    });

    await page.goto("/cart", { waitUntil: "networkidle" });
    await expect(
      page
        .locator("main")
        .getByRole("link", { name: productName, exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.locator("main").getByText(salePriceText, { exact: false }).first(),
    ).toBeVisible();
    await expectImageLoaded(page.locator("main img").first());

    await page.getByRole("button", { name: /thanh toán|checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.locator("#receiverName").fill("Khách Hàng Portfolio");
    await page.locator("#phoneNumber").fill("0901231234");
    await page.locator("#province").fill("Hồ Chí Minh");
    await page.locator("#district").fill("Quận 1");
    await page.locator("#ward").fill("Phường Bến Nghé");
    await page.locator("#streetAddress").fill("1 Nguyễn Huệ");
    await page.locator("#notes").fill("Giao giờ hành chính");

    await page
      .getByRole("button", { name: /tiếp tục thanh toán|continue to payment/i })
      .click();

    const vnPayOption = page.locator('input[name="payment"][value="VNPAY"]');
    if (await vnPayOption.count()) {
      await expect(vnPayOption).toBeDisabled();
    }

    await page
      .getByRole("button", { name: /xác nhận thông tin|confirm information/i })
      .click();
    await page
      .getByRole("button", { name: /đặt hàng ngay|place order/i })
      .click();

    await expect(
      page.getByText(/đặt hàng thành công|order placed successfully/i),
    ).toBeVisible({ timeout: 20000 });

    const successSummary = await page.locator("#main-content").innerText();
    const orderNumber = successSummary.match(/ORD\d+/)?.[0];
    if (!orderNumber) {
      throw new Error(
        "Unable to extract the created order number from checkout success.",
      );
    }

    await page
      .getByRole("button", { name: /xem đơn hàng|view orders/i })
      .click();
    await expect(page).toHaveURL(/\/orders$/);
    await expect(
      page.locator("#main-content").getByText(orderNumber, { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: /chi tiết|details/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/orders\/\d+$/);
    await expect(
      page.locator("#main-content").getByText(orderNumber, { exact: false }),
    ).toBeVisible();
    await expect(
      page
        .locator("#main-content")
        .getByText(productName, { exact: false })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator("#main-content")
        .getByText(salePriceText, { exact: false })
        .first(),
    ).toBeVisible();
    await expectImageLoaded(page.locator("#main-content img").first());
  });

  test("share, newsletter, and chatbot interactions are real", async ({
    page,
  }) => {
    test.slow();
    await installBrowserActionSpies(page);

    const firstCard = await getFirstProductCard(page);
    const productLink = firstCard.locator('a[href^="/products/"]').first();
    const productPath = await productLink.getAttribute("href");
    if (!productPath) {
      throw new Error("Unable to resolve a product detail path.");
    }

    await page.goto(productPath, { waitUntil: "networkidle" });
    await page.getByTestId("product-detail-share").click();
    await expect(page.getByText(/đã sao chép|copied/i)).toBeVisible();

    const copiedText = await page.evaluate(() => window.__copiedText);
    expect(copiedText).toContain(productPath);

    await page.goto("/", { waitUntil: "networkidle" });
    const newsletterInput = page.locator("footer #newsletter-email");
    await newsletterInput.scrollIntoViewIfNeeded();
    await newsletterInput.fill("portfolio@example.com");
    await page.locator('footer button[type="submit"]').click();

    await expect(page.getByTestId("newsletter-confirmation")).toBeVisible();

    const openCalls = await page.evaluate(() => window.__openCalls || []);
    expect(openCalls[0]?.[0]).toContain("mailto:contact@bookstore.com");

    await page.getByTestId("chatbot-launcher").click();
    await expect(page.getByTestId("chatbot-login-cta")).toBeVisible();
    await expect(page.getByTestId("chatbot-status-badge")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login\?redirect=%2F$/),
      page.getByTestId("chatbot-login-cta").click(),
    ]);

    await login(page);
    await expect(page).toHaveURL(/\/$/);

    await page.getByTestId("chatbot-launcher").click();
    await expect(page.getByTestId("chatbot-status-badge")).toContainText(
      /grok|dự phòng|fallback|degraded/i,
    );
  });
});
