import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";

type DeleteAccountResult = DiscriminatedUnion<{
  TransactionFailed: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export const deleteAccount = async (ctx: AppContextForAuthed): Promise<DeleteAccountResult> => {
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
