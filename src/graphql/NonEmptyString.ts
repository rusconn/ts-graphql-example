import { NonEmptyStringResolver, NonEmptyStringTypeDefinition } from "graphql-scalars";

export type { NonEmptyString } from "../lib/string/nonEmptyString.ts";

export const typeDef = NonEmptyStringTypeDefinition;

export const resolver = NonEmptyStringResolver;
