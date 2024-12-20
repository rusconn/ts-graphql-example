import { validate as uuidValidate } from "uuid";
import type { Scalars } from "../../schema.ts";
import { nodeId } from "./adapters.ts";
import { type NodeType, nodeTypes, typeIdSep } from "./typeDefs.ts";

export const parseErr = (message: string) => {
  return new Error(message);
};

export const parseSomeNodeId =
  <T extends NodeType>(nodeType: T) =>
  (nodeId: Scalars["ID"]["input"]) => {
    const parsed = parseNodeId(nodeId);

    if (parsed instanceof Error) {
      return parsed;
    }

    const { type, id } = parsed;

    return type !== nodeType //
      ? parseErr(`invalid node id: ${nodeId}`)
      : id;
  };

export const parseNodeId = (nodeId: Scalars["ID"]["input"]) => {
  const [type, id, ...rest] = nodeId.split(typeIdSep);

  return !isValidNodeType(type) || id == null || !uuidValidate(id) || rest.length !== 0
    ? parseErr(`invalid node id: ${nodeId}`)
    : { type, id };
};

export const parseCursor = (id: string) => {
  return !uuidValidate(id) //
    ? parseErr(`invalid cursor: ${id}`)
    : id;
};

const isValidNodeType = (val: string | undefined): val is NodeType => {
  return nodeTypes.includes(val as NodeType);
};

export const numChars = (s: string) => {
  return [...s].length;
};

if (import.meta.vitest) {
  describe("parseNodeId", () => {
    describe("node type", () => {
      const id = "0193cb3e-4379-750f-880f-77afae342259";

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
        const parsed = parseNodeId(valid);
        expect(parsed instanceof Error).toBe(false);
      });

      test.each(invalids)("invalids %#", (invalid) => {
        const parsed = parseNodeId(invalid);
        expect(parsed instanceof Error).toBe(true);
      });
    });

    describe("internal id", () => {
      const valids = [
        "0193cb3e-4379-750f-880f-77afae342259",
        "0193cb3e-504f-72e9-897c-2c71f389f3ad",
        "0193cb3e-58fe-772b-8306-412afa147cdd",
      ].map((id) => `User:${id}`);

      const invalids = [
        "0193cb3e-4379-750f-880f-77afae34225", // length
        "0193cb3e-504f-72e9-897c-2c71f389f3ag", // g
        "0193cb3e-58fe-072b-8306-412afa147cdd", // version
      ].map((id) => `User:${id}`);

      test.each(valids)("valids %#", (valid) => {
        const parsed = parseNodeId(valid);
        expect(parsed instanceof Error).toBe(false);
      });

      test.each(invalids)("invalids %#", (invalid) => {
        const parsed = parseNodeId(invalid);
        expect(parsed instanceof Error).toBe(true);
      });
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
