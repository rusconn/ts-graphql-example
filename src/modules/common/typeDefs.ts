import type { OverrideProperties } from "type-fest";

import * as cursorConnections from "../../lib/graphql/cursor.ts";

export const nodeTypes = ["Post", "User"] as const;

export type NodeType = (typeof nodeTypes)[number];

export const typeIdSep = ":";

export const cursorConnection = (
  params: OverrideProperties<cursorConnections.DefineParams, { nodeType: NodeType }>,
) => cursorConnections.define(params);
