import { EmailAddressResolver, EmailAddressTypeDefinition } from "graphql-scalars";

export type { EmailAddress } from "../lib/string/emailAddress.ts";

export const typeDef = EmailAddressTypeDefinition;

export const resolver = EmailAddressResolver;
