import { DateTimeResolver, DateTimeTypeDefinition } from "graphql-scalars";

export type { DateTime } from "../lib/string/dateTime.ts";

export const typeDef = DateTimeTypeDefinition;

export const resolver = DateTimeResolver;
