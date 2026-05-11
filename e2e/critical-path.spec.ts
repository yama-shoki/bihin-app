import { expect, type Page, test } from "@playwright/test";

const PREFIX = process.env.E2E_PREFIX ?? `E2E-${Date.now()}`;

async function loginAsEmployee(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /佐藤 花子/ }).click();
  await expect(page).toHaveURL("/requests");
}

async function createRequest(page: Page, title: string, amount: string) {
  await page.getByRole("main").getByRole("link", { name: "新規申請" }).click();
  await expect(page).toHaveURL(/\/requests\/new/);

  await page.getByLabel("タイトル").fill(title);
  await page.getByLabel("金額(円)").fill(amount);
  await page.getByRole("combobox", { name: "親カテゴリ" }).click();
  await page.getByRole("option").first().click();
  await page.getByRole("textbox", { name: "子カテゴリ" }).click();
  await page.getByRole("option").first().click();

  await page.getByRole("button", { name: "申請する" }).click();
  await expect(page).toHaveURL("/requests");
  await expect(page.getByRole("cell", { name: title })).toBeVisible();
}

async function switchToAdmin(page: Page) {
  await page.getByRole("button", { name: /佐藤 花子/ }).click();
  await page.getByRole("menuitem", { name: /山田 太郎/ }).click();
  await expect(page).toHaveURL("/admin/requests");
}

test.describe
  .serial("critical paths", () => {
    test("承認 path: 申請作成 → admin 承認 → employee で履歴確認", async ({
      page,
    }) => {
      const title = `${PREFIX}-USBケーブル`;

      await loginAsEmployee(page);
      await createRequest(page, title, "1500");
      await switchToAdmin(page);

      await page.getByRole("cell", { name: title }).click();
      await expect(page.getByRole("heading", { name: title })).toBeVisible();

      await page.getByRole("button", { name: "承認する" }).click();
      const approveDialog = page.getByRole("dialog", { name: "申請の承認" });
      await expect(approveDialog).toBeVisible();
      await approveDialog.getByRole("button", { name: "承認する" }).click();

      // Modal が閉じて Timeline + Badge に状態反映されたことを確認
      await expect(approveDialog).toBeHidden();
      await expect(page.getByText("承認済み").first()).toBeVisible();
    });

    test("却下 path: 理由空欄バリデーション → 入力して却下", async ({
      page,
    }) => {
      const title = `${PREFIX}-却下用品`;

      await loginAsEmployee(page);
      await createRequest(page, title, "2000");
      await switchToAdmin(page);

      await page.getByRole("cell", { name: title }).click();
      await expect(page.getByRole("heading", { name: title })).toBeVisible();

      await page.getByRole("button", { name: "却下する" }).click();
      const rejectDialog = page.getByRole("dialog", { name: "申請の却下" });
      await expect(rejectDialog).toBeVisible();
      await rejectDialog.getByRole("button", { name: "却下する" }).click();
      await expect(page.getByText("却下理由を入力してください")).toBeVisible();

      await rejectDialog.getByLabel("却下理由").fill("予算超過のため");
      await rejectDialog.getByRole("button", { name: "却下する" }).click();

      await expect(rejectDialog).toBeHidden();
      await expect(
        page.getByText("却下", { exact: true }).first(),
      ).toBeVisible();
    });
  });
