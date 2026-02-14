export class EntityNotFoundError extends Error {
  static {
    EntityNotFoundError.prototype.name = "EntityNotFoundError";
  }
}

export const entityNotFoundError = () => {
  return new EntityNotFoundError();
};

export class EmailAlreadyExistsError extends Error {
  static {
    EmailAlreadyExistsError.prototype.name = "EmailAlreadyExistsError";
  }
}

export const emailAlreadyExistsError = () => {
  return new EmailAlreadyExistsError();
};
