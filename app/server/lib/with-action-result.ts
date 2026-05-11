import { BusinessError, ValidationError } from "@/app/lib/errors";
import "server-only";
import { ZodError } from "zod";
import { type ActionResult, err } from "./action-result";

/**
 * Server Action を ActionResult に正規化する。
 * - BusinessError 派生 → 対応 kind + message + (ValidationError なら fieldErrors)
 * - ZodError → VALIDATION + fieldErrors (zod の flatten().fieldErrors)
 * - その他 → INTERNAL (message は固定文言、原因は console.error でログ)
 */
export async function withActionResult<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await fn();

    return { ok: true, data };
  } catch (caught) {
    if (caught instanceof ValidationError) {
      return err("VALIDATION", caught.message, caught.fieldErrors);
    }

    if (caught instanceof BusinessError) {
      return err(caught.kind, caught.message);
    }

    if (caught instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of caught.issues) {
        const key = issue.path.join(".") || "_root";
        fieldErrors[key] ??= [];
        fieldErrors[key].push(issue.message);
      }
      return err("VALIDATION", "入力内容に誤りがあります", fieldErrors);
    }

    console.error("[withActionResult] unexpected error", caught);
    return err("INTERNAL", "予期しないエラーが発生しました");
  }
}
