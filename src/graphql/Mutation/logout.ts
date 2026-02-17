import { RefreshToken } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { Context } from "../../server/context.ts";
import * as RefreshTokenCookie from "../../util/refresh-token-cookie.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: Void @semanticNonNull @complexity(value: 100)
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  return await logic(context);
};

const logic = async (context: Context): Promise<ReturnType<MutationResolvers["logout"]>> => {
  const cookie = await RefreshTokenCookie.get(context);
  if (!cookie) {
    return;
  }

  await RefreshTokenCookie.clear(context);

  if (!RefreshToken.Token.is(cookie.value)) {
    return;
  }

  const hashed = await RefreshToken.Token.hash(cookie.value);
  try {
    await context.unitOfWork.run(async (repos) => {
      await repos.refreshToken.remove(hashed);
    });
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return;
    }
    throw internalServerError(e);
  }
};
