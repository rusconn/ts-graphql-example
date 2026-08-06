import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

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

type Input = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export function parse(input: Input): Result<Type, ParseError[]> {
  return Result.combineWithAllErrors([
    Domain.User.parseId(input.id),
    Domain.User.parseName(input.name),
    Domain.User.parseEmail(input.email),
    Domain.User.parseRole(input.role),
  ]).map(
    ([id, name, email, role]) =>
      ({
        id,
        name,
        email,
        role,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      }) satisfies Raw as Type,
  );
}

export type ParseError =
  | Domain.User.IdError //
  | Domain.User.NameError
  | Domain.User.EmailError
  | Domain.User.RoleError;

export function parseOrThrow(input: Input) {
  return parse(input)._unsafeUnwrap();
}

export function fromDomain(domain: Domain.User.Type): Type {
  return {
    id: domain.id,
    name: domain.name,
    email: domain.email,
    role: domain.role,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
  } satisfies Raw as Type;
}
