import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../../domain/entities.ts";
import * as Db from "../../../infra/datasources/_shared/types.ts";

export type Type = Tagged<Raw, "UserDto">;

type Raw = Pick<
  Domain.User.Type,
  | "id" //
  | "name"
  | "email"
  | "role"
  | "createdAt"
  | "updatedAt"
>;

export const parse = (
  input: Pick<
    Db.User,
    | "id" //
    | "name"
    | "email"
    | "role"
    | "createdAt"
    | "updatedAt"
  >,
): Result<Type, ParseError[]> => {
  return Result.combineWithAllErrors([
    Domain.User.parseId(input.id),
    Domain.User.parseName(input.name),
    Domain.User.parseEmail(input.email),
  ]).map(
    ([id, name, email]) =>
      ({
        id,
        name,
        email,
        role: toDomainRole[input.role],
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      }) satisfies Raw as Type,
  );
};

const toDomainRole: Record<Db.UserRole, Domain.User.Type["role"]> = {
  [Db.UserRole.Admin]: Domain.User.Role.ADMIN,
  [Db.UserRole.User]: Domain.User.Role.USER,
};

export type ParseError =
  | Domain.User.IdError //
  | Domain.User.NameError
  | Domain.User.EmailError;

export const parseOrThrow = (input: Parameters<typeof parse>[0]) => {
  return parse(input)._unsafeUnwrap();
};

export const fromDomain = (domain: Domain.User.Type): Type =>
  ({
    id: domain.id,
    name: domain.name,
    email: domain.email,
    role: domain.role,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
  }) satisfies Raw as Type;
