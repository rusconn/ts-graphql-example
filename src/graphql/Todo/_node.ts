import type { Context } from "../../context.ts";

export const getNode = (context: Pick<Context, "repos">) => context.repos.todo.getById;
