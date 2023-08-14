import { DateTimeResolver, EmailAddressResolver, NonEmptyStringResolver } from "graphql-scalars";

import type * as Graph from "../common/schema";

export const resolvers: Graph.Resolvers = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  NonEmptyString: NonEmptyStringResolver,
};
