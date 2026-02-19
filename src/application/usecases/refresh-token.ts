import type { EmptyObject } from "type-fest";

import { RefreshToken } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContext } from "../context.ts";
import * as Dto from "../dto.ts";

type RefreshTokenResult = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenExpired: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    rawRefreshToken: RefreshToken.Token.Type;
    refreshToken: Dto.RefreshToken.Type;
  };
}>;

export const refreshToken = async (
  context: AppContext,
  refresh: string,
): Promise<RefreshTokenResult> => {
  if (!RefreshToken.Token.is(refresh)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshToken.Token.hash(refresh);
  const refreshToken = await context.repos.refreshToken.find(hashed);
  if (!refreshToken) {
    return { type: "InvalidRefreshToken" };
  }
  if (RefreshToken.isExpired(refreshToken)) {
    return { type: "RefreshTokenExpired" };
  }

  const { rawRefreshToken, refreshToken: newRefreshToken } = await RefreshToken.create(
    refreshToken.userId,
  );
  try {
    await context.unitOfWork.run(async (repos) => {
      await repos.refreshToken.remove(hashed);
      await repos.refreshToken.add(newRefreshToken);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    rawRefreshToken,
    refreshToken: Dto.RefreshToken.fromDomain(refreshToken),
  };
};
