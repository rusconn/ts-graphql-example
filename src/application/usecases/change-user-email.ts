import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import { EmailAlreadyExistsError } from "../../domain/unit-of-works/_errors/email-already-exists.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";
import * as Dto from "../dto.ts";

type ChangeUserEmailResult = DiscriminatedUnion<{
  UserEntityNotFound: EmptyObject;
  EmailAlreadyTaken: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    changed: Dto.User.Type;
  };
}>;

export const changeUserEmail = async (
  ctx: AppContextForAuthed,
  email: User.Email.Type,
): Promise<ChangeUserEmailResult> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserEntityNotFound" };
  }

  const changedUser = User.changeEmail(user, email);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(changedUser);
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
    changed: Dto.User.fromDomain(changedUser),
  };
};
