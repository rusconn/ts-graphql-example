import { NonEmptyStringResolver, NonEmptyStringTypeDefinition } from "graphql-scalars";
import type { Opaque } from "type-fest";

export type NonEmptyString = Opaque<string, "NonEmptyString">;

export const typeDef = NonEmptyStringTypeDefinition;

export const resolver = NonEmptyStringResolver;
