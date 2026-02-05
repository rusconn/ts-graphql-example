import { RefreshToken } from "../../domain/user-token.ts";
import type { MutationResolvers } from "../../schema.ts";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "../../util/refreshToken.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";

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

  if (context.role === "guest") {
    return {
      __typename: "LogoutResult",
      success: true,
    };
  }

  if (!cookie || !RefreshToken.is(cookie.value)) {
    return {
      __typename: "LogoutResult",
      success: true,
    };
  }

  const hashed = await RefreshToken.hash(cookie.value);
  const result = await context.repos.userToken.delete(hashed);
  switch (result) {
    case "Ok":
      break;
    case "NotFound":
      throw badUserInputErr("The refresh token is invalid.");
    default:
      throw new Error(result satisfies never);
  }

  return {
    __typename: "LogoutResult",
    success: true,
  };
};
