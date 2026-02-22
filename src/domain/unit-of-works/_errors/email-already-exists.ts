export class EmailAlreadyExistsError extends Error {
  static {
    EmailAlreadyExistsError.prototype.name = "EmailAlreadyExistsError";
  }
}

export const emailAlreadyExistsError = () => {
  return new EmailAlreadyExistsError();
};
