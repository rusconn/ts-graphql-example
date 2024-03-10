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
  const authed = authAuthenticated(context);

  const deleted = await context.db
    .deleteFrom("User")
    .where("id", "=", authed.id)
    .returning("id")
    .executeTakeFirstOrThrow();

  return {
    __typename: "DeleteMeSuccess",
    id: userNodeId(deleted.id),
  };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
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

    test.each(allows)("allows %#", async user => {
      await resolve({ user });
    });

    test.each(denies)("denies %#", async user => {
      expect.assertions(1);
      try {
        await resolve({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
