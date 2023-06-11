import type { Graph } from "@/graphql/types";
import { parseNodeId } from "@/graphql/utils";

export const parsers = {
  Query: {
    node: ({ id }: Graph.QueryNodeArgs) => {
      return parseNodeId(id);
    },
  },
};
