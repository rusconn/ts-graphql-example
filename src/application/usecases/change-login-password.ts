import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";
import * as Dto from "../dto.ts";

type ChangeLoginPasswordInput = {
  oldPassword: User.Password.Type;
  newPassword: User.Password.Type;
};

type ChangeLoginPasswordResult = DiscriminatedUnion<{
  UserEntityNotFound: EmptyObject;
  SamePasswords: EmptyObject;
  IncorrectOldPassword: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    changed: Dto.User.Type;
  };
}>;

export const changeLoginPassword = async (
  ctx: AppContextForAuthed,
  input: ChangeLoginPasswordInput,
): Promise<ChangeLoginPasswordResult> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserEntityNotFound" };
  }

  const changedUser = await User.changePassword(user, input);
  if (changedUser.isErr()) {
    switch (changedUser.error) {
      case "SamePasswords":
        return { type: "SamePasswords" };
      case "IncorrectOldPassword":
        return { type: "IncorrectOldPassword" };
      default:
        throw new Error(changedUser.error satisfies never);
    }
  }

  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(changedUser.value);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dto.User.fromDomain(changedUser.value),
  };
};
