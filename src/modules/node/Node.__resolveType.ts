import type { NodeResolvers } from "../common/schema.js";

export const resolver: NodeResolvers["__resolveType"] = (parent, _context) => {
  return parent.type;
};
