import { toTodoNodes, toTodoNode, toUserNode } from "@/graphql/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    myTodos: async (_, args, { dataSources: { todoAPI }, user }, info) => {
      const parsed = parsers.Query.myTodos(args);

      const todos = await todoAPI.getTheirs({ ...parsed, userId: user.id, info });

      return toTodoNodes(todos);
    },
    myTodo: async (_, args, { dataSources: { todoAPI }, user }) => {
      const parsed = parsers.Query.myTodo(args);

      const todo = await todoAPI.get({ ...parsed, userId: user.id });

      return toTodoNode(todo);
    },
  },
  Mutation: {
    createMyTodo: async (_, args, { dataSources: { todoAPI }, user }) => {
      const parsed = parsers.Mutation.createMyTodo(args);

      const todo = await todoAPI.create({ ...parsed, userId: user.id });

      return toTodoNode(todo);
    },
    updateMyTodo: async (_, args, { dataSources: { todoAPI }, user }) => {
      const parsed = parsers.Mutation.updateMyTodo(args);

      const todo = await todoAPI.update({ ...parsed, userId: user.id });

      return toTodoNode(todo);
    },
    deleteMyTodo: async (_, args, { dataSources: { todoAPI }, user }) => {
      const parsed = parsers.Mutation.deleteMyTodo(args);

      await todoAPI.delete({ ...parsed, userId: user.id });

      return args.id;
    },
    completeMyTodo: async (_, args, { dataSources: { todoAPI }, user }) => {
      const parsed = parsers.Mutation.completeMyTodo(args);

      const todo = await todoAPI.update({ ...parsed, userId: user.id });

      return toTodoNode(todo);
    },
    uncompleteMyTodo: async (_, args, { dataSources: { todoAPI }, user }) => {
      const parsed = parsers.Mutation.uncompleteMyTodo(args);

      const todo = await todoAPI.update({ ...parsed, userId: user.id });

      return toTodoNode(todo);
    },
  },
  Todo: {
    user: async ({ userId }, __, { dataSources: { userAPI } }) => {
      const user = await userAPI.get({ id: userId });

      return toUserNode(user);
    },
  },
};
