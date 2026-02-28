import { expect, test } from "@playwright/test";

const REQUIRED_ENV = [
  "LIVEBLOCKS_SECRET_KEY",
  "NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY",
  "NEXT_PUBLIC_CONVEX_URL",
];

test.describe("CollabBoard realtime smoke", () => {
  test.skip(
    REQUIRED_ENV.some((name) => !process.env[name]),
    "Set Liveblocks and Convex env vars to run realtime E2E smoke tests."
  );

  test("create board and join from second session", async ({ page, browser }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "New board" }).click();
    await page.getByLabel("Board title").fill("Realtime pair session");
    await page.getByLabel("Your display name").fill("Owner");
    await page.getByRole("button", { name: "Create board" }).click();

    await expect(page).toHaveURL(/\/board\/[0-9a-f-]{36}$/);
    await expect(page.locator(".boardTitle")).toContainText("Realtime pair session");

    const boardUrl = page.url();

    const secondContext = await browser.newContext();
    const collaboratorPage = await secondContext.newPage();
    await collaboratorPage.goto(boardUrl);

    await collaboratorPage.getByLabel("Display name").fill("Collaborator");
    await collaboratorPage.getByRole("button", { name: "Enter board" }).click();

    await expect(page.locator(".boardChip").first()).toContainText("2 online", {
      timeout: 15_000,
    });

    await page.reload();
    await expect(page.locator(".boardTitle")).toContainText("Realtime pair session");

    await secondContext.close();
  });
});
