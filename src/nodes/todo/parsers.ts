import { UserInputError } from "apollo-server";

import type {
  MutationCompleteTodoArgs,
  MutationCreateTodoArgs,
  MutationDeleteTodoArgs,
  MutationUncompleteTodoArgs,
  MutationUpdateTodoArgs,
  QueryTodoArgs,
  QueryTodosArgs,
} from "@/types";
import { assertIsTodoNodeId, assertIsUserNodeId, parseConnectionArgs } from "@/utils";

export const parsers = {
  Query: {
    todos: (args: QueryTodosArgs) => {
      const { userId, orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new UserInputError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new UserInputError("`last` must be up to 50");
      }

      if (before) {
        try {
          assertIsTodoNodeId(before);
        } catch (e) {
          throw new UserInputError("invalid `before`", { thrown: e });
        }
      }

      if (after) {
        try {
          assertIsTodoNodeId(after);
        } catch (e) {
          throw new UserInputError("invalid `after`", { thrown: e });
        }
      }

      try {
        assertIsUserNodeId(userId);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return { first, last, before, after, nodeId: userId, orderBy };
    },
    todo: (args: QueryTodoArgs) => {
      const { id } = args;

      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id };
    },
  },
  Mutation: {
    createTodo: (args: MutationCreateTodoArgs) => {
      const {
        userId,
        input: { title, description },
      } = args;

      if ([...title].length > 100) {
        throw new UserInputError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new UserInputError("`description` must be up to 5000 characters");
      }

      try {
        assertIsUserNodeId(userId);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return { nodeId: userId, title, description };
    },
    updateTodo: (args: MutationUpdateTodoArgs) => {
      const {
        id,
        input: { title, description, status },
      } = args;

      if (title === null) {
        throw new UserInputError("`title` must be not null");
      }

      if (description === null) {
        throw new UserInputError("`description` must be not null");
      }

      if (status === null) {
        throw new UserInputError("`status` must be not null");
      }

      if (title && [...title].length > 100) {
        throw new UserInputError("`title` must be up to 100 characters");
      }

      if (description && [...description].length > 5000) {
        throw new UserInputError("`description` must be up to 5000 characters");
      }

      try {
        assertIsTodoNodeId(id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id, title, description, status };
    },
    deleteTodo: (args: MutationDeleteTodoArgs) => {
      const { id } = args;

      try {
        assertIsTodoNodeId(id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id };
    },
    completeTodo: (args: MutationCompleteTodoArgs) => {
      const { id } = args;

      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id };
    },
    uncompleteTodo: (args: MutationUncompleteTodoArgs) => {
      const { id } = args;

      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id };
    },
  },
};
