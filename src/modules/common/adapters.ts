import type { ID } from "../scalar/mod.ts";
import type { NodeType } from "./typeDefs.ts";

export const typeIdSep = ":";

export const nodeId =
  <T extends NodeType>(type: T) =>
  (id: string) =>
    `${type}${typeIdSep}${id}` as ID;
