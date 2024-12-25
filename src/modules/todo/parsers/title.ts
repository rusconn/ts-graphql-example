import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationCreateTodoArgs, MutationUpdateTodoArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  title?:
    | MutationCreateTodoArgs["title"] //
    | MutationUpdateTodoArgs["title"];
};

export const TODO_TITLE_MAX = 100;

export const parseTodoTitle = <T extends boolean, U extends boolean>(
  { title }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && title === undefined) {
    return parseErr('"title" is required');
  }
  if (!nullable && title === null) {
    return parseErr('"title" must not be null');
  }
  if (title != null && numChars(title) > TODO_TITLE_MAX) {
    return parseErr(`"title" must be up to ${TODO_TITLE_MAX} characters`);
  }

  type Title = typeof title;

  return title as T extends true
    ? U extends true
      ? Title
      : Exclude<Title, null>
    : U extends true
      ? Exclude<Title, undefined>
      : NonNullable<Title>;
};
