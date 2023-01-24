import * as DataSource from "@/datasources";
import { ParseError } from "@/graphql/errors";
import type { Graph } from "@/graphql/types";
import { parseTodoNodeId } from "@/graphql/utils";

export const parsers = {
  Query: {
    myTodo: ({ id }: Graph.QueryMyTodoArgs) => {
      return { id: parseTodoNodeId(id) };
    },
  },
  Mutation: {
    createMyTodo: (args: Graph.MutationCreateMyTodoArgs) => {
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
    updateMyTodo: (args: Graph.MutationUpdateMyTodoArgs) => {
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
    deleteMyTodo: ({ id }: Graph.MutationDeleteMyTodoArgs) => {
      return { id: parseTodoNodeId(id) };
    },
    completeMyTodo: ({ id }: Graph.MutationCompleteMyTodoArgs) => {
      return { id: parseTodoNodeId(id), status: DataSource.TodoStatus.DONE };
    },
    uncompleteMyTodo: ({ id }: Graph.MutationUncompleteMyTodoArgs) => {
      return { id: parseTodoNodeId(id), status: DataSource.TodoStatus.PENDING };
    },
  },
};
