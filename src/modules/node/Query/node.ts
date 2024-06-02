import { authAuthenticated } from "../../common/authorizers.ts";
import { parseNodeId } from "../../common/parsers.ts";
import type { QueryResolvers } from "../../common/schema.ts";
import { getTodo } from "../../todo/common/resolver.ts";
import { getUser } from "../../user/common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  authAuthenticated(context);

  const { type, id } = parseNodeId(args.id);

  const getNode = {
    Todo: getTodo,
    User: getUser,
  }[type];

  const node = await getNode(context, { id });

  return { type, ...node };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
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

    const denies = [context.guest];

    test.each(allows)("allows %#", async (user) => {
      await resolve({ user });
    });

    test.each(denies)("denies %#", async (user) => {
      expect.assertions(1);
      try {
        await resolve({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });

  describe("Parsing", () => {
    test.each(validNodeIds)("valids %#", async (id) => {
      await resolve({ args: { id } });
    });

    test.each(invalidNodeIds)("invalids %#", async (id) => {
      expect.assertions(1);
      try {
        await resolve({ args: { id } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
