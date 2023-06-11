import type { Graph } from "@/graphql/types";
import { parseNodeId } from "@/graphql/utils";

export default {
  Query: {
    node: ({ id }: Graph.QueryNodeArgs) => {
      return parseNodeId(id);
    },
  },
};
