import type { Resolvers } from "@/types";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    viewer: (_, __, { dataSources: { userAPI }, user }) => {
      return userAPI.get({ id: user.id });
    },
    users: (_, args, { dataSources: { userAPI } }, info) => {
      const parsed = parsers.Query.users(args);

      return userAPI.gets({ ...parsed, info });
    },
    user: (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Query.user(args);

      return userAPI.get(parsed);
    },
  },
  Mutation: {
    createUser: (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.createUser(args);

      return userAPI.create(parsed);
    },
    updateUser: (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.updateUser(args);

      return userAPI.update(parsed);
    },
    deleteUser: (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.deleteUser(args);

      return userAPI.delete(parsed);
    },
  },
  User: {
    todos: ({ id }, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.User.todos(args);

      return todoAPI.getsUserTodos({ userId: id, ...parsed, info });
    },
  },
};
