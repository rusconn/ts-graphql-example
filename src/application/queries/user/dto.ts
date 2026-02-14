import { Result } from "neverthrow";

import * as Domain from "../../../domain/entities.ts";
import * as Db from "../../../infra/datasources/_shared/types.ts";

export type Type = Pick<
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
  ]).map(([id, name, email]) => ({
    ...input,
    id,
    name,
    email,
    role: toDomainRole[input.role],
  }));
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
