import type { UndefinableToOptional } from "./UndefinableToOptional.ts";

export const pickDefined = <T extends Record<string, unknown>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, val]) => val !== undefined),
  ) as UndefinableToOptional<T>;
};
