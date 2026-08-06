import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "TodoDto">;

type Raw = Pick<
  Domain.Todo.Type,
  | "id" //
  | "title"
  | "description"
  | "status"
  | "userId"
  | "createdAt"
  | "updatedAt"
>;

type Input = {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function parse(input: Input): Result<Type, ParseError[]> {
  return Result.combineWithAllErrors([
    Domain.Todo.parseId(input.id),
    Domain.Todo.parseTitle(input.title),
    Domain.Todo.parseDescription(input.description),
    Domain.Todo.parseStatus(input.status),
    Domain.Todo.parseUserId(input.userId),
  ]).map(
    ([id, title, description, status, userId]) =>
      ({
        id,
        title,
        description,
        status,
        userId,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      }) satisfies Raw as Type,
  );
}

export type ParseError =
  | Domain.Todo.IdError //
  | Domain.Todo.TitleError
  | Domain.Todo.DescriptionError
  | Domain.Todo.StatusError
  | Domain.Todo.UserIdError;

export function parseOrThrow(input: Input) {
  return parse(input)._unsafeUnwrap();
}

export function fromDomain(domain: Domain.Todo.Type): Type {
  return {
    id: domain.id,
    title: domain.title,
    description: domain.description,
    status: domain.status,
    userId: domain.userId,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
  } satisfies Raw as Type;
}
