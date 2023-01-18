import type { Graph } from "@/graphql/types";
import { parseNodeId } from "@/graphql/utils";

export const parsers = {
  Query: {
    node: (args: Graph.QueryNodeArgs) => {
      const { id } = args;

      return parseNodeId(id);
    },
  },
};
