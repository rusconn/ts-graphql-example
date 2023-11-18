import { key } from "../common/resolvers.ts";
import type { UserResolvers } from "../common/schema.ts";
import { authAdminOrUserOwner } from "./common/authorizer.ts";
import { parseTodoNodeId } from "./common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = (parent, args, context) => {
  authAdminOrUserOwner(context.user, parent);

  const id = parseTodoNodeId(args.id);

  return key({ id, userId: parent.id });
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { full } = await import("../common/resolvers.ts");
  const { dummyContext } = await import("../common/tests.ts");
  const { context, db } = await import("../user/common/test.ts");
  const { validTodoIds, invalidTodoIds } = await import("./common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    parent: full(db.admin),
    args: { id: validTodoIds[0] },
    user: context.admin,
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
      [context.admin, db.admin],
      [context.admin, db.alice],
      [context.alice, db.alice],
    ] as const;

    const denys = [
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
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
