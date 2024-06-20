import { authAdmin, authErr } from "../../common/authorizers.ts";
import type { Context } from "../../common/resolvers.ts";
import type { Todo } from "./resolver.ts";

export const authAdminOrTodoOwner = (
  context: Pick<Context, "user">,
  todo: Pick<Todo, "userId">,
) => {
  try {
    return authAdmin(context);
  } catch {
    return authTodoOwner(context, todo);
  }
};

export const authTodoOwner = (context: Pick<Context, "user">, todo: Pick<Todo, "userId">) => {
  if (context.user?.id === todo.userId) return context.user;
  throw authErr();
};
