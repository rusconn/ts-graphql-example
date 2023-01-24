import * as DataSource from "@/datasources";
import { ParseError } from "@/graphql/errors";
import type { Graph } from "@/graphql/types";
import { parseTodoNodeId } from "@/graphql/utils";

export const parsers = {
  Mutation: {
    createTodo: (args: Graph.MutationCreateTodoArgs) => {
      const {
        input: { title, description },
      } = args;

      if ([...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      return { title, description };
    },
    updateTodo: (args: Graph.MutationUpdateTodoArgs) => {
      const {
        id,
        input: { title, description, status },
      } = args;

      const idToUse = parseTodoNodeId(id);

      if (title === null) {
        throw new ParseError("`title` must be not null");
      }

      if (description === null) {
        throw new ParseError("`description` must be not null");
      }

      if (status === null) {
        throw new ParseError("`status` must be not null");
      }

      if (title && [...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }

      if (description && [...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      return { id: idToUse, title, description, status };
    },
    deleteTodo: ({ id }: Graph.MutationDeleteTodoArgs) => {
      return { id: parseTodoNodeId(id) };
    },
    completeTodo: ({ id }: Graph.MutationCompleteTodoArgs) => {
      return { id: parseTodoNodeId(id), status: DataSource.TodoStatus.DONE };
    },
    uncompleteTodo: ({ id }: Graph.MutationUncompleteTodoArgs) => {
      return { id: parseTodoNodeId(id), status: DataSource.TodoStatus.PENDING };
    },
  },
};
