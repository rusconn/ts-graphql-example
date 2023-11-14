import { isAuthenticated } from "../common/authorizers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers } from "../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult
  }

  union LogoutResult = LogoutSuccess

  type LogoutSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const authed = isAuthenticated(context.user);

  const updated = await context.prisma.user.update({
    where: { id: authed.id },
    data: { token: null },
  });

  return {
    __typename: "LogoutSuccess",
    user: full(updated),
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
