import * as Prisma from "@/prisma/mod.js";
import { isAuthenticated } from "../common/authorizers.js";
import { ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers, MutationUpdateTodoArgs } from "../common/schema.js";
import { parseTodoNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): UpdateTodoResult
  }

  input UpdateTodoInput {
    "100文字まで、null は入力エラー"
    title: NonEmptyString
    "5000文字まで、null は入力エラー"
    description: String
    "null は入力エラー"
    status: TodoStatus
  }

  union UpdateTodoResult = UpdateTodoSuccess | TodoNotFoundError

  type UpdateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["updateTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const todo = await context.prisma.todo.update({
      where: { id: parsed.id, userId: authed.id },
      data: parsed,
    });

    return {
      __typename: "UpdateTodoSuccess",
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

export const parser = (args: MutationUpdateTodoArgs) => {
  const { id, input } = args;
  const { title, description, status } = input;

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
};
