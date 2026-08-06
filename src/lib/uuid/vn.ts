import { validate } from "uuid";

export function is(input: unknown): boolean {
  return validate(input);
}
