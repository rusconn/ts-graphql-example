import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationCreateTodoArgs, MutationUpdateTodoArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  description?:
    | MutationCreateTodoArgs["description"] //
    | MutationUpdateTodoArgs["description"];
};

export const TODO_DESCRIPTION_MAX = 5_000;

export const parseTodoDescription = <T extends boolean, U extends boolean>(
  { description }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && description === undefined) {
    return parseErr('"description" is required');
  }
  if (!nullable && description === null) {
    return parseErr('"description" must not be null');
  }
  if (description != null && numChars(description) > TODO_DESCRIPTION_MAX) {
    return parseErr(`"description" must be up to ${TODO_DESCRIPTION_MAX} characters`);
  }

  type Description = typeof description;

  return description as T extends true
    ? U extends true
      ? Description
      : Exclude<Description, null>
    : U extends true
      ? Exclude<Description, undefined>
      : NonNullable<Description>;
};
