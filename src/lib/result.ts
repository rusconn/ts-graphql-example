export type Result<T, E> =
  | { ok: true; val: T } //
  | { ok: false; err: E };

export const ok = <T>(val: T): Result<T, never> => {
  return { ok: true, val };
};

export const err = <E>(err: E): Result<never, E> => {
  return { ok: false, err };
};
