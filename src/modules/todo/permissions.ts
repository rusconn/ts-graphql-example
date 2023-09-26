import { or, rule } from "graphql-shield";

import type * as Graph from "../common/schema";
import type { Context } from "../common/resolvers";
import { isAdmin, isAuthenticated, forbiddenError } from "../common/permissions";

type ParentUser = Graph.ResolversParentTypes["User"];

const isUserOwner = rule({ cache: "strict" })(({ id }: ParentUser, _, { user }: Context) => {
  return id === user.id || forbiddenError();
});

export default {
  Mutation: {
    createTodo: isAuthenticated,
    updateTodo: isAuthenticated,
    deleteTodo: isAuthenticated,
    completeTodo: isAuthenticated,
    uncompleteTodo: isAuthenticated,
  },
  Todo: {
    // リソースへのアクセスが必要なので resolvers で定義する
  },
  User: {
    todo: or(isAdmin, isUserOwner),
    todos: or(isAdmin, isUserOwner),
  },
};
