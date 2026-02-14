import { Result } from "neverthrow";

import * as Domain from "../../domain/models.ts";
import * as Db from "../../infra/datasources/_shared/types.ts";

export type Type = Pick<
  Domain.Todo.Type,
  | "id" //
  | "title"
  | "description"
  | "status"
  | "userId"
  | "createdAt"
  | "updatedAt"
>;

export const parse = (
  input: Pick<
    Db.Todo,
    | "id" //
    | "title"
    | "description"
    | "status"
    | "userId"
    | "createdAt"
    | "updatedAt"
  >,
): Result<Type, ParseError[]> => {
  return Result.combineWithAllErrors([
    Domain.Todo.parseId(input.id),
    Domain.Todo.parseTitle(input.title),
    Domain.Todo.parseDescription(input.description),
    Domain.Todo.parseUserId(input.userId),
  ]).map(([id, title, description, userId]) => ({
    ...input,
    id,
    title,
    description,
    status: toDomainStatus[input.status],
    userId,
  }));
};

const toDomainStatus: Record<Db.TodoStatus, Domain.Todo.Type["status"]> = {
  [Db.TodoStatus.Done]: Domain.Todo.Status.DONE,
  [Db.TodoStatus.Pending]: Domain.Todo.Status.PENDING,
};

export type ParseError =
  | Domain.Todo.IdError //
  | Domain.Todo.TitleError
  | Domain.Todo.DescriptionError
  | Domain.Todo.UserIdError;

export const parseOrThrow = (input: Parameters<typeof parse>[0]) => {
  return parse(input)._unsafeUnwrap();
};
