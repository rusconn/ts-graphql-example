import { DateTimeISOResolver, DateTimeISOTypeDefinition } from "graphql-scalars";
import type { Tagged } from "type-fest";

export type DateTimeISO = Tagged<string, "DateTimeISO">;

export const typeDef = DateTimeISOTypeDefinition;

export const resolver = DateTimeISOResolver;
