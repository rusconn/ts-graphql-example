import { NonEmptyStringResolver, NonEmptyStringTypeDefinition } from "graphql-scalars";
import type { Tagged } from "type-fest";

export type NonEmptyString = Tagged<string, "NonEmptyString">;

export const typeDef = NonEmptyStringTypeDefinition;

export const resolver = NonEmptyStringResolver;
