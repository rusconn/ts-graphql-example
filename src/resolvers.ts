import * as node from "./modules/node/_mod.ts";
import * as scalar from "./modules/scalar/_mod.ts";
import * as todo from "./modules/todo/_mod.ts";
import * as user from "./modules/user/_mod.ts";

export const resolvers = [node.resolvers, scalar.resolvers, todo.resolvers, user.resolvers];
