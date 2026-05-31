export function toError(cause: unknown): Error {
  return Error.isError(cause) ? cause : new Error("wrapped", { cause });
}
