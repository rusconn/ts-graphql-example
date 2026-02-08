import type * as User from "./user.ts";
import * as Password from "./credential/password.ts";
import type { Except } from "type-fest";

export { Password };

export type Type = {
  id: User.Type["id"];
  password: Password.TypeHashed;
};

export const parse = (input: { password: string }): { password: Password.Type } | ParseError[] => {
  const password = Password.parse(input.password);

  if (
    Array.isArray(password) //
  ) {
    const errors: ParseError[] = [];

    if (Array.isArray(password)) {
      errors.push(...fromPasswordErrors(password));
    }

    return errors;
  } else {
    return { password };
  }
};

export type ParseError = { prop: "password"; type: Password.ParseError };

const fromPasswordErrors = (es: Password.ParseError[]): ParseError[] => {
  return es.map((e) => ({ prop: "password", type: e }));
};

export const create = async (
  id: Type["id"],
  parsed: Exclude<ReturnType<typeof parse>, ParseError[]>,
): Promise<Type> => {
  return {
    id,
    password: await Password.hash(parsed.password),
  };
};

export const changePassword = async (
  credential: Type,
  newPassword: Password.Type,
): Promise<Type> => ({
  ...credential,
  password: await Password.hash(newPassword),
});
