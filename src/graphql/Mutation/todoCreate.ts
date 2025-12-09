import type { Context } from "../../context.ts";
import { TodoStatus } from "../../models/todo.ts";
import type { MutationResolvers, MutationTodoCreateArgs, ResolversTypes } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import type { AuthContext } from "../_authorizers/types.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoDescription, TODO_DESCRIPTION_MAX } from "../_parsers/todo/description.ts";
import { parseTodoTitle, TODO_TITLE_MAX } from "../_parsers/todo/title.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

const TODOS_MAX = 10_000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ${TODOS_MAX}件まで
    """
    todoCreate(
      """
      ${TODO_TITLE_MAX}文字まで
      """
      title: String! = ""

      """
      ${TODO_DESCRIPTION_MAX}文字まで
      """
      description: String! = ""
    ): TodoCreateResult @semanticNonNull @complexity(value: 5)
  }

  union TodoCreateResult = TodoCreateSuccess | InvalidInputErrors | ResourceLimitExceededError

  type TodoCreateSuccess {
    todo: Todo!
    todoEdge: TodoEdge!
  }
`;

export const resolver: MutationResolvers["todoCreate"] = async (_parent, args, context) => {
  const authed = authorize(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  return await logic(authed, parsed, context);
};

const authorize = (context: AuthContext) => {
  return authAuthenticated(context);
};

const parseArgs = (args: MutationTodoCreateArgs) => {
  const title = parseTodoTitle(args, "title", {
    optional: false,
    nullable: false,
  });
  const description = parseTodoDescription(args, "description", {
    optional: false,
    nullable: false,
  });

  if (
    title instanceof ParseErr || //
    description instanceof ParseErr
  ) {
    const errors = [];

    if (title instanceof ParseErr) {
      errors.push(title);
    }
    if (description instanceof ParseErr) {
      errors.push(description);
    }

    return errors;
  } else {
    return { title, description };
  }
};

const logic = async (
  authed: Exclude<ReturnType<typeof authorize>, Error>,
  parsed: Exclude<ReturnType<typeof parseArgs>, Error[]>,
  context: Context,
): Promise<ResolversTypes["TodoCreateResult"]> => {
  const { title, description } = parsed;

  const count = await context.repos.todo.count(authed.id);

  if (count >= TODOS_MAX) {
    return {
      __typename: "ResourceLimitExceededError",
      message: `The number of todos exceeds the maximum number of ${TODOS_MAX}.`,
    };
  }

  const todo = await context.repos.todo.create({
    title,
    description,
    status: TodoStatus.PENDING,
    userId: authed.id,
  });

  if (!todo) {
    throw internalServerError();
  }

  return {
    __typename: "TodoCreateSuccess",
    todo,
    todoEdge: {
      cursor: todo.id,
      node: todo,
    },
  };
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const valid = {
    args: { title: "title", description: "description" },
    user: context.user.admin,
  };

  const invalid = {
    args: {
      title: "A".repeat(TODO_TITLE_MAX + 1),
      description: "A".repeat(TODO_DESCRIPTION_MAX + 1),
    },
  };

  describe("Parsing", () => {
    const valids: MutationTodoCreateArgs[] = [
      { ...valid.args },
      { ...valid.args, title: "A".repeat(TODO_TITLE_MAX) },
      { ...valid.args, description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ];

    const invalids: [MutationTodoCreateArgs, (keyof MutationTodoCreateArgs)[]][] = [
      [{ ...valid.args, title: invalid.args.title }, ["title"]],
      [{ ...valid.args, description: invalid.args.description }, ["description"]],
      [{ ...valid.args, ...invalid.args }, ["title", "description"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(false);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as ParseErr[]).map((e) => e.field)).toStrictEqual(fields);
    });
  });

  describe("Maximum num todos", () => {
    const createRepos = (num: number) =>
      ({
        todo: {
          count: async () => num,
          create: async () => ({ id: "dummy" }),
        },
      }) as unknown as Context["repos"];

    const notExceededs = [0, 1, TODOS_MAX - 1];
    const exceededs = [TODOS_MAX, TODOS_MAX + 1];

    test.each(notExceededs)("notExceededs %#", async (num) => {
      const repos = createRepos(num);
      const result = await logic(valid.user, valid.args, { repos } as Context);
      expect(result?.__typename === "ResourceLimitExceededError").toBe(false);
    });

    test.each(exceededs)("exceededs %#", async (num) => {
      const repos = createRepos(num);
      const result = await logic(valid.user, valid.args, { repos } as Context);
      expect(result?.__typename === "ResourceLimitExceededError").toBe(true);
    });
  });
}
