import { makeExecutableSchema } from "@graphql-tools/schema";

import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./typeDefs.ts";

export const schema = makeExecutableSchema({ typeDefs, resolvers });
