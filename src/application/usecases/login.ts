import type { EmptyObject } from "type-fest";

import { RefreshToken, User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContext } from "../context.ts";
import * as Dto from "../dto.ts";

type LoginInput = {
  email: User.Email.Type;
  password: User.Password.Type;
};

type LoginResult = DiscriminatedUnion<{
  UserNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    rawRefreshToken: RefreshToken.Token.Type;
    refreshToken: Dto.RefreshToken.Type;
  };
}>;

export const login = async (ctx: AppContext, input: LoginInput): Promise<LoginResult> => {
  const { email, password } = input;

  const credential = await ctx.queries.credential.findByEmail(email);
  if (!credential) {
    return { type: "UserNotFound" };
  }

  const match = await User.Password.match(password, credential.password);
  if (!match) {
    return { type: "IncorrectPassword" };
  }

  const { rawRefreshToken, refreshToken } = await RefreshToken.create(credential.userId);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.refreshToken.add(refreshToken);
      await repos.refreshToken.retainLatest(credential.userId, RefreshToken.MAX_RETENTION);
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
