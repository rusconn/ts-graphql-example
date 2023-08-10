import { NonEmptyStringResolver, DateTimeResolver, EmailAddressResolver } from "graphql-scalars";

import type * as Graph from "../common/schema";

export const resolvers: Graph.Resolvers = {
  NonEmptyString: NonEmptyStringResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
};
