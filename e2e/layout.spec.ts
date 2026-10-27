import { expect, test } from "@playwright/test";

test("main navigation works from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const trigger = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Schools" });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mega-discover a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("header stays on one line on large screens", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto("/");
  const header = page.locator("[data-site-header]");
  expect((await header.boundingBox())!.height).toBeLessThanOrEqual(80);
  const search = page.locator("header").getByRole("button", { name: /^Search/ });
  expect((await search.boundingBox())!.height).toBeLessThanOrEqual(44);
  for (const b of await page.getByRole("navigation", { name: "Main" }).getByRole("button").all()) expect((await b.boundingBox())!.height).toBeLessThanOrEqual(80);
});

for (const width of [390, 1440]) {
  test(`school facts are all shown at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/schools/aylesbury-grammar-school");
    const facts = page.locator("section[aria-labelledby=facts] dl");
    for (const label of ["Address", "Telephone", "Type", "Pupils admitted", "Ages", "Sixth form", "Boarding", "Establishment", "Pupils on roll", "Capacity", "URN"]) {
      await expect(facts.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(facts.getByText("HP21 7RP")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}

test("trust names keep a lower-case letter after an apostrophe", async ({ page }) => {
  await page.goto("/schools/queen-elizabeths-grammar-alford-a-selective-academy");
  await expect(page.locator("section[aria-labelledby=facts]")).toContainText("Queen Elizabeth's Grammar, Alford");
});
