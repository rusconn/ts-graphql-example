import type { Scalars } from "../../schema.ts";
import { type NodeType, nodeTypes, typeIdSep } from "../_adapters/id.ts";

export const parseId = ({ id }: { id: Scalars["ID"]["input"] }) => {
  const [type, internalId, ...rest] = id.split(typeIdSep);

  if (!isValidNodeType(type) || internalId == null || rest.length !== 0) {
    return new Error(`Invalid global id '${id}'`);
  }

  return { type, internalId };
};

const isValidNodeType = (val: string | undefined): val is NodeType => {
  return nodeTypes.includes(val as NodeType);
};

if (import.meta.vitest) {
  const { nodeId } = await import("../_adapters/id.ts");

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
    const parsed = parseId({ id });
    expect(parsed instanceof Error).toBe(false);
  });

  test.each(invalids)("invalids %#", (id) => {
    const parsed = parseId({ id });
    expect(parsed instanceof Error).toBe(true);
  });
}
