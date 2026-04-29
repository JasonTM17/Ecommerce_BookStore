import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3001";
const outputRoot = path.resolve(
  process.cwd(),
  "../docs/portfolio/screenshots",
);

const pages = [
  { name: "home", path: "/" },
  { name: "products", path: "/products" },
  { name: "flash-sale", path: "/flash-sale" },
  { name: "promotions", path: "/promotions" },
];

const viewports = [
  {
    name: "desktop",
    options: {
      viewport: { width: 1440, height: 1050 },
      deviceScaleFactor: 1,
    },
  },
  {
    name: "mobile",
    options: devices["Pixel 5"],
  },
];

async function preparePage(page) {
  await page.addInitScript(() => {
    localStorage.setItem("locale", "vi");
    document.cookie = "NEXT_LOCALE=vi; path=/";
  });
}

async function waitForStablePage(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-delay: 0s !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    `,
  });
}

async function warmLazyContent(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(320, Math.round(window.innerHeight * 0.75));
    const maxY = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight || 0,
    );

    for (let y = 0; y <= maxY; y += step) {
      window.scrollTo(0, y);
      await sleep(90);
    }

    window.scrollTo(0, 0);
    await sleep(120);
  });
}

async function capture(browser, viewport) {
  const context = await browser.newContext(viewport.options);
  const page = await context.newPage();
  await preparePage(page);

  const folder = path.join(outputRoot, viewport.name);
  await fs.mkdir(folder, { recursive: true });

  for (const item of pages) {
    await page.goto(new URL(item.path, baseURL).toString());
    await waitForStablePage(page);
    await warmLazyContent(page);
    await page.screenshot({
      path: path.join(folder, `${item.name}.png`),
      fullPage: true,
    });
  }

  await page.goto(new URL("/", baseURL).toString());
  await waitForStablePage(page);
  await page.getByTestId("chatbot-launcher").click();
  await page.getByTestId("chatbot-panel").waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.screenshot({
    path: path.join(folder, "chatbot.png"),
    fullPage: false,
  });

  await context.close();
}

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    await capture(browser, viewport);
  }
} finally {
  await browser.close();
}

console.log(`Portfolio screenshots saved to ${outputRoot}`);
