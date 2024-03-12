import { authAdmin } from "../../common/authorizers.ts";
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

  return { id };
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

    test.each(allows)("allows %#", user => {
      resolve({ user });
    });

    test.each(denies)("denies %#", user => {
      expect.assertions(1);
      try {
        resolve({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });

  describe("Parsing", () => {
    test.each(validUserIds)("valids %#", id => {
      resolve({ args: { id } });
    });

    test.each(invalidUserIds)("invalids %#", id => {
      expect.assertions(1);
      try {
        resolve({ args: { id } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
