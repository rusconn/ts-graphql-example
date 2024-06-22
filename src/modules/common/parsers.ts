import { GraphQLError } from "graphql";

import { nodeId } from "./adapters.ts";
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

if (import.meta.vitest) {
  describe("parseNodeId", () => {
    const id = "01H75CPZGG1YW9W79M7WWT6KFB";

    const valids = nodeTypes.map((type) => nodeId(type)(id));

    const invalids = [
      `User#${id}`,
      `User${id}`,
      `User:${id}:${id}`,
      `:${id}`,
      `${id}`,
      "User",
      `${id}:User`,
      "",
    ] as const;

    test.each(valids)("valids %#", (valid) => {
      parseNodeId(valid);
    });

    test.each(invalids)("invalids %#", (invalid) => {
      expect.assertions(1);
      try {
        parseNodeId(invalid);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
