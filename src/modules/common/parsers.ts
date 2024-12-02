import { GraphQLError } from "graphql";

import { ErrorCode, type Scalars } from "../../schema.ts";
import { nodeId } from "./adapters.ts";
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

const isValidNodeType = (val: string | undefined): val is NodeType => {
  return nodeTypes.includes(val as NodeType);
};

export const numChars = (s: string) => {
  return [...s].length;
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

  describe("numChars", () => {
    const cases = [
      { s: "", num: 0 },
      { s: "abc", num: 3 },
      { s: "リポD", num: 3 },
      { s: "𠮷野屋", num: 3 }, // サロゲートペアを含む
      { s: "👨‍👩‍👧‍👦", num: 7 }, // 4文字を3つのZWJにより結合したもの
      { s: "a👨‍👩‍👧‍👦c", num: 9 },
    ];

    test.each(cases)("%o", ({ s, num }) => {
      expect(numChars(s)).toBe(num);
    });
  });
}
