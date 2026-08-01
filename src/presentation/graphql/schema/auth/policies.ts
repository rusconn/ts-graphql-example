import type { AppContext } from "../../../../application/context.ts";
import type { Context } from "../../yoga/context.ts";
import type { AuthPolicy } from "../_types.ts";
import { authAdmin } from "./authorizers/admin.ts";
import { authAuthenticated } from "./authorizers/authenticated.ts";
import { authGuest } from "./authorizers/guest.ts";
import { authAdminOrTodoOwner } from "./authorizers/todo/admin-or-owner.ts";
import { authTodoOwner } from "./authorizers/todo/owner.ts";
import { authAdminOrUserOwner } from "./authorizers/user/admin-or-owner.ts";

export type Authorizer = (context: Context, parent: unknown) => AppContext | Error;

export const policies: Record<AuthPolicy, Authorizer> = {
  ADMIN: authAdmin,
  AUTHENTICATED: authAuthenticated,
  GUEST: authGuest,
  ADMIN_OR_TODO_OWNER: authAdminOrTodoOwner as Authorizer,
  ADMIN_OR_USER_OWNER: authAdminOrUserOwner as Authorizer,
  TODO_OWNER: authTodoOwner as Authorizer,
};
