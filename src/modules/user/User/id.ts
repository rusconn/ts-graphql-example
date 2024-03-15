import type { UserResolvers } from "../../common/schema.ts";
import { userNodeId } from "../common/adapter.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  return userNodeId(parent.id);
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, db } = await import("../common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    return resolver(parent, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [context.admin, db.admin],
      [context.admin, db.alice],
      [context.alice, db.alice],
    ] as const;

    const denies = [
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      resolve({ parent, user });
    });

    test.each(denies)("denies %#", (user, parent) => {
      expect.assertions(1);
      try {
        resolve({ parent, user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
