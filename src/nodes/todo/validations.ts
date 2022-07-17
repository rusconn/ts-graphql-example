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
import { assertIsTodoNodeId, assertIsUserNodeId } from "@/utils";

export const validations = {
  Query: {
    todos: (args: QueryTodosArgs) => {
      const { first, last, userId } = args;

      if (first && first > 50) {
        throw new UserInputError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new UserInputError("`last` must be up to 50");
      }

      try {
        assertIsUserNodeId(userId);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }
    },
    todo: (args: QueryTodoArgs) => {
      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
  },
  Mutation: {
    createTodo: (args: MutationCreateTodoArgs) => {
      const { title, description } = args.input;

      if ([...title].length > 100) {
        throw new UserInputError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new UserInputError("`description` must be up to 5000 characters");
      }

      try {
        assertIsUserNodeId(args.userId);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }
    },
    updateTodo: (args: MutationUpdateTodoArgs) => {
      const { title, description, status } = args.input;

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
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
    deleteTodo: (args: MutationDeleteTodoArgs) => {
      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
    completeTodo: (args: MutationCompleteTodoArgs) => {
      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
    uncompleteTodo: (args: MutationUncompleteTodoArgs) => {
      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
  },
};
