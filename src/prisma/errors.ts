export class PrismaError extends Error {
  override readonly name = "PrismaError" as const;

  constructor(message?: string, options?: { cause?: Error }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class InputTooLongError extends Error {
  override readonly name = "InputTooLongError" as const;

  constructor(message?: string, options?: { cause?: Error }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class NotExistsError extends Error {
  override readonly name = "NotExistsError" as const;

  constructor(message?: string, options?: { cause?: Error }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class NotUniqueError extends Error {
  override readonly name = "NotUniqueError" as const;

  constructor(message?: string, options?: { cause?: Error }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
