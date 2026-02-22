import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";
import * as Dto from "../dto.ts";

type UpdateAccountInput = {
  name?: User.Name.Type;
};

type UpdateAccountResult = DiscriminatedUnion<{
  UserEntityNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    updated: Dto.User.Type;
  };
}>;

export const updateAccount = async (
  ctx: AppContextForAuthed,
  input: UpdateAccountInput,
): Promise<UpdateAccountResult> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserEntityNotFound" };
  }

  const updatedUser = User.updateAccount(user, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(updatedUser);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dto.User.fromDomain(updatedUser),
  };
};
