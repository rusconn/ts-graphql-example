import * as scalars from "graphql-scalars";

import * as nodes from "@/nodes";

export const resolvers = { ...scalars.resolvers, ...nodes.resolvers };
