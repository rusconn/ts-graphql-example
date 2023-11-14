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
  const authed = isAuthenticated(context.user);

  const deleted = await context.prisma.user.delete({
    where: { id: authed.id },
    select: { id: true },
  });

  return {
    __typename: "DeleteMeSuccess",
    id: userNodeId(deleted.id),
  };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    user: admin,
  };

  const resolve = ({ user = valid.user }: { user?: Params["user"] }) => {
    return resolver({}, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [admin, alice];

    const denys = [guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });
}
