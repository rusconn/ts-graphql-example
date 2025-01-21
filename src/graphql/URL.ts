import { URLResolver, URLTypeDefinition } from "graphql-scalars";

export type { URL } from "../lib/string/url.ts";

export const typeDef = URLTypeDefinition;

export const resolver = URLResolver;
