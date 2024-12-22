import type { Scalars } from "../../../schema.ts";
import type { NodeType } from "../adapters/id.ts";
import { parseNodeId } from "../parsers/nodeId.ts";
import { parseErr } from "./util.ts";

export const parseSomeNodeId =
  <T extends NodeType>(nodeType: T) =>
  (nodeId: Scalars["ID"]["input"]) => {
    const parsed = parseNodeId(nodeId);

    if (parsed instanceof Error) {
      return parsed;
    }

    const { type, id } = parsed;

    if (type !== nodeType) {
      return parseErr(`invalid node id: ${nodeId}`);
    }

    return id;
  };
