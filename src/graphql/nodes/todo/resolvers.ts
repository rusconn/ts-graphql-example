import { toTodoNodes, toTodoNode, toUserNode } from "@/graphql/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    myTodos: async (_, args, { dataSources: { todoAPI }, user }, info) => {
      const parsed = parsers.Query.myTodos(args);

      const todos = await todoAPI.getsUserTodos({ ...parsed, userId: user.id, info });

      return toTodoNodes(todos);
    },
    myTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Query.myTodo(args);

      const todo = await todoAPI.get(parsed);

      return toTodoNode(todo);
    },
  },
  Mutation: {
    createTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.createTodo(args);

      const todo = await todoAPI.create(parsed);

      return toTodoNode(todo);
    },
    updateTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.updateTodo(args);

      const todo = await todoAPI.update(parsed);

      return toTodoNode(todo);
    },
    deleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.deleteTodo(args);

      const todo = await todoAPI.delete(parsed);

      return toTodoNode(todo);
    },
    completeTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.completeTodo(args);

      const todo = await todoAPI.complete(parsed);

      return toTodoNode(todo);
    },
    uncompleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.uncompleteTodo(args);

      const todo = await todoAPI.uncomplete(parsed);

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
