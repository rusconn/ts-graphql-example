import { DateTimeResolver, DateTimeTypeDefinition } from "graphql-scalars";

export type { DateTime } from "../lib/string/date-time.ts";

export const typeDef = DateTimeTypeDefinition;

export const resolver = DateTimeResolver;
