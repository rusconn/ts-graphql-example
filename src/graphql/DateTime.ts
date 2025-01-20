import { DateTimeResolver, DateTimeTypeDefinition } from "graphql-scalars";
import type { Tagged } from "type-fest";

export type DateTime = Tagged<string, "DateTime">;

export const typeDef = DateTimeTypeDefinition;

export const resolver = DateTimeResolver;
