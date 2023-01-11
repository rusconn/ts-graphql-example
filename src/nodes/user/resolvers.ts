import { toSchemaUser, toSchemaUsers, toSchemaTodos } from "@/adapters";
import type { Resolvers } from "@/types";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    viewer: async (_, __, { dataSources: { userAPI }, user: contextUser }) => {
      const user = await userAPI.get({ id: contextUser.id });

      return toSchemaUser(user);
    },
    users: async (_, args, { dataSources: { userAPI } }, info) => {
      const parsed = parsers.Query.users(args);

      const users = await userAPI.gets({ ...parsed, info });

      return toSchemaUsers(users);
    },
    user: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Query.user(args);

      const user = await userAPI.get(parsed);

      return toSchemaUser(user);
    },
  },
  Mutation: {
    createUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.createUser(args);

      const user = await userAPI.create(parsed);

      return toSchemaUser(user);
    },
    updateUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.updateUser(args);

      const user = await userAPI.update(parsed);

      return toSchemaUser(user);
    },
    deleteUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.deleteUser(args);

      const user = await userAPI.delete(parsed);

      return toSchemaUser(user);
    },
  },
  User: {
    todos: async ({ id }, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.User.todos(args);

      const todos = await todoAPI.getsUserTodos({ userId: id, ...parsed, info });

      return toSchemaTodos(todos);
    },
  },
};
