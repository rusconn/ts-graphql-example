import type { Scalars } from "../../schema.ts";
import type { NodeType } from "../Node/id.ts";
import { parseId } from "./id.ts";

export const parseSomeId = <T extends NodeType, U extends string>(
  nodeType: T,
  isInternalId: (input: string) => input is U,
) => {
  return (id: Scalars["ID"]["input"]) => {
    const parsed = parseId(id);
    if (Error.isError(parsed)) {
      return parsed;
    }

    const { type, internalId } = parsed;
    if (type !== nodeType || !isInternalId(internalId)) {
      return new Error(`Invalid global id '${id}'`);
    }

    return internalId;
  };
};
