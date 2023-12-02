import { authAuthenticated } from "../../common/authorizers.ts";
import type { MutationResolvers } from "../../common/schema.ts";
import { userNodeId } from "../common/adapter.ts";

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
  const authed = authAuthenticated(context.user);

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
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../common/test.ts");

  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    user: context.admin,
  };

  const resolve = ({ user = valid.user }: { user?: Params["user"] }) => {
    return resolver({}, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice];

    const denies = [context.guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denies)("denies %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });
}
