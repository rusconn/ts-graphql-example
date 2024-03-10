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
