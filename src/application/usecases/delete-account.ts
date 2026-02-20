import type { EmptyObject } from "type-fest";

import * as Domain from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";

type DeleteAccountResult = DiscriminatedUnion<{
  UserEntityNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export const deleteAccount = async (
  ctx: AppContextForAuthed,
  password: Domain.User.Password.Type,
): Promise<DeleteAccountResult> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserEntityNotFound" };
  }
  if (!(await Domain.User.authenticate(user, password))) {
    return { type: "IncorrectPassword" };
  }

  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.removeByUserId(ctx.user.id);
      await repos.refreshToken.removeByUserId(ctx.user.id);
      await repos.user.remove(ctx.user.id);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return { type: "Success" };
};
