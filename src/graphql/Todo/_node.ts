import type { Context } from "../../context.ts";

export const getNode = (context: Pick<Context, "api">) => context.api.todo.getById;
