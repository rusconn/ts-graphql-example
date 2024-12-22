import * as uuid from "../../../lib/uuid.ts";
import type { Scalars } from "../../../schema.ts";
import { type NodeType, nodeTypes, typeIdSep } from "../adapters/id.ts";
import { parseErr } from "./util.ts";

export const parseNodeId = (nodeId: Scalars["ID"]["input"]) => {
  const [type, id, ...rest] = nodeId.split(typeIdSep);

  if (!isValidNodeType(type) || id == null || !uuid.is(id) || rest.length !== 0) {
    return parseErr(`invalid node id: ${nodeId}`);
  }

  return { type, id };
};

const isValidNodeType = (val: string | undefined): val is NodeType => {
  return nodeTypes.includes(val as NodeType);
};

if (import.meta.vitest) {
  const { nodeId } = await import("../adapters/id.ts");

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
}
