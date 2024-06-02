import { authAdmin } from "../../common/authorizers.ts";
import type { QueryResolvers } from "../../common/schema.ts";
import { parseUserNodeId } from "../common/parser.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  authAdmin(context);

  const id = parseUserNodeId(args.id);

  return await getUser(context, { id });
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
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
    test.each(validUserIds)("valids %#", async (id) => {
      await resolve({ args: { id } });
    });

    test.each(invalidUserIds)("invalids %#", async (id) => {
      expect.assertions(1);
      try {
        await resolve({ args: { id } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
