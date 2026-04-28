import { expect, test, type Page } from "@playwright/test";

type CapturedIssue = {
  status: number;
  url: string;
};

const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/categories",
  "/categories?id=1",
  "/promotions",
  "/flash-sale",
  "/about",
  "/contact",
  "/faq",
  "/blog",
  "/login",
  "/register",
  "/cart",
  "/checkout",
  "/wishlist",
  "/orders",
  "/account",
];

const VIEWPORTS = [
  { height: 1000, name: "desktop", width: 1440 },
  { height: 844, name: "mobile", width: 390 },
];

const API_ENDPOINTS = [
  "/api/health",
  "/api/products?page=0&size=12",
  "/api/products/featured",
  "/api/products/new",
  "/api/categories",
  "/api/categories/root",
  "/api/brands",
  "/api/flash-sales/active",
  "/api/coupons/available",
];

const MOJIBAKE_PATTERN_SOURCE = [
  "\\uFFFD",
  "[\\u00C2\\u00C3\\u00C4\\u00C6][\\u0080-\\u00BF]",
  "\\u00E1\\u00BA",
  "\\u00E1\\u00BB",
  "Nguy\\u00E1",
  "Tr\\u00E1",
  "S\\u00C6",
].join("|");

test.setTimeout(60000);

async function waitForPageToSettle(page: Page) {
  await page.waitForLoadState("load", { timeout: 30000 }).catch(() => {
    // The DOM audit below is the source of truth; keep this wait best-effort.
  });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {
    // Some pages keep background requests open. Response assertions still run.
  });
}

function isGenericResourceConsoleMessage(message: string) {
  return (
    message.includes("Failed to load resource:") ||
    (message.includes("was preloaded using link preload") &&
      message.includes("/_next/static/media/"))
  );
}

function isAllowedGuestFailure(issue: CapturedIssue) {
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

async function collectPageIssues(page: Page) {
  return page.evaluate((mojibakePatternSource) => {
    const bodyText = document.body?.innerText || "";
    const badMatch = bodyText.match(new RegExp(mojibakePatternSource, "u"));
    const normalizedBody = bodyText
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
    const emptyState =
      normalizedBody.includes("du lieu dang tam thoi chua san sang") ||
      normalizedBody.includes("vui long thu lai sau it phut");

    const brokenImages = Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        const style = window.getComputedStyle(image);
        const isVisible =
          rect.width > 2 &&
          rect.height > 2 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0;

        return (
          isVisible &&
          image.complete &&
          (image.naturalWidth === 0 || image.naturalHeight === 0)
        );
      })
      .map((image) => image.currentSrc || image.src);

    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0,
    );
    const clientWidth = document.documentElement.clientWidth;

    return {
      badTextSnippet: badMatch
        ? bodyText
            .slice(
              Math.max(0, (badMatch.index ?? 0) - 60),
              (badMatch.index ?? 0) + 120,
            )
            .replace(/\s+/g, " ")
        : "",
      brokenImages,
      emptyState,
      hasOverflow: scrollWidth > clientWidth + 2,
      textLength: bodyText.length,
    };
  }, MOJIBAKE_PATTERN_SOURCE);
}

async function auditPage(page: Page, routeLabel: string) {
  const issues = await collectPageIssues(page);

  expect(issues.hasOverflow, `${routeLabel} has horizontal overflow`).toBe(
    false,
  );
  expect(
    issues.brokenImages,
    `${routeLabel} has broken visible images`,
  ).toEqual([]);
  expect(issues.badTextSnippet, `${routeLabel} has mojibake text`).toBe("");
  expect(
    issues.emptyState,
    `${routeLabel} shows unavailable-data fallback`,
  ).toBe(false);
  expect(
    issues.textLength,
    `${routeLabel} rendered too little text`,
  ).toBeGreaterThan(50);
}

async function getFirstProductHref(page: Page) {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect
    .poll(async () => page.getByTestId("product-card").count(), {
      timeout: 30000,
    })
    .toBeGreaterThan(0);

  const href = await page
    .getByTestId("product-card")
    .first()
    .locator('a[href^="/products/"]')
    .first()
    .getAttribute("href");

  if (!href) {
    throw new Error("Unable to resolve the first product detail URL.");
  }

  return href;
}

test.describe("portfolio public API contract", () => {
  for (const endpoint of API_ENDPOINTS) {
    test(`${endpoint} returns healthy public data`, async ({ request }) => {
      const response = await request.get(endpoint, {
        headers: { accept: "application/json" },
      });
      expect(response.status(), endpoint).toBe(200);

      const payload = await response.json();
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.data)
            ? payload.data
            : null;

      if (endpoint !== "/api/health") {
        expect(data, `${endpoint} should expose an array payload`).toBeTruthy();
        expect(data!.length, `${endpoint} should not be empty`).toBeGreaterThan(
          0,
        );
      }
    });
  }
});

for (const viewport of VIEWPORTS) {
  test.describe(`portfolio audit ${viewport.name}`, () => {
    test.use({ viewport: { height: viewport.height, width: viewport.width } });

    for (const route of PUBLIC_ROUTES) {
      test(`${route} has stable UI and network`, async ({ page }) => {
        const consoleIssues: string[] = [];
        const responseIssues: CapturedIssue[] = [];

        page.on("console", (message) => {
          if (
            (message.type() === "error" || message.type() === "warning") &&
            !isGenericResourceConsoleMessage(message.text())
          ) {
            consoleIssues.push(`${message.type()}: ${message.text()}`);
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

        const response = await page.goto(route, {
          waitUntil: "domcontentloaded",
        });
        await waitForPageToSettle(page);

        expect(response?.status(), `${route} navigation status`).toBeLessThan(
          400,
        );
        await auditPage(page, `${viewport.name} ${route}`);

        const unexpectedResponses = responseIssues.filter(
          (issue) =>
            issue.url.includes("/api/") && !isAllowedGuestFailure(issue),
        );

        expect(consoleIssues, `${route} console issues`).toEqual([]);
        expect(unexpectedResponses, `${route} API failures`).toEqual([]);
      });
    }

    test("product detail has stable UI and network", async ({ page }) => {
      const consoleIssues: string[] = [];
      const responseIssues: CapturedIssue[] = [];

      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
          if (!isGenericResourceConsoleMessage(message.text())) {
            consoleIssues.push(`${message.type()}: ${message.text()}`);
          }
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

      const href = await getFirstProductHref(page);
      await page.goto(href, { waitUntil: "domcontentloaded" });
      await waitForPageToSettle(page);
      await expect(page.locator("#main-content h1").first()).toBeVisible({
        timeout: 15000,
      });
      await auditPage(page, `${viewport.name} product detail`);

      const unexpectedResponses = responseIssues.filter(
        (issue) => issue.url.includes("/api/") && !isAllowedGuestFailure(issue),
      );

      expect(consoleIssues, "product detail console issues").toEqual([]);
      expect(unexpectedResponses, "product detail API failures").toEqual([]);
    });

    test("visible commerce cards use completed book covers", async ({
      page,
    }) => {
      for (const route of ["/", "/products", "/flash-sale", "/promotions"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await waitForPageToSettle(page);
        const placeholderImages = await page
          .locator(
            '[data-testid="product-card"] img, [data-testid="flash-sale-card"] img',
          )
          .evaluateAll((images) =>
            images
              .filter((image) => {
                const element = image as HTMLImageElement;
                const rect = element.getBoundingClientRect();
                const style = window.getComputedStyle(element);
                return (
                  rect.width > 2 &&
                  rect.height > 2 &&
                  style.display !== "none" &&
                  style.visibility !== "hidden"
                );
              })
              .map(
                (image) => (image as HTMLImageElement).currentSrc || image.src,
              )
              .filter((src) => src.includes("/images/books/placeholders/")),
          );

        expect(
          placeholderImages,
          `${route} visible placeholder covers`,
        ).toEqual([]);
      }
    });
  });
}
