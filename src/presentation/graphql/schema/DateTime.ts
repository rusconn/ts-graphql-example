import { DateTimeResolver, DateTimeTypeDefinition } from "graphql-scalars";

export type { DateTime } from "../../../util/date-time.ts";

export const typeDef = DateTimeTypeDefinition;

export const resolver = DateTimeResolver;
