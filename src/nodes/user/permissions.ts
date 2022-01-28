import { chain, race, rule } from "graphql-shield";

import type {
  Context,
  QueryUserArgs,
  MutationUpdateUserArgs,
  MutationDeleteUserArgs,
  ResolversParentTypes,
} from "@/types";
import { permissionError, isAdmin, isGuest, toUserId, isAuthenticated } from "@/utils";

type QueryOrUpdateOrDeleteArgs = QueryUserArgs | MutationUpdateUserArgs | MutationDeleteUserArgs;
type Parent = ResolversParentTypes["User"];

const isSelf = rule({ cache: "strict" })(
  (_, { id: nodeId }: QueryOrUpdateOrDeleteArgs, { logger, user }: Context) => {
    logger.debug("user isSelf called");
    const id = toUserId(nodeId);
    return id === user.id || permissionError;
  }
);

const isOwner = rule({ cache: "strict" })(
  ({ id: nodeId }: Parent, _, { logger, user }: Context) => {
    logger.debug("user isOwner called");
    const id = toUserId(nodeId);
    return id === user.id || permissionError;
  }
);

export const permissions = {
  Query: {
    viewer: isAuthenticated,
    users: isAdmin,
    user: race(isAdmin, chain(isAuthenticated, isSelf)),
  },
  Mutation: {
    createUser: race(isAdmin, isGuest),
    updateUser: race(isAdmin, chain(isAuthenticated, isSelf)),
    deleteUser: race(isAdmin, chain(isAuthenticated, isSelf)),
  },
  User: {
    token: race(isOwner, isGuest),
    role: isAdmin,
    todos: race(isAdmin, isOwner),
  },
};
