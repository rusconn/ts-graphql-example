import { key } from "../common/resolvers.ts";
import type { UserResolvers } from "../common/schema.ts";
import { isAdminOrUserOwner } from "./common/authorizer.ts";
import { parseTodoNodeId } from "./common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = (parent, args, context) => {
  isAdminOrUserOwner(context.user, parent);

  const id = parseTodoNodeId(args.id);

  return key({ id, userId: parent.id });
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { validTodoIds, invalidTodoIds } = await import("tests/data/graph.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { full } = await import("../common/resolvers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    parent: full(admin),
    args: { id: validTodoIds[0] },
    user: admin,
  };

  const resolve = ({
    parent = valid.parent,
    args = valid.args,
    user = valid.user,
  }: {
    parent?: Parent;
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver(parent, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const denys = [
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      expect(() => resolve({ parent: full(parent), user })).not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", (user, parent) => {
      expect(() => resolve({ parent: full(parent), user })).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    test.each(validTodoIds)("valids %#", id => {
      expect(() => resolve({ args: { id } })).not.toThrow(ParseErr);
    });

    test.each(invalidTodoIds)("invalids %#", id => {
      expect(() => resolve({ args: { id } })).toThrow(ParseErr);
    });
  });
}
