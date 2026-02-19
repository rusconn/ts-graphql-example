import type { EmptyObject } from "type-fest";

import { RefreshToken, User } from "../../domain/entities.ts";
import { EmailAlreadyExistsError } from "../../domain/unit-of-works/_errors/email-already-exists.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForGuest } from "../context.ts";
import * as Dto from "../dto.ts";

type SignupInput = {
  name: User.Name.Type;
  email: User.Email.Type;
  password: User.Password.Type;
};

type SignupResult = DiscriminatedUnion<{
  EmailAlreadyTaken: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    rawRefreshToken: RefreshToken.Token.Type;
    refreshToken: Dto.RefreshToken.Type;
  };
}>;

export const signup = async (
  ctx: AppContextForGuest,
  input: SignupInput,
): Promise<SignupResult> => {
  const user = await User.create(input);
  const { rawRefreshToken, refreshToken } = await RefreshToken.create(user.id);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.add(user);
      await repos.refreshToken.add(refreshToken);
    });
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      return { type: "EmailAlreadyTaken" };
    }
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
