import { parseStringArg } from "../util.ts";

export const TODO_TITLE_MAX = 100;

export const parseTodoTitle = parseStringArg({
  maxChars: TODO_TITLE_MAX,
});
