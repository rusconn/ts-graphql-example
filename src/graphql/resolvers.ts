import { NonEmptyStringResolver, DateTimeResolver, EmailAddressResolver } from "graphql-scalars";

import * as nodes from "@/graphql/nodes";

const scalarResolvers = {
  NonEmptyString: NonEmptyStringResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
};

export const resolvers = { ...scalarResolvers, ...nodes.resolvers };
