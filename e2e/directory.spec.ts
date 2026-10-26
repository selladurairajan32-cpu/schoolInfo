import { expect, test } from "@playwright/test";

const cards = (page: import("@playwright/test").Page) => page.locator("main article");

test.describe("grammar school directory", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the sort control names the order actually applied", async ({ page }) => {
    await page.goto("/grammar-schools");
    await expect(page.getByLabel("Sort")).toHaveValue("name");
    await expect(page.getByLabel("Sort").locator("option", { hasText: "Best match" })).toHaveCount(0);
    await page.goto("/grammar-schools?q=Aylesbury");
    await expect(page.getByLabel("Sort")).toHaveValue("relevance");
  });

  test("filters, sorting and views keep each other", async ({ page }) => {
    await page.goto("/grammar-schools?gender=girls");
    await page.getByLabel("Sort").selectOption("gcse");
    await expect(page).toHaveURL(/sort=gcse/);
    await expect(page).toHaveURL(/gender=girls/);
    await page.getByRole("navigation", { name: "Result views" }).getByRole("link", { name: "Table" }).click();
    await expect(page).toHaveURL(/view=table/);
    await expect(page).toHaveURL(/gender=girls/);
    await expect(page).toHaveURL(/sort=gcse/);
    await expect(page.locator("th[aria-sort=descending]")).toContainText("Attainment 8");
  });

  test("an active filter is a removable chip", async ({ page }) => {
    await page.goto("/grammar-schools?gender=boys&sixthForm=1");
    await page.getByRole("link", { name: /Sixth form.*remove this filter/ }).click();
    await expect(page).not.toHaveURL(/sixthForm/);
    await expect(page).toHaveURL(/gender=boys/);
  });

  test("an empty result explains which filters to remove and admissions coverage", async ({ page }) => {
    await page.goto("/grammar-schools?gender=girls&outOfArea=1");
    await expect(page.getByText("No schools match this search")).toBeVisible();
    await expect(page.getByText(/Admissions-rule filters only match schools whose September \d{4} policy we hold: \d+ of \d+/)).toBeVisible();
    await expect(page.getByRole("link", { name: "clear every filter" })).toBeVisible();
  });

  test("a page past the end says so instead of showing no schools", async ({ page }) => {
    await page.goto("/grammar-schools?page=40");
    await expect(page.getByText("There is no page 40")).toBeVisible();
    await page.getByRole("link", { name: "Go to the last page" }).click();
    await expect(cards(page).first()).toBeVisible();
  });

  test("the map shows every match and counts those without a location", async ({ page }) => {
    await page.route(/tiles\.openfreemap\.org/, (r) => r.abort());
    await page.goto("/grammar-schools?view=map");
    await expect(page.getByText(/of 232 matching schools are on the map/)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
  });

  test("Northern Ireland rows don't carry England-only measures", async ({ page }) => {
    await page.goto("/grammar-schools?nation=northern_ireland&view=table");
    const row = page.locator("main tbody tr").first();
    await expect(row).toContainText("Not used in NI");
    await page.goto("/grammar-schools?nation=northern_ireland");
    await expect(cards(page).first()).toContainText("don't cover Northern Ireland schools");
    await expect(cards(page).first()).not.toContainText("Attainment 8");
  });

  test("journey: search, filter, sort, view a school, compare, admissions", async ({ page }) => {
    await page.goto("/grammar-schools");
    await page.getByRole("search").getByLabel("Search by school name, town or postcode").fill("Kent");
    await page.getByRole("search").getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/q=Kent/);
    await page.getByRole("navigation", { name: "School type" }).getByRole("link", { name: "Boys" }).click();
    await expect(page).toHaveURL(/gender=boys/);
    await page.getByLabel("Sort").selectOption("name");
    await expect(page).toHaveURL(/sort=name/);
    await expect(page).toHaveURL(/q=Kent/);
    const first = cards(page).first();
    const name = (await first.getByRole("heading").innerText()).trim();
    await first.getByRole("checkbox", { name: /Compare/ }).check();
    await cards(page).nth(1).getByRole("checkbox", { name: /Compare/ }).check();
    await expect(page.getByText("Shortlist · 2")).toBeVisible();
    await first.getByRole("link", { name: /^View school/ }).click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await page.goBack();
    await page.getByRole("link", { name: /^Compare 2$/ }).click();
    await expect(page).toHaveURL(/\/compare\?schools=/);
    await page.goBack();
    await cards(page).first().getByRole("link", { name: /^Admissions/ }).click();
    await expect(page).toHaveURL(/\/admissions$/);
  });
});
