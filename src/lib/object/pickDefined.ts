import type { UndefinedableToOptional } from "./UndefinedableToOptional.ts";

export const pickDefined = <T extends Record<string, unknown>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, val]) => val !== undefined),
  ) as UndefinedableToOptional<T>;
};
