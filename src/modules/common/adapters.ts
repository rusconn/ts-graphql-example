import type { ID } from "../scalar/mod.js";
import { NodeType, typeIdSep } from "./typeDefs.js";

export const nodeId =
  <T extends NodeType>(type: T) =>
  (id: string) =>
    `${type}${typeIdSep}${id}` as ID;
