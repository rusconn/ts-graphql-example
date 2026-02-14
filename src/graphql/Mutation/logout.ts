import { RefreshToken } from "../../domain/models.ts";
import { EntityNotFoundError } from "../../domain/unit-of-works/_shared/errors.ts";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "../../util/refreshToken.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import type { MutationResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult @semanticNonNull @complexity(value: 5)
  }

  type LogoutResult {
    success: Boolean!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const cookie = await getRefreshTokenCookie(context.request);
  await deleteRefreshTokenCookie(context.request);

  if (context.role === "GUEST") {
    return {
      __typename: "LogoutResult",
      success: true,
    };
  }

  if (!cookie || !RefreshToken.Token.is(cookie.value)) {
    return {
      __typename: "LogoutResult",
      success: true,
    };
  }

  const hashed = await RefreshToken.Token.hash(cookie.value);
  try {
    await context.unitOfWork.run(async (repos) => {
      await repos.refreshToken.remove(hashed);
    });
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return {
        __typename: "LogoutResult",
        success: true,
      };
    }
    throw internalServerError(e);
  }

  return {
    __typename: "LogoutResult",
    success: true,
  };
};
