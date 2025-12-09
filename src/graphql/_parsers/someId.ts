import type { Scalars } from "../../schema.ts";
import type { NodeType } from "../_adapters/id.ts";
import { parseId } from "./id.ts";

export const parseSomeId = <T extends NodeType, U extends string>(
  nodeType: T,
  isInternalId: (input: string) => input is U,
) => {
  return (id: Scalars["ID"]["input"]) => {
    const parsed = parseId(id);

    if (parsed instanceof Error) {
      return parsed;
    }

    const { type, internalId } = parsed;

    if (type !== nodeType || !isInternalId(internalId)) {
      return new Error(`Invalid global id '${id}'`);
    }

    return internalId;
  };
};
