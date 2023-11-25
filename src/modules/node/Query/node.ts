import { authAuthenticated } from "../../common/authorizers.ts";
import { parseNodeId } from "../../common/parsers.ts";
import type { QueryResolvers } from "../../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = (_parent, args, context) => {
  authAuthenticated(context.user);

  const { type, id } = parseNodeId(args.id);

  return { type, id };
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../../common/parsers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");
  const { validNodeIds, invalidNodeIds } = await import("../common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { id: validNodeIds[0] },
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
    const allows = [context.admin, context.alice];

    const denys = [context.guest];

    test.each(allows)("allows %#", user => {
      expect(() => resolve({ user })).not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      expect(() => resolve({ user })).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    test.each(validNodeIds)("valids %#", id => {
      expect(() => resolve({ args: { id } })).not.toThrow(ParseErr);
    });

    test.each(invalidNodeIds)("invalids %#", id => {
      expect(() => resolve({ args: { id } })).toThrow(ParseErr);
    });
  });
}
