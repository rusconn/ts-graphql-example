import { splitNodeId } from "@/adapters";
import { ParseError } from "@/errors";
import type { Graph } from "@/graphql/types";

export const parsers = {
  Query: {
    node: (args: Graph.QueryNodeArgs) => {
      const { id } = args;

      try {
        return splitNodeId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("parse failed", e);
        }

        throw e;
      }
    },
  },
};
