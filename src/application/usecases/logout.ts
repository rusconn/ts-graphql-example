import type { EmptyObject } from "type-fest";

import { RefreshToken } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContext } from "../context.ts";

type LogoutResult = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenEntityNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export const logout = async (context: AppContext, refreshToken: string): Promise<LogoutResult> => {
  if (!RefreshToken.Token.is(refreshToken)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshToken.Token.hash(refreshToken);
  try {
    await context.unitOfWork.run(async (repos) => {
      await repos.refreshToken.remove(hashed);
    });
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return { type: "RefreshTokenEntityNotFound" };
    }
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return { type: "Success" };
};
