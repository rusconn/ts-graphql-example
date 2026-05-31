export class EntityNotFoundError extends Error {
  static {
    EntityNotFoundError.prototype.name = "EntityNotFoundError";
  }
}

export function entityNotFoundError() {
  return new EntityNotFoundError();
}
