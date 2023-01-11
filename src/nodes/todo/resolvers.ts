import { toSchemaUser, toSchemaTodo, toSchemaTodos } from "@/adapters";
import { Resolvers, TodoStatus } from "@/types";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    todos: async (_, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.Query.todos(args);

      const todos = await todoAPI.getsUserTodos({ ...parsed, info });

      return toSchemaTodos(todos);
    },
    todo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Query.todo(args);

      const todo = await todoAPI.get(parsed);

      return toSchemaTodo(todo);
    },
  },
  Mutation: {
    createTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.createTodo(args);

      const todo = await todoAPI.create(parsed);

      return toSchemaTodo(todo);
    },
    updateTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.updateTodo(args);

      const todo = await todoAPI.update(parsed);

      return toSchemaTodo(todo);
    },
    deleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.deleteTodo(args);

      const todo = await todoAPI.delete(parsed);

      return toSchemaTodo(todo);
    },
    completeTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.completeTodo(args);

      const todo = await todoAPI.update({ ...parsed, status: TodoStatus.Done });

      return toSchemaTodo(todo);
    },
    uncompleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.uncompleteTodo(args);

      const todo = await todoAPI.update({ ...parsed, status: TodoStatus.Pending });

      return toSchemaTodo(todo);
    },
  },
  Todo: {
    user: async ({ userId }, __, { dataSources: { userAPI } }) => {
      const user = await userAPI.get({ id: userId });

      return toSchemaUser(user);
    },
  },
};
