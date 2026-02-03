import type { NodeResolvers } from "../../schema.ts";

export const resolver: NodeResolvers["__resolveType"] = (parent, _context) => {
  return parent.type;
};
