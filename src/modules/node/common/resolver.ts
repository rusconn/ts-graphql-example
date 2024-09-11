import type { parseNodeId } from "../../common/parsers.ts";

export type Node = ReturnType<typeof parseNodeId>;
