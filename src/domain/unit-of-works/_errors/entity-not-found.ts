export class EntityNotFoundError extends Error {
  static {
    EntityNotFoundError.prototype.name = "EntityNotFoundError";
  }
}

export const entityNotFoundError = () => {
  return new EntityNotFoundError();
};
