import type { ConnectionArguments } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";

import { ErrorCode, type Scalars } from "./schema.ts";
import { type NodeType, nodeTypes, typeIdSep } from "./typeDefs.ts";

export const parseErr = (message: string) =>
  new GraphQLError(message, {
    extensions: { code: ErrorCode.BadUserInput },
  });

export const parseSomeNodeId =
  <T extends NodeType>(nodeType: T) =>
  (nodeId: Scalars["ID"]["input"]) => {
    const { type, id } = parseNodeId(nodeId);

    if (type !== nodeType) {
      throw parseErr(`invalid node id: ${nodeId}`);
    }

    return id;
  };

export const parseNodeId = (nodeId: Scalars["ID"]["input"]) => {
  const [type, id, ...rest] = nodeId.split(typeIdSep);

  if (!isValidNodeType(type) || id == null || id === "" || rest.length !== 0) {
    throw parseErr(`invalid node id: ${nodeId}`);
  }

  return { type, id };
};

const isValidNodeType = (val: string): val is NodeType => {
  return nodeTypes.includes(val as NodeType);
};

// @devoxa/prisma-relay-cursor-connection がバリデーション部分のコードを export していないのでコピーしてきた
// バリデーションは事前に行い、上記ライブラリの使用時にバリデーションエラーが発生しないことを保証する
export const parseConnectionArgs = ({ first, after, last, before }: ConnectionArguments) => {
  if (first != null && last != null) {
    throw parseErr('Only one of "first" and "last" can be set');
  }
  if (after != null && before != null) {
    throw parseErr('Only one of "after" and "before" can be set');
  }
  // If `after` is set, `first` has to be set
  if (after != null && first == null) {
    throw parseErr('"after" needs to be used with "first"');
  }
  // If `before` is set, `last` has to be set
  if (before != null && last == null) {
    throw parseErr('"before" needs to be used with "last"');
  }
  // `first` and `last` have to be positive
  if (first != null && first <= 0) {
    throw parseErr('"first" has to be positive');
  }
  if (last != null && last <= 0) {
    throw parseErr('"last" has to be positive');
  }

  return { first, after, last, before };
};
