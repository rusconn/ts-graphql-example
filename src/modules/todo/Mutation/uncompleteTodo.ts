import { TodoStatus } from "../../../db/types.ts";
import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { parseTodoNodeId } from "../parsers.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    uncompleteTodo(id: ID!): UncompleteTodoResult
  }

  union UncompleteTodoResult = UncompleteTodoSuccess | InvalidInputError | ResourceNotFoundError

  type UncompleteTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["uncompleteTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseTodoNodeId(args.id);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const todo = await context.db
    .updateTable("Todo")
    .where("id", "=", parsed)
    .where("userId", "=", authed.id)
    .set({
      updatedAt: new Date(),
      status: TodoStatus.PENDING,
    })
    .returningAll()
    .executeTakeFirst();

  return todo
    ? {
        __typename: "UncompleteTodoSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};
