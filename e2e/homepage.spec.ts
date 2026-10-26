import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Compare is a direct link in the desktop navigation", async ({ page }) => {
    await page.goto("/");
    // The top-level item, not the "Compare schools" entries inside the menus.
    const link = page.locator("[data-nav-root] nav > ul > li > a", { hasText: /^Compare$/ });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/compare$/);
    await expect(link).toHaveAttribute("aria-current", "page");
  });

  test("search tabs move with the arrow keys", async ({ page }) => {
    await page.goto("/");
    const tabs = page.getByRole("tablist", { name: "Ways to search" });
    const first = tabs.getByRole("tab", { name: "School or town" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    const second = tabs.getByRole("tab", { name: "Near a postcode" });
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("textbox", { name: "Postcode" })).toBeVisible();
    await page.keyboard.press("Home");
    await expect(first).toHaveAttribute("aria-selected", "true");
  });

  test("suggestions always match the current query, even when an older response arrives late", async ({ page }) => {
    // Hold back the response for "Aylesbury" so it lands after the newer query's response.
    await page.route("**/api/search/suggest?q=Aylesbury", async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await page.goto("/");
    const box = page.getByRole("combobox").first();
    await box.fill("Aylesbury");
    await page.waitForTimeout(300);
    await box.fill("Tiffin");
    await expect(page.getByRole("option", { name: /Tiffin/ }).first()).toBeVisible();
    await page.waitForTimeout(1800);
    await expect(page.getByRole("option", { name: /Aylesbury Grammar/ })).toHaveCount(0);
  });

  test("a query with no quick matches says so and offers a full search", async ({ page }) => {
    await page.goto("/");
    const box = page.getByRole("combobox").first();
    await box.fill("zzqxv");
    await expect(page.getByText(/No quick matches for/)).toBeVisible();
    await page.getByRole("button", { name: /Search all schools for/ }).click();
    await expect(page).toHaveURL(/\/grammar-schools\?q=zzqxv/);
  });

  test("the skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("core journey: search, profile, compare, eligibility", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox").first().fill("Aylesbury Grammar");
    await page.getByRole("option", { name: /Aylesbury Grammar School/ }).first().click();
    await expect(page).toHaveURL(/\/schools\/aylesbury-grammar-school/);
    await page.goto("/");
    await page.getByRole("link", { name: "Open the full comparison" }).click();
    await expect(page).toHaveURL(/\/compare\?schools=/);
    await expect(page.locator("main table").first()).toBeVisible();
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main tasks" }).getByRole("link", { name: "Check eligibility" }).click();
    await expect(page).toHaveURL(/\/tools\/eligibility-checker/);
  });
});

test.describe("homepage on a phone", () => {
  test.use({ viewport: { width: 320, height: 720 } });
  test("the search field leaves room to type", async ({ page }) => {
    await page.goto("/");
    const box = page.getByRole("combobox").first();
    const w = (await box.evaluate((el) => el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) - parseFloat(getComputedStyle(el).paddingRight))) as number;
    expect(w).toBeGreaterThan(150);
  });
});
