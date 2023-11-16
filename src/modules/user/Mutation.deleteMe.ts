import { isAuthenticated } from "../common/authorizers.ts";
import type { MutationResolvers } from "../common/schema.ts";
import { userNodeId } from "./common/adapter.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "紐づくリソースは全て削除される"
    deleteMe: DeleteMeResult
  }

  union DeleteMeResult = DeleteMeSuccess

  type DeleteMeSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteMe"] = async (_parent, _args, context) => {
  const authed = authorizer(context.user);

  const deleted = await context.prisma.user.delete({
    where: { id: authed.id },
    select: { id: true },
  });

  return {
    __typename: "DeleteMeSuccess",
    id: adapter(deleted.id),
  };
};

const authorizer = isAuthenticated;

const adapter = userNodeId;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");

  describe("Authorization", () => {
    const allow = [admin, alice];

    const deny = [guest];

    test.each(allow)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", user => {
      expect(() => authorizer(user)).toThrow(AuthErr);
    });
  });
}
