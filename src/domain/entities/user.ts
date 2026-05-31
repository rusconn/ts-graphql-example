import { err, ok, Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Email from "./user/email.ts";
import * as Id from "./user/id.ts";
import * as Name from "./user/name.ts";
import * as Password from "./user/password.ts";
import * as Role from "./user/role.ts";

export { Email, Id, Name, Password, Role };

export type Type = Tagged<Raw, "UserEntity">;

type Raw = {
  id: Id.Type;
  name: Name.Type;
  email: Email.Type;
  password: Password.TypeHashed;
  role: Role.Type;
  createdAt: Date;
  updatedAt: Date;
};

export function parse(
  input: {
    id: Parameters<typeof Id.parse>[0];
    name: Parameters<typeof Name.parse>[0];
    email: Parameters<typeof Email.parse>[0];
    password: Parameters<typeof Password.parseHashed>[0];
  } & Pick<Type, "role" | "createdAt" | "updatedAt">,
): Result<Type, ParseError[]> {
  return Result.combineWithAllErrors([
    parseId(input.id),
    parseName(input.name),
    parseEmail(input.email),
    parsePassword(input.password),
  ]).map(
    ([id, name, email, password]) =>
      ({
        id,
        name,
        email,
        password,
        role: input.role,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      }) satisfies Raw as Type,
  );
}

export function parseId(
  id: Parameters<typeof Id.parse>[0], //
): Result<Id.Type, IdError> {
  return Id.parse(id).mapErr((err) => ({
    prop: "id",
    err,
  }));
}
export function parseName(
  name: Parameters<typeof Name.parse>[0], //
): Result<Name.Type, NameError> {
  return Name.parse(name).mapErr((err) => ({
    prop: "name",
    err,
  }));
}
export function parseEmail(
  email: Parameters<typeof Email.parse>[0],
): Result<Email.Type, EmailError> {
  return Email.parse(email).mapErr((err) => ({
    prop: "email",
    err,
  }));
}
export function parsePassword(
  password: Parameters<typeof Password.parseHashed>[0],
): Result<Password.TypeHashed, PasswordError> {
  return Password.parseHashed(password).mapErr((err) => ({
    prop: "password",
    err,
  }));
}

export type ParseError =
  | IdError //
  | NameError
  | EmailError
  | PasswordError;

export type IdError = {
  prop: "id";
  err: Id.ParseError;
};
export type NameError = {
  prop: "name";
  err: Name.ParseError;
};
export type EmailError = {
  prop: "email";
  err: Email.ParseError;
};
export type PasswordError = {
  prop: "password";
  err: Password.ParseHashedError;
};

export function parseOrThrow(input: Parameters<typeof parse>[0]): Type {
  return parse(input)._unsafeUnwrap();
}

export async function create(
  input: Pick<Type, "name" | "email"> & { password: Password.Type },
): Promise<Type> {
  const { id, date } = Id.createWithDate();
  return {
    id,
    name: input.name,
    email: input.email,
    password: await Password.hash(input.password),
    role: Role.USER,
    createdAt: date,
    updatedAt: date,
  } satisfies Raw as Type;
}

export async function authenticate(user: Type, password: Password.Type): Promise<boolean> {
  return await Password.match(password, user.password);
}

export function updateAccount(user: Type, input: Partial<Pick<Type, "name">>): Type {
  return update(user, input);
}

export function changeEmail(user: Type, input: Type["email"]): Type {
  return update(user, { email: input });
}

export async function changePassword(
  user: Type,
  input: {
    oldPassword: Password.Type;
    newPassword: Password.Type;
  },
): Promise<Result<Type, ChangePasswordError>> {
  if (input.oldPassword === input.newPassword) {
    return err("SamePasswords");
  }

  const match = await authenticate(user, input.oldPassword);
  if (!match) {
    return err("IncorrectOldPassword");
  }

  return ok(update(user, { password: await Password.hash(input.newPassword) }));
}

export type ChangePasswordError =
  | "IncorrectOldPassword" //
  | "SamePasswords";

function update(user: Type, input: Partial<Pick<Type, "name" | "email" | "password">>): Type {
  return {
    ...user,
    ...(input.name != null && {
      name: input.name,
    }),
    ...(input.email != null && {
      email: input.email,
    }),
    ...(input.password != null && {
      password: input.password,
    }),
    updatedAt: new Date(),
  };
}
