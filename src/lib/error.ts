export function toError(cause: unknown, message = "wrapped"): Error {
  return Error.isError(cause) ? cause : new Error(message, { cause });
}
