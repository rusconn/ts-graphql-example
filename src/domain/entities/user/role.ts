import { err, ok, type Result } from "neverthrow";

export type Type = typeof ADMIN | typeof USER;

export const ADMIN = "ADMIN";
export const USER = "USER";

export function parse(input: string): Result<Type, ParseError> {
  switch (input) {
    case "admin":
    case "Admin":
    case "ADMIN":
      return ok(ADMIN);
    case "user":
    case "User":
    case "USER":
      return ok(USER);
    default:
      return err(invalidRoleError);
  }
}

export type ParseError = typeof invalidRoleError;

export const invalidRoleError = {
  type: "invalid role",
} as const;

export function parseOrThrow(input: string): Type {
  return parse(input)._unsafeUnwrap();
}
