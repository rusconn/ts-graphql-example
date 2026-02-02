import type { NodeResolvers } from "../../schema.ts";

export const resolver: NodeResolvers["__resolveType"] = (parent, _ctx) => {
  return parent.type;
};
