import { toTodoNodes, toUserNode, toUserNodes } from "@/graphql/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    me: async (_, __, { dataSources: { userAPI }, user: contextUser }) => {
      const user = await userAPI.get({ id: contextUser.id });

      return toUserNode(user);
    },
    users: async (_, args, { dataSources: { userAPI } }, info) => {
      const parsed = parsers.Query.users(args);

      const users = await userAPI.gets({ ...parsed, info });

      return toUserNodes(users);
    },
    user: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Query.user(args);

      const user = await userAPI.get(parsed);

      return toUserNode(user);
    },
  },
  Mutation: {
    signup: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.signup(args);

      const user = await userAPI.create(parsed);

      return toUserNode(user);
    },
    updateUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.updateUser(args);

      const user = await userAPI.update(parsed);

      return toUserNode(user);
    },
    deleteUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.deleteUser(args);

      const user = await userAPI.delete(parsed);

      return toUserNode(user);
    },
  },
  User: {
    todos: async ({ id }, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.User.todos({ ...args, id });

      const todos = await todoAPI.getsUserTodos({ ...parsed, info });

      return toTodoNodes(todos);
    },
  },
};
