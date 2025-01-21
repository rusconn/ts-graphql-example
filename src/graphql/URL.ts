import { URLResolver, URLTypeDefinition } from "graphql-scalars";
import type { Tagged } from "type-fest";

export type URL = Tagged<string, "URL">;

export const typeDef = URLTypeDefinition;

export const resolver = URLResolver;
