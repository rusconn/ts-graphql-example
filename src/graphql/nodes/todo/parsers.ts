import * as DataSource from "@/datasources";
import { splitUserNodeId } from "@/graphql/adapters";
import { ParseError } from "@/graphql/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs, parseTodoNodeId, parseUserNodeId } from "@/graphql/utils";

type Parent = Graph.ResolversParentTypes["User"];

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
  User: {
    todo: (parent: Parent, args: Graph.UserTodoArgs) => {
      return { id: parseTodoNodeId(args.id), userId: parseUserNodeId(parent.id) };
    },
    todos: (args: Graph.UserTodosArgs & Pick<Graph.User, "id">) => {
      const { id, orderBy, ...connectionArgs } = args;

      const { id: userId } = splitUserNodeId(id);

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first == null && last == null) {
        throw new ParseError("`first` or `last` value required");
      }

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      const firstToUse = first == null && last == null ? 20 : first;

      const beforeToUse = before ? parseTodoNodeId(before) : before;
      const afterToUse = after ? parseTodoNodeId(after) : after;

      const directionToUse =
        orderBy.direction === Graph.OrderDirection.Asc
          ? DataSource.TodoSortOrder.asc
          : DataSource.TodoSortOrder.desc;

      const orderByToUse =
        orderBy.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse }, { id: directionToUse }]
          : [{ updatedAt: directionToUse }, { id: directionToUse }];

      return {
        first: firstToUse,
        last,
        before: beforeToUse,
        after: afterToUse,
        userId,
        orderBy: orderByToUse,
      };
    },
  },
};
