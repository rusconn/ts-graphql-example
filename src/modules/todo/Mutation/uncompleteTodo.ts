import { TodoStatus } from "../../../db/types.ts";
import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseTodoNodeId } from "../common/parser.ts";

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

  let id: ReturnType<typeof parseTodoNodeId>;
  try {
    id = parseTodoNodeId(args.id);
  } catch (e) {
    if (e instanceof Error) {
      return {
        __typename: "InvalidInputError",
        message: e.message,
      };
    }
    throw e;
  }

  const todo = await context.db
    .updateTable("Todo")
    .where("id", "=", id)
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
