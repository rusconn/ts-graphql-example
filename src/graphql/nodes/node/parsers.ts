import { ParseError } from "@/errors";
import type { Graph } from "@/graphql/types";
import { isId } from "@/ids";

export const parsers = {
  Query: {
    node: (args: Graph.QueryNodeArgs) => {
      const { id } = args;

      if (!isId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
};
