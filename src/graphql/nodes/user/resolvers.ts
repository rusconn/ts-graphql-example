import { toUserNode, toUserNodes, toTodoNodes } from "@/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    viewer: async (_, __, { dataSources: { userAPI }, user: contextUser }) => {
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
    createUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.createUser(args);

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
      const parsed = parsers.User.todos(args);

      const todos = await todoAPI.getsUserTodos({ userId: id, ...parsed, info });

      return toTodoNodes(todos);
    },
  },
};
