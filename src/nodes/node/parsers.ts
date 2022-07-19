import { ParseError } from "@/errors";
import type { QueryNodeArgs } from "@/types";
import { assertIsNodeId } from "@/utils";

export const parsers = {
  Query: {
    node: (args: QueryNodeArgs) => {
      const { id } = args;

      try {
        assertIsNodeId(id);
      } catch (e) {
        throw new ParseError("invalid `id`");
      }

      return { nodeId: id };
    },
  },
};
