import { expect, test } from "@playwright/test";

test.describe("GreenShop pages", () => {
  test("loads homepage and key sections", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/GreenShop/);
    await expect(page.getByTestId("site-header")).toBeVisible();
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("products-section")).toBeVisible();
    await expect(page.getByTestId("newsletter-section").first()).toBeVisible();
  });

  test("main navigation works", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await expect(page).toHaveURL(/\/shop$/);

    await page.getByRole("link", { name: "Blogs", exact: true }).first().click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("link", { name: "My Account", exact: true }).first().click();
    await expect(page).toHaveURL(/auth=login/);
  });

  test("burger menu works on mobile", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4321/");

    const burger = page.getByRole("button", { name: "Toggle menu" });
    await expect(burger).toBeVisible();
    await burger.click();
    await expect(page.getByRole("link", { name: "Shop", exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Shop", exact: true }).click();
    await expect(page).toHaveURL(/\/shop$/);

    await context.close();
  });

  test("home filters work", async ({ page }) => {
    await page.goto("/");

    const resultText = page.getByTestId("home-results-count");
    await expect(resultText).toContainText("8 products found");

    await page.getByRole("button", { name: "Sale" }).first().click();
    await expect(resultText).toContainText("1 products found");

    await page.getByRole("button", { name: "All Plants" }).first().click();
    await page.getByRole("button", { name: "Seeds" }).click();
    await expect(resultText).toContainText("2 products found");
    await expect(page.getByTestId("product-card").filter({ hasText: "Succulent Seed Pack" })).toBeVisible();
  });

  test("can add product from home and place order", async ({ page }) => {
    await page.goto("/");

    const cartCount = page.locator("[data-cart-count]");
    await expect(cartCount).toBeHidden();

    await page.locator("[data-add-product]").first().click();
    await expect(cartCount).toHaveText("1");

    await page.goto("/checkout");

    const checkoutForm = page.locator("#checkout-form");
    await checkoutForm.locator('input[name=\"firstName\"]').fill("Olena");
    await checkoutForm.locator('input[name=\"lastName\"]').fill("Ivanenko");
    await checkoutForm.locator('select[name=\"country\"]').selectOption("United States");
    await checkoutForm.locator('input[name=\"city\"]').fill("Farmingdale");
    await checkoutForm.locator('input[name=\"street1\"]').fill("70 West Buckingham Ave");
    await checkoutForm.locator('select[name=\"state\"]').selectOption("New York");
    await checkoutForm.locator('input[name=\"zip\"]').fill("11735");
    await checkoutForm.locator('input[name=\"phone\"]').fill("+1 555 111 2233");
    await checkoutForm.locator('input[name=\"email\"]').fill("olena@example.com");

    await page.getByRole("button", { name: "Place Order" }).click();
    await expect(page).toHaveURL(/\/order-confirmation$/);

    const orderData = await page.evaluate(() => localStorage.getItem("greenshop-last-order"));
    expect(orderData).not.toBeNull();

  });

  test("renders product cards and expected count", async ({ page }) => {
    await page.goto("/shop");

    const cards = page.getByTestId("product-card");
    await expect(cards).toHaveCount(12);
    await expect(cards.first()).toContainText("Barberton Daisy");
  });

  test("product cards open product pages", async ({ page }) => {
    await page.goto("/shop");

    await page.getByLabel("View Barberton Daisy").click();
    await expect(page).toHaveURL(/\/shop\/barberton-daisy$/);
    await expect(page.getByTestId("product-view")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Barberton Daisy" })).toBeVisible();
  });

  test("shop search and filters work", async ({ page }) => {
    await page.goto("/shop");

    const resultText = page.getByTestId("product-results-count");
    await expect(resultText).toContainText("12 products found");

    await page.getByPlaceholder("Search product...").fill("aluminum");
    await expect(resultText).toContainText("1 products found");
    await expect(page.getByTestId("product-card").filter({ hasText: "Aluminum Plant" })).toBeVisible();

    await page.getByPlaceholder("Search product...").fill("");
    await page.getByRole("button", { name: "Sale" }).click();
    await expect(resultText).toContainText("2 products found");
    await expect(page.getByTestId("product-card").filter({ hasText: "African Violet" })).toBeVisible();

    await page.getByRole("button", { name: "Accessories" }).click();
    await expect(resultText).toContainText("1 products found");
    await expect(page.getByTestId("product-card").filter({ hasText: "Watering Tools Kit" })).toBeVisible();
  });

  test("core pages load", async ({ page }) => {
    const routes = [
      "/product-view",
      "/cart",
      "/checkout",
      "/order-confirmation",
      "/login",
      "/register",
      "/contact",
      "/plant-care",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("main h1, main h2").first()).toBeVisible();
    }
  });

  test("protected pages require auth", async ({ page }) => {
    await page.goto("/my-account");
    await expect(page).toHaveURL(/auth=login/);

    await page.goto("/admin-orders");
    await expect(page).toHaveURL(/auth=login/);
  });

  test("register modal validates password mismatch", async ({ page }) => {
    const registerForm = page.locator('[data-auth-form="register"]');

    await page.goto("/?auth=register");
    await registerForm.locator('input[name="username"]').fill("Test User");
    await registerForm.locator('input[name="email"]').fill(`user${Date.now()}@example.com`);
    await registerForm.locator('input[name="password"]').fill("password123");
    await registerForm.locator('input[name="confirmPassword"]').fill("password321");
    await registerForm.locator('button[type="submit"]').click();

    await expect(registerForm.locator("[data-auth-message]")).toContainText("Passwords do not match");
  });

  test("contact form html validation triggers", async ({ page }) => {
    await page.goto("/contact");

    await page.getByRole("button", { name: "Send message" }).click();

    const invalidFields = page
      .getByTestId("contact-form")
      .locator("input:invalid, select:invalid, textarea:invalid");
    await expect(invalidFields).toHaveCount(4);

    await page.getByLabel("Full name").fill("Olena");
    await page.getByLabel("Email").fill("olena@example.com");
    await page.getByLabel("Topic").selectOption("care");
    await page.getByLabel("Message").fill("Please share care tips for my first indoor plants.");

    await expect(
      page.getByTestId("contact-form").locator("input:invalid, select:invalid, textarea:invalid")
    ).toHaveCount(0);
  });

  test("basic accessibility checks for images and keyboard focus", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i += 1) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
      expect((alt ?? "").trim().length).toBeGreaterThan(0);
    }

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus-visible")).toBeVisible();
  });

  test("visual regression desktop", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home-desktop.png", { fullPage: true, maxDiffPixelRatio: 0.03 });

    await page.goto("/shop");
    await expect(page).toHaveScreenshot("shop-desktop.png", { fullPage: true, maxDiffPixelRatio: 0.03 });

    await page.goto("/cart");
    await expect(page).toHaveScreenshot("cart-desktop.png", { fullPage: true, maxDiffPixelRatio: 0.03 });
  });

  test("visual regression mobile", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.goto("http://127.0.0.1:4321/");
    await expect(page).toHaveScreenshot("home-mobile.png", { fullPage: true, maxDiffPixelRatio: 0.03 });

    await page.goto("http://127.0.0.1:4321/checkout");
    await expect(page).toHaveScreenshot("checkout-mobile.png", { fullPage: true, maxDiffPixelRatio: 0.03 });

    await context.close();
  });
});
