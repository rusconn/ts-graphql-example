import * as Prisma from "@/prisma";
import { isAuthenticated } from "../common/authorizers";
import type { MutationResolvers, MutationDeleteTodoArgs } from "../common/schema";
import { todoNodeId } from "./common/adapter";
import { parseTodoNodeId } from "./common/parser";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deleteTodo(id: ID!): DeleteTodoResult
  }

  union DeleteTodoResult = DeleteTodoSuccess | TodoNotFoundError

  type DeleteTodoSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const todo = await context.prisma.todo.delete({
      where: { id: parsed.id, userId: authed.id },
      select: { id: true },
    });

    return {
      __typename: "DeleteTodoSuccess",
      id: adapter(todo.id),
    };
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      context.logger.error(e, "error info");

      return {
        __typename: "TodoNotFoundError",
        message: "todo not found",
      };
    }

    throw e;
  }
};

export const authorizer = isAuthenticated;

export const parser = (args: MutationDeleteTodoArgs) => {
  return { id: parseTodoNodeId(args.id) };
};

export const adapter = todoNodeId;
