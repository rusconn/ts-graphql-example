import { authAdmin } from "../../common/authorizers.ts";
import { key } from "../../common/resolvers.ts";
import type { QueryResolvers } from "../../common/schema.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = (_parent, args, context) => {
  authAdmin(context.user);

  const id = parseUserNodeId(args.id);

  return key({ id });
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../../common/parsers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, validUserIds, invalidUserIds } = await import("../common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { id: validUserIds[0] },
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin];

    const denies = [context.alice, context.guest];

    test.each(allows)("allows %#", user => {
      expect(() => resolve({ user })).not.toThrow(AuthErr);
    });

    test.each(denies)("denies %#", user => {
      expect(() => resolve({ user })).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    test.each(validUserIds)("valid %#", id => {
      expect(() => resolve({ args: { id } })).not.toThrow(ParseErr);
    });

    test.each(invalidUserIds)("invalid %#", id => {
      expect(() => resolve({ args: { id } })).toThrow(ParseErr);
    });
  });
}
