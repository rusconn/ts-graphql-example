export class EmailAlreadyExistsError extends Error {
  static {
    EmailAlreadyExistsError.prototype.name = "EmailAlreadyExistsError";
  }
}

export function emailAlreadyExistsError() {
  return new EmailAlreadyExistsError();
}
