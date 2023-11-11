import { DateTimeResolver, DateTimeTypeDefinition } from "graphql-scalars";
import type { Opaque } from "type-fest";

export type DateTime = Opaque<string, "DateTime">;

export const typeDef = DateTimeTypeDefinition;

export const resolver = DateTimeResolver;
