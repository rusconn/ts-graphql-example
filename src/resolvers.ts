import * as node from "./modules/node/resolvers";
import * as todo from "./modules/todo/resolvers";
import * as scalar from "./modules/scalar/resolvers";
import * as user from "./modules/user/resolvers";

export const resolvers = [node.resolvers, scalar.resolvers, todo.resolvers, user.resolvers];
