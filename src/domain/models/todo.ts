import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Description from "./todo/description.ts";
import * as Id from "./todo/id.ts";
import * as Status from "./todo/status.ts";
import * as Title from "./todo/title.ts";
import * as User from "./user.ts";

export { Description, Id, Status, Title };

export const MAX_COUNT = 10_000;

export type Type = Tagged<
  {
    id: Id.Type;
    title: Title.Type;
    description: Description.Type;
    status: Status.Type;
    userId: User.Type["id"];
    createdAt: Date;
    updatedAt: Date;
  },
  "DomainTodo"
>;

export const parse = (
  input: {
    id: Parameters<typeof Id.parse>[0];
    title: Parameters<typeof Title.parse>[0];
    description: Parameters<typeof Description.parse>[0];
    status: Parameters<typeof Status.parse>[0];
    userId: Parameters<typeof User.Id.parse>[0];
  } & Pick<Type, "status" | "createdAt" | "updatedAt">,
): Result<Type, ParseError[]> => {
  return Result.combineWithAllErrors([
    parseId(input.id),
    parseTitle(input.title),
    parseDescription(input.description),
    parseStatus(input.status),
    parseUserId(input.userId),
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
      }) as Type,
  );
};

export const parseId = (id: Parameters<typeof Id.parse>[0]): Result<Id.Type, IdError> => {
  return Id.parse(id).mapErr((err) => ({
    prop: "id",
    err,
  }));
};
export const parseTitle = (
  title: Parameters<typeof Title.parse>[0],
): Result<Title.Type, TitleError> => {
  return Title.parse(title).mapErr((err) => ({
    prop: "title",
    err,
  }));
};
export const parseDescription = (
  description: Parameters<typeof Description.parse>[0],
): Result<Description.Type, DescriptionError> => {
  return Description.parse(description).mapErr((err) => ({
    prop: "description",
    err,
  }));
};
export const parseStatus = (
  status: Parameters<typeof Status.parse>[0],
): Result<Status.Type, StatusError> => {
  return Status.parse(status).mapErr((err) => ({
    prop: "status",
    err,
  }));
};
export const parseUserId = (
  userId: Parameters<typeof User.Id.parse>[0],
): Result<User.Id.Type, UserIdError> => {
  return User.Id.parse(userId).mapErr((err) => ({
    prop: "userId",
    err,
  }));
};

export type ParseError =
  | IdError //
  | TitleError
  | DescriptionError
  | StatusError
  | UserIdError;

export type IdError = {
  prop: "id";
  err: Id.ParseError;
};
export type TitleError = {
  prop: "title";
  err: Title.ParseError;
};
export type DescriptionError = {
  prop: "description";
  err: Description.ParseError;
};
export type StatusError = {
  prop: "status";
  err: Status.ParseError;
};
export type UserIdError = {
  prop: "userId";
  err: User.Id.ParseError;
};

export const parseOrThrow = (input: Parameters<typeof parse>[0]): Type => {
  return parse(input)._unsafeUnwrap();
};

export const create = (
  userId: Type["userId"],
  input: Pick<Type, "title" | "description">,
): Type => {
  const { id, date } = Id.createWithDate();
  return {
    id,
    title: input.title,
    description: input.description,
    status: Status.PENDING,
    userId,
    createdAt: date,
    updatedAt: date,
  } as Type;
};

export const changeStatus = (todo: Type, input: Pick<Type, "status">): Type => {
  return update(todo, input);
};

export const update = (
  todo: Type,
  input: Partial<Pick<Type, "title" | "description" | "status">>,
): Type => ({
  ...todo,
  ...(input.title != null && {
    title: input.title,
  }),
  ...(input.description != null && {
    description: input.description,
  }),
  ...(input.status != null && {
    status: input.status,
  }),
  updatedAt: new Date(),
});
