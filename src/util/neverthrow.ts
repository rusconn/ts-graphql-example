import type { Result } from "neverthrow";

export type OkOf<R> = R extends Result<infer T, unknown> ? T : never;
export type ErrOf<R> = R extends Result<unknown, infer E> ? E : never;

export const unwrapOrElse = <T, E>(result: Result<T, E>, fn: (e: E) => T) => {
  return result.match(
    (v) => v,
    (e) => fn(e),
  );
};
