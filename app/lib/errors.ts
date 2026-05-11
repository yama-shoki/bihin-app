export abstract class BusinessError extends Error {
  abstract readonly kind: "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "VALIDATION";

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ForbiddenError extends BusinessError {
  readonly kind = "FORBIDDEN" as const;
}

export class NotFoundError extends BusinessError {
  readonly kind = "NOT_FOUND" as const;
}

export class ConflictError extends BusinessError {
  readonly kind = "CONFLICT" as const;
}

export class ValidationError extends BusinessError {
  readonly kind = "VALIDATION" as const;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    options?: { cause?: unknown; fieldErrors?: Record<string, string[]> },
  ) {
    super(message, options);
    this.fieldErrors = options?.fieldErrors;
  }
}
