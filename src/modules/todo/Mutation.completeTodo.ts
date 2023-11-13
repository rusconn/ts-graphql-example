import * as Prisma from "@/prisma/mod.js";
import { isAuthenticated } from "../common/authorizers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers, MutationCompleteTodoArgs } from "../common/schema.js";
import { parseTodoNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    completeTodo(id: ID!): CompleteTodoResult
  }

  union CompleteTodoResult = CompleteTodoSuccess | TodoNotFoundError

  type CompleteTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["completeTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const todo = await context.prisma.todo.update({
      where: { id: parsed.id, userId: authed.id },
      data: parsed,
    });

    return {
      __typename: "CompleteTodoSuccess",
      todo: full(todo),
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

export const parser = (args: MutationCompleteTodoArgs) => {
  return { id: parseTodoNodeId(args.id), status: Prisma.TodoStatus.DONE };
};
