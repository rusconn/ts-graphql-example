import { NonEmptyStringResolver, DateTimeResolver } from "graphql-scalars";

import * as nodes from "@/nodes";

const scalarResolvers = {
  NonEmptyString: NonEmptyStringResolver,
  DateTime: DateTimeResolver,
};

export const resolvers = { ...scalarResolvers, ...nodes.resolvers };
