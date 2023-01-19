import type { ConnectionArguments } from "@devoxa/prisma-relay-cursor-connection";

import { splitNodeId, splitTodoNodeId, splitUserNodeId } from "@/graphql/adapters";
import { ParseError } from "@/graphql/errors";
import type { Graph } from "@/graphql/types";

// @devoxa/prisma-relay-cursor-connection がバリデーション部分のコードを export していないのでコピーしてきた
// バリデーションは事前に行い、上記ライブラリの使用時にバリデーションエラーが発生しないことを保証する
// ライブラリのコードなのでテストはしない
export const parseConnectionArgs = ({ first, last, before, after }: ConnectionArguments) => {
  if (first != null && last != null) {
    throw new ParseError('Only one of "first" and "last" can be set');
  }

  if (after != null && before != null) {
    throw new ParseError('Only one of "after" and "before" can be set');
  }

  // If `after` is set, `first` has to be set
  if (after != null && first == null) {
    throw new ParseError('"after" needs to be used with "first"');
  }

  // If `before` is set, `last` has to be set
  if (before != null && last == null) {
    throw new ParseError('"before" needs to be used with "last"');
  }

  // `first` and `last` have to be positive
  if (first != null && first <= 0) {
    throw new ParseError('"first" has to be positive');
  }

  if (last != null && last <= 0) {
    throw new ParseError('"last" has to be positive');
  }

  return { first, last, before, after };
};

export const parseNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitNodeId(id);
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};

export const parseTodoNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitTodoNodeId(id).id;
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};

export const parseUserNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitUserNodeId(id).id;
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};
