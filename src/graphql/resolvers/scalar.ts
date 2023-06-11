import { NonEmptyStringResolver, DateTimeResolver, EmailAddressResolver } from "graphql-scalars";

import type { Graph } from "@/graphql/types";

export const resolvers: Graph.Resolvers = {
  NonEmptyString: NonEmptyStringResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
};
