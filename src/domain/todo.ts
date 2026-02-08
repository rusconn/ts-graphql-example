import type { Except } from "type-fest";

import * as Description from "./todo/description.ts";
import * as Id from "./todo/id.ts";
import * as Status from "./todo/status.ts";
import * as Title from "./todo/title.ts";
import type * as User from "./user.ts";

export { Description, Id, Status, Title };

export const MAX_COUNT = 10_000;

export type Type = {
  id: Id.Type;
  title: Title.Type;
  description: Description.Type;
  status: Status.Type;
  userId: User.Type["id"];
  createdAt: Date;
  updatedAt: Date;
};

export const parse = (input: {
  title: string;
  description: string;
}): Pick<Type, "title" | "description"> | ParseError[] => {
  const title = Title.parse(input.title);
  const description = Description.parse(input.description);

  if (
    Array.isArray(title) || //
    Array.isArray(description)
  ) {
    const errors: ParseError[] = [];

    if (Array.isArray(title)) {
      errors.push(...fromTitleErrors(title));
    }

    if (Array.isArray(description)) {
      errors.push(...fromDescriptionErrors(description));
    }

    return errors;
  } else {
    return { title, description };
  }
};

export type ParseError =
  | { prop: "title"; type: Title.ParseError } //
  | { prop: "description"; type: Description.ParseError };

const fromTitleErrors = (es: Title.ParseError[]): ParseError[] => {
  return es.map((e) => ({ prop: "title", type: e }));
};

const fromDescriptionErrors = (es: Description.ParseError[]): ParseError[] => {
  return es.map((e) => ({ prop: "description", type: e }));
};

export const create = (
  userId: Type["userId"],
  parsed: Exclude<ReturnType<typeof parse>, ParseError[]>,
): Type => {
  const { id, date } = Id.createWithDate();
  return {
    ...parsed,
    id,
    status: Status.PENDING,
    userId,
    createdAt: date,
    updatedAt: date,
  };
};

export const changeStatus = (todo: Type, input: Pick<Type, "status">): Type => {
  return _update(todo, input);
};

export const update = (
  todo: Type,
  input: Partial<Except<Type, "id" | "userId" | "createdAt" | "updatedAt">>,
): Type => {
  return _update(todo, input);
};

const _update = (
  todo: Type,
  input: Partial<Pick<Type, "title" | "description" | "status">>,
): Type => ({
  ...todo,
  ...input,
  updatedAt: new Date(),
});
