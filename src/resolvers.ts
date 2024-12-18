import * as node from "./modules/node/_mod.ts";
import * as post from "./modules/post/_mod.ts";
import * as scalar from "./modules/scalar/_mod.ts";
import * as user from "./modules/user/_mod.ts";

export const resolvers = [node.resolvers, post.resolvers, scalar.resolvers, user.resolvers];
