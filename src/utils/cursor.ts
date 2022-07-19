import type { ConnectionArguments } from "@devoxa/prisma-relay-cursor-connection";
import { UserInputError } from "apollo-server";

// @devoxa/prisma-relay-cursor-connection がバリデーション部分のコードを export していないのでコピーしてきた
// バリデーションは事前に行い、上記ライブラリの使用時にバリデーションエラーが発生しないことを保証する
// ライブラリのコードなのでテストはしない
export const parseConnectionArgs = ({ first, last, before, after }: ConnectionArguments) => {
  if (first != null && last != null) {
    throw new UserInputError('Only one of "first" and "last" can be set');
  }

  if (after != null && before != null) {
    throw new UserInputError('Only one of "after" and "before" can be set');
  }

  // If `after` is set, `first` has to be set
  if (after != null && first == null) {
    throw new UserInputError('"after" needs to be used with "first"');
  }

  // If `before` is set, `last` has to be set
  if (before != null && last == null) {
    throw new UserInputError('"before" needs to be used with "last"');
  }

  // `first` and `last` have to be positive
  if (first != null && first <= 0) {
    throw new UserInputError('"first" has to be positive');
  }

  if (last != null && last <= 0) {
    throw new UserInputError('"last" has to be positive');
  }

  return { first, last, before, after };
};
