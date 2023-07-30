import path from "node:path";

import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

// TODO: 並行ロードする。Promise を広げるのではなく top-level await を使いたい。
const typesArray = loadFilesSync(path.join(__dirname, "./typeDefs"));
const resolversArray = loadFilesSync(path.join(__dirname, "./resolvers"));

const typeDefs = mergeTypeDefs(typesArray);
const resolvers = mergeResolvers(resolversArray);

export const schema = makeExecutableSchema({ typeDefs, resolvers });
