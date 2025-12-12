import type { Context } from "../../context.ts";

export const getNode = (context: Pick<Context, "repos">) => {
  return context.repos.todo.find;
};
