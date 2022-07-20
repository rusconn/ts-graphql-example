import { Resolvers, TodoStatus } from "@/types";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    todos: (_, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.Query.todos(args);

      return todoAPI.getsUserTodos({ ...parsed, info });
    },
    todo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Query.todo(args);

      return todoAPI.get(parsed);
    },
  },
  Mutation: {
    createTodo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.createTodo(args);

      return todoAPI.create(parsed);
    },
    updateTodo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.updateTodo(args);

      return todoAPI.update(parsed);
    },
    deleteTodo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.deleteTodo(args);

      return todoAPI.delete(parsed);
    },
    completeTodo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.completeTodo(args);

      return todoAPI.update({ ...parsed, status: TodoStatus.Done });
    },
    uncompleteTodo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.uncompleteTodo(args);

      return todoAPI.update({ ...parsed, status: TodoStatus.Pending });
    },
  },
  Todo: {
    user: ({ userId }, _, { dataSources: { userAPI } }) => {
      return userAPI.get({ id: userId });
    },
  },
};
