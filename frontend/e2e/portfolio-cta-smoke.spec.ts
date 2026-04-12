import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __copiedText?: string;
    __openCalls?: string[][];
  }
}

const CUSTOMER_EMAIL = process.env.TEST_USER_EMAIL || "customer@example.com";
const CUSTOMER_PASSWORD = process.env.TEST_USER_PASSWORD || "Customer123!";

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

async function getFirstProductPath(page: Page) {
  await page.goto("/products");
  const firstCard = page.getByTestId("product-card").first();
  await expect(firstCard).toBeVisible();

  const productLink = firstCard.locator('a[href^="/products/"]').first();
  const productPath = await productLink.getAttribute("href");

  if (!productPath) {
    throw new Error("Unable to resolve a product detail path from the product grid.");
  }

  return { firstCard, productPath };
}

async function login(page: Page) {
  await page.locator("#email").fill(CUSTOMER_EMAIL);
  await page.locator("#password").fill(CUSTOMER_PASSWORD);

  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 }),
    page.locator('button[type="submit"]').click(),
  ]);
}

test.beforeEach(async ({ page }) => {
  await setVietnameseLocale(page);
});

test.describe("Portfolio CTA smoke", () => {
  test("guest add-to-cart on product cards redirects back through login", async ({ page }) => {
    const { firstCard } = await getFirstProductPath(page);

    await firstCard.hover();
    await expect(firstCard.getByTestId("product-card-add-to-cart")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login\?redirect=%2Fproducts$/),
      firstCard.getByTestId("product-card-add-to-cart").click(),
    ]);

    await expect(page.getByText("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")).toBeVisible();
  });

  test("guest wishlist on product cards redirects back through login", async ({ page }) => {
    const { firstCard } = await getFirstProductPath(page);

    await firstCard.hover();
    await expect(firstCard.getByTestId("product-card-wishlist")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login\?redirect=%2Fproducts$/),
      firstCard.getByTestId("product-card-wishlist").click(),
    ]);
  });

  test("protected routes preserve redirect targets for guests", async ({ page }) => {
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login\?redirect=%2Forders$/);

    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout$/);
  });

  test("product detail redirect returns after login and wishlist items can be added to cart", async ({ page }) => {
    const { productPath } = await getFirstProductPath(page);

    await page.goto(productPath);
    const productName = (await page.locator("h1").first().textContent())?.trim() || "";

    await Promise.all([
      page.waitForURL(new RegExp(`/login\\?redirect=${encodeURIComponent(productPath).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)),
      page.getByTestId("product-detail-wishlist").click(),
    ]);

    await login(page);
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(productPath)}$`));

    await page.getByRole("button", { name: /Thêm vào giỏ hàng/i }).click();
    await expect(page.getByText(/Đã thêm/)).toBeVisible();

    const wishlistButton = page.getByTestId("product-detail-wishlist");
    const wishlistLabel = await wishlistButton.getAttribute("aria-label");

    if (wishlistLabel?.includes("Thêm")) {
      await wishlistButton.click();
      await expect(page.getByText("Đã thêm vào danh sách yêu thích")).toBeVisible();
    }

    await page.goto("/wishlist");
    await expect(page).toHaveURL(/\/wishlist$/);

    const wishlistItem = page.getByTestId("wishlist-item").filter({ hasText: productName }).first();
    await expect(wishlistItem).toBeVisible();

    await wishlistItem.getByTestId("wishlist-add-to-cart").click();
    await expect(page.getByText(/Đã thêm/)).toBeVisible();
  });

  test("share and newsletter CTAs perform real handoff actions", async ({ page }) => {
    await installBrowserActionSpies(page);

    const { productPath } = await getFirstProductPath(page);
    await page.goto(productPath);

    await page.getByTestId("product-detail-share").click();
    await expect(page.getByText("Đã sao chép liên kết sản phẩm")).toBeVisible();

    const copiedText = await page.evaluate(() => window.__copiedText);
    expect(copiedText).toContain(productPath);

    await page.goto("/");
    const newsletterInput = page.locator("footer #newsletter-email");
    await newsletterInput.scrollIntoViewIfNeeded();
    await newsletterInput.fill("portfolio@example.com");
    await page.locator('footer button[type="submit"]').click();

    await expect(page.getByTestId("newsletter-confirmation")).toBeVisible();

    const openCalls = await page.evaluate(() => window.__openCalls || []);
    expect(openCalls[0]?.[0]).toContain("mailto:contact@bookstore.com");
  });
});
