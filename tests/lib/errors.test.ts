import { describe, expect, it } from "vitest";
import {
  BusinessError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/app/lib/errors";

describe("BusinessError 階層", () => {
  const cases = [
    { Class: ForbiddenError, name: "ForbiddenError", kind: "FORBIDDEN" },
    { Class: NotFoundError, name: "NotFoundError", kind: "NOT_FOUND" },
    { Class: ConflictError, name: "ConflictError", kind: "CONFLICT" },
    { Class: ValidationError, name: "ValidationError", kind: "VALIDATION" },
  ] as const;

  for (const { Class, name, kind } of cases) {
    describe(name, () => {
      const instance = new Class("テストメッセージ");

      it("BusinessError と Error を継承している", () => {
        expect(instance).toBeInstanceOf(BusinessError);
        expect(instance).toBeInstanceOf(Error);
      });

      it(`name が "${name}"`, () => {
        expect(instance.name).toBe(name);
      });

      it(`kind が "${kind}"`, () => {
        expect(instance.kind).toBe(kind);
      });

      it("message が保持される", () => {
        expect(instance.message).toBe("テストメッセージ");
      });
    });
  }

  it("ValidationError は fieldErrors を保持する", () => {
    const error = new ValidationError("入力エラー", {
      fieldErrors: { title: ["必須です"] },
    });
    expect(error.fieldErrors).toEqual({ title: ["必須です"] });
  });

  it("cause を保持する (Error.cause)", () => {
    const original = new Error("元のエラー");
    const wrapped = new ConflictError("競合", { cause: original });
    expect(wrapped.cause).toBe(original);
  });
});
