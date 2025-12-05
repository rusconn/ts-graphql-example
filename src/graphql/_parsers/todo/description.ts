import { parseStringArg } from "../util.ts";

export const TODO_DESCRIPTION_MAX = 5_000;

export const parseTodoDescription = parseStringArg({
  maxChars: TODO_DESCRIPTION_MAX,
});
