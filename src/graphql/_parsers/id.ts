import { err, ok, type Result } from "neverthrow";

import type { Scalars } from "../_schema.ts";
import { type NodeType, nodeTypes, typeIdSep } from "../Node/id.ts";

export type Id = {
  type: NodeType;
  internalId: string;
};

export const parseId = (id: Scalars["ID"]["input"]): Result<Id, Error> => {
  const [type, internalId, ...rest] = id.split(typeIdSep);
  if (!isValidNodeType(type) || internalId == null || rest.length !== 0) {
    return err(new Error(`Invalid global id '${id}'`));
  }

  return ok({ type, internalId });
};

const isValidNodeType = (val: string | undefined): val is NodeType => {
  return nodeTypes.includes(val as NodeType);
};

if (import.meta.vitest) {
  const { nodeId } = await import("../Node/id.ts");

  const internalId = "0193cb3e-4379-750f-880f-77afae342259";

  const valids = nodeTypes.map((type) => nodeId(type)(internalId));

  const invalids = [
    `User#${internalId}`,
    `User${internalId}`,
    `User:${internalId}:${internalId}`,
    `:${internalId}`,
    `${internalId}`,
    "User",
    `${internalId}:User`,
    "",
  ];

  test.each(valids)("valids %#", (id) => {
    const parsed = parseId(id);
    expect(parsed.isOk()).toBe(true);
  });

  test.each(invalids)("invalids %#", (id) => {
    const parsed = parseId(id);
    expect(parsed.isErr()).toBe(true);
  });
}
