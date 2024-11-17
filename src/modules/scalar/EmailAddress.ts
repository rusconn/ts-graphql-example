import { EmailAddressResolver, EmailAddressTypeDefinition } from "graphql-scalars";
import type { Tagged } from "type-fest";

export type EmailAddress = Tagged<string, "EmailAddress">;

export const typeDef = EmailAddressTypeDefinition;

export const resolver = EmailAddressResolver;
