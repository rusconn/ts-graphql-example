import type { OverrideProperties } from "type-fest";

import * as graphql from "../../lib/graphql.ts";

export const nodeTypes = ["Post", "User"] as const;

export type NodeType = (typeof nodeTypes)[number];

export const typeIdSep = ":";

export const cursorConnection = (
  params: OverrideProperties<graphql.Params, { nodeType: NodeType }>,
) => graphql.cursorConnection(params);
